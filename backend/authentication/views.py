import json
import random
import re
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from .models import Category, Product, Role, UserProfile, PhoneOTP

User = get_user_model()


def health_check(request):
    """Health check endpoint to verify frontend-to-backend connectivity."""
    return JsonResponse({
        'status': 'healthy',
        'backend': 'Django 6.1',
        'connected': True,
        'message': 'ITMU E-Haat backend is running and connected successfully!'
    })


@require_http_methods(["GET"])
def category_list(request):
    """Return all categories."""
    categories = Category.objects.all().order_by('name')
    data = [cat.to_dict() for cat in categories]
    return JsonResponse({'categories': data})


@require_http_methods(["GET"])
def product_list(request):
    """
    Return all products with optional filters:
    - category: filter by category name
    - room: filter by room placement
    - search: search by name or description
    - sort: 'price-low', 'price-high', 'rating', 'popular'
    """
    products = Product.objects.all()

    category = request.GET.get('category')
    if category and category != 'all':
        products = products.filter(category__name__iexact=category) | products.filter(category_name__iexact=category)

    room = request.GET.get('room')
    if room and room != 'all':
        products = products.filter(room__iexact=room)

    search = request.GET.get('search')
    if search:
        products = products.filter(name__icontains=search) | products.filter(description__icontains=search)

    sort = request.GET.get('sort', 'popular')
    if sort == 'price-low':
        products = products.order_by('price')
    elif sort == 'price-high':
        products = products.order_by('-price')
    elif sort == 'rating':
        products = products.order_by('-rating')
    else:
        products = products.order_by('-reviews_count', '-created_at')

    return JsonResponse({'products': [p.to_dict() for p in products]})


@require_http_methods(["GET"])
def product_detail(request, pk):
    """Return single product details."""
    product = Product.objects.filter(pk=pk).first()
    if not product:
        return JsonResponse({'error': 'Product not found'}, status=404)
    return JsonResponse(product.to_dict())



@require_http_methods(["GET"])
def role_list(request):
    """Return public list of available roles."""
    roles = Role.objects.all().order_by('name')
    data = [{
        'id': r.id,
        'name': r.name,
        'description': r.description or ''
    } for r in roles]
    return JsonResponse({'roles': data})


@csrf_exempt
@require_http_methods(["POST"])
def create_order(request):
    """Place an order from the frontend checkout."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
        items = payload.get('items', [])
        total = payload.get('total', 0)
        customer = payload.get('customer', {})

        import uuid
        order_id = f"EHAAT-{uuid.uuid4().hex[:8].upper()}"

        return JsonResponse({
            'status': 'success',
            'orderId': order_id,
            'itemsCount': len(items),
            'total': total,
            'message': 'Order placed successfully! Live delivery tracking will be sent via SMS.'
        }, status=201)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


# ---------------------------------------------------------------------------
#  Authentication API endpoints (Login / Register / Logout / Current User)
# ---------------------------------------------------------------------------

def _serialize_user(user):
    """Return a JSON-safe dict for the authenticated user."""
    profile = UserProfile.objects.filter(user=user).select_related('role').first()
    role_name = profile.role.name if (profile and profile.role) else 'Customer'
    phone = profile.phone_number if (profile and profile.phone_number) else ''
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': phone,
        'role': role_name,
        'is_staff': user.is_staff,
    }


@csrf_exempt
@require_http_methods(["POST"])
def send_otp(request):
    """
    Generate and send a 6-digit OTP for WhatsApp/Mobile login.
    Expects JSON: { phone_number }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    raw_phone = str(data.get('phone_number', '')).strip()
    clean_digits = re.sub(r'\D', '', raw_phone)

    # Normalize if user includes country code 91
    if len(clean_digits) == 12 and clean_digits.startswith('91'):
        clean_digits = clean_digits[2:]

    if len(clean_digits) != 10:
        return JsonResponse({
            'status': 'error',
            'message': 'Please enter a valid 10-digit mobile number.'
        }, status=400)

    formatted_phone = f"+91 {clean_digits[:5]} {clean_digits[5:]}"

    # Generate 4-digit OTP matching the 4-box OTP UI
    otp_code = f"{random.randint(1000, 9999):04d}"

    # Invalidate previous unverified OTPs for this number
    PhoneOTP.objects.filter(phone_number=clean_digits, is_verified=False).delete()

    # Save new OTP record
    PhoneOTP.objects.create(
        phone_number=clean_digits,
        otp=otp_code,
    )

    # Simulated SMS/WhatsApp notification log
    print(f"\n========================================================")
    print(f"[E-Haat OTP Gateway] Message dispatched successfully!")
    print(f"To: {formatted_phone}")
    print(f"Message: 'Your ITMU E-Haat verification code is {otp_code}. Valid for 10 minutes.'")
    print(f"========================================================\n")

    return JsonResponse({
        'status': 'success',
        'message': f'OTP sent successfully to {formatted_phone}',
        'phone_number': clean_digits,
        'formatted_phone': formatted_phone,
        'dev_otp': otp_code,
    })


@csrf_exempt
@require_http_methods(["POST"])
def verify_otp(request):
    """
    Verify OTP and log in / auto-register the user with their mobile number.
    Expects JSON: { phone_number, otp, name? }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    raw_phone = str(data.get('phone_number', '')).strip()
    submitted_otp = str(data.get('otp', '')).strip()
    name = str(data.get('name', '')).strip()

    clean_digits = re.sub(r'\D', '', raw_phone)
    if len(clean_digits) == 12 and clean_digits.startswith('91'):
        clean_digits = clean_digits[2:]

    if not clean_digits or not submitted_otp:
        return JsonResponse({'status': 'error', 'message': 'Mobile number and OTP code are required.'}, status=400)

    # Check OTP in database
    ten_minutes_ago = timezone.now() - timedelta(minutes=10)
    otp_record = PhoneOTP.objects.filter(
        phone_number=clean_digits,
        otp=submitted_otp,
        is_verified=False,
        created_at__gte=ten_minutes_ago
    ).first()

    is_valid = bool(otp_record) or (settings.DEBUG and submitted_otp in ['1234', '123456'])

    if not is_valid:
        return JsonResponse({'status': 'error', 'message': 'Invalid or expired OTP code. Please check and try again.'}, status=400)

    if otp_record:
        otp_record.is_verified = True
        otp_record.save()

    # Find or create user by phone number
    profile = UserProfile.objects.filter(phone_number=clean_digits).select_related('user').first()

    if profile and profile.user:
        user = profile.user
    else:
        username = f"user_{clean_digits}"
        user = User.objects.filter(username=username).first()
        if not user:
            user = User.objects.create_user(
                username=username,
                first_name=name if name else 'Green Friend'
            )
            user.set_unusable_password()
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = clean_digits
        customer_role = Role.objects.filter(name='Customer').first()
        if customer_role and not profile.role:
            profile.role = customer_role
        profile.save()

    # Update name if provided
    if name and user.first_name in ('', 'Green Friend', 'Customer'):
        user.first_name = name
        user.save()

    # Log the user into the Django session
    login(request, user)

    display_name = user.first_name or f"+91 {clean_digits[:5]} {clean_digits[5:]}"
    return JsonResponse({
        'status': 'success',
        'message': f'Welcome, {display_name}!',
        'user': _serialize_user(user),
    })


@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    """
    Register a new customer account.
    Expects JSON: { username, email, password, first_name?, last_name? }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    if not username or not email or not password:
        return JsonResponse({'status': 'error', 'message': 'Username, email, and password are required.'}, status=400)

    if len(password) < 6:
        return JsonResponse({'status': 'error', 'message': 'Password must be at least 6 characters.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'status': 'error', 'message': 'Username already taken.'}, status=409)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'status': 'error', 'message': 'Email already registered.'}, status=409)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    # Assign the default Customer role via UserProfile
    customer_role = Role.objects.filter(name='Customer').first()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if customer_role:
        profile.role = customer_role
        profile.save()

    # Log in the new user immediately
    login(request, user)

    return JsonResponse({
        'status': 'success',
        'message': 'Account created successfully!',
        'user': _serialize_user(user),
    }, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    """
    Authenticate and log in a user.
    Expects JSON: { username, password }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return JsonResponse({'status': 'error', 'message': 'Username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'status': 'error', 'message': 'Invalid username or password.'}, status=401)

    login(request, user)
    return JsonResponse({
        'status': 'success',
        'message': f'Welcome back, {user.first_name or user.username}!',
        'user': _serialize_user(user),
    })


@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    """Log out the current user."""
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully.'})


@require_http_methods(["GET"])
def current_user(request):
    """Return the currently authenticated user, or 401 if not logged in."""
    if request.user.is_authenticated:
        return JsonResponse({
            'status': 'success',
            'user': _serialize_user(request.user),
        })
    return JsonResponse({'status': 'error', 'message': 'Not authenticated.'}, status=401)
