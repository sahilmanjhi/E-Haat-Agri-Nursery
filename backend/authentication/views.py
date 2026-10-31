import json
import random
import re
from datetime import timedelta
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from .models import Category, Product, Role, UserProfile, PhoneOTP, PasswordResetCode, Order, OrderItem

User = get_user_model()


def _is_admin_user(user):
    """Verify whether a user possesses authorized administrator privileges."""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    profile = UserProfile.objects.filter(user=user).select_related('role').first()
    if profile and profile.role and profile.role.name.lower() == 'admin':
        return True
    return False


def health_check(request):
    """Health check endpoint to verify frontend-to-backend connectivity."""
    return JsonResponse({
        'status': 'healthy',
        'backend': 'Django 6.1',
        'connected': True,
        'message': 'ITMU E-Haat backend is running and connected successfully!'
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
def category_list(request):
    """
    Return all categories (GET) or create a new category (POST - Admin only).
    """
    if request.method == "POST":
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to create categories.'
            }, status=403)

        try:
            payload = json.loads(request.body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

        name = str(payload.get('name', '')).strip()
        description = str(payload.get('description', '')).strip()
        if not name:
            return JsonResponse({'status': 'error', 'message': 'Category name is required.'}, status=400)

        cat, created = Category.objects.get_or_create(
            name__iexact=name,
            defaults={'name': name, 'description': description, 'created_by': request.user}
        )
        return JsonResponse({
            'status': 'success',
            'created': created,
            'category': cat.to_dict(),
            'message': f'Category "{cat.name}" {"created" if created else "already exists"}.'
        }, status=201 if created else 200)

    categories = Category.objects.all().order_by('name')
    data = [cat.to_dict() for cat in categories]
    return JsonResponse({'status': 'success', 'categories': data})


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "POST", "DELETE"])
def category_detail(request, pk):
    """
    GET: Return single category details.
    PUT/PATCH/POST: Update category name & description (Admin only).
    DELETE: Delete category (Admin only).
    """
    category = Category.objects.filter(pk=pk).first()
    if not category:
        return JsonResponse({'status': 'error', 'message': f'Category #{pk} not found.'}, status=404)

    if request.method == "DELETE":
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to delete categories.'
            }, status=403)

        cat_name = category.name
        # Any attached products will have category set to null automatically due to SET_NULL
        category.delete()
        return JsonResponse({
            'status': 'success',
            'message': f'Category "{cat_name}" was successfully removed.'
        })

    if request.method in ["PUT", "PATCH", "POST"]:
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to edit categories.'
            }, status=403)

        try:
            payload = json.loads(request.body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

        new_name = payload.get('name')
        if new_name is not None:
            new_name = str(new_name).strip()
            if not new_name:
                return JsonResponse({'status': 'error', 'message': 'Category name cannot be empty.'}, status=400)

            # Check if name collides with another category
            collision = Category.objects.filter(name__iexact=new_name).exclude(pk=category.pk).first()
            if collision:
                return JsonResponse({'status': 'error', 'message': f'Category with name "{new_name}" already exists.'}, status=400)

            category.name = new_name

        if 'description' in payload:
            category.description = str(payload['description']).strip()

        category.save()
        return JsonResponse({
            'status': 'success',
            'message': f'Category "{category.name}" updated successfully.',
            'category': category.to_dict()
        })

    # GET
    return JsonResponse({
        'status': 'success',
        'category': category.to_dict()
    })



@csrf_exempt
@require_http_methods(["GET", "POST"])
def product_list(request):
    """
    GET: Return all products with optional filters:
      - category: filter by category name or ID
      - in_stock: filter by stock status ('true' or 'false')
      - tag: filter by badge tag ('bestseller', 'trending', etc.)
      - room: filter by room placement
      - search: search by name, botanical name, or description
      - sort: 'price-low', 'price-high', 'rating', 'popular', 'newest', 'name'
    POST: Create a new product (Admin privileges required)
    """
    if request.method == "POST":
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to add new products.'
            }, status=403)

        try:
            payload = json.loads(request.body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

        name = str(payload.get('name', '')).strip()
        if not name:
            return JsonResponse({'status': 'error', 'message': 'Product name is required.'}, status=400)

        try:
            price = Decimal(str(payload.get('price', 0)))
            if price < 0:
                raise ValueError()
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'A valid positive price is required.'}, status=400)

        orig_price = None
        raw_orig = payload.get('original_price') or payload.get('originalPrice')
        if raw_orig is not None and str(raw_orig).strip():
            try:
                orig_price = Decimal(str(raw_orig))
            except Exception:
                orig_price = price
        else:
            orig_price = price

        discount = payload.get('discount', 0)
        try:
            discount = int(discount)
        except (ValueError, TypeError):
            if orig_price and orig_price > price:
                discount = round((orig_price - price) / orig_price * 100)
            else:
                discount = 0

        # Category resolution
        cat_instance = None
        cat_input = payload.get('category_id') or payload.get('categoryId') or payload.get('category')
        if cat_input:
            if isinstance(cat_input, int) or (isinstance(cat_input, str) and cat_input.isdigit()):
                cat_instance = Category.objects.filter(id=int(cat_input)).first()
            if not cat_instance:
                cat_instance = Category.objects.filter(name__iexact=str(cat_input)).first()
            if not cat_instance and isinstance(cat_input, str) and cat_input.strip() and cat_input != 'all':
                cat_instance, _ = Category.objects.get_or_create(
                    name=cat_input.strip(),
                    defaults={'description': f'Collection for {cat_input.strip()}'}
                )

        product = Product.objects.create(
            name=name,
            botanical_name=payload.get('botanical_name') or payload.get('botanicalName') or '',
            category=cat_instance,
            tag=payload.get('tag') or '',
            price=price,
            original_price=orig_price,
            discount=discount,
            rating=float(payload.get('rating', 5.0)),
            reviews_count=int(payload.get('reviews_count') or payload.get('reviewsCount') or 0),
            in_stock=bool(payload.get('in_stock', payload.get('inStock', True))),
            stock_quantity=max(0, int(payload.get('stock_quantity') or payload.get('stockQuantity') or 25)),
            reorder_level=max(0, int(payload.get('reorder_level') or payload.get('reorderLevel') or 5)),
            light=payload.get('light') or 'Bright Indirect Sunlight',
            water=payload.get('water') or 'Once a week',
            pet_friendly=bool(payload.get('pet_friendly', payload.get('petFriendly', False))),
            air_purifying=bool(payload.get('air_purifying', payload.get('airPurifying', False))),
            maintenance=payload.get('maintenance') or 'Easy / Low Maintenance',
            room=payload.get('room') or 'Living Room',
            description=payload.get('description') or '',
            image=payload.get('image') or '/images/plants/snake_plant.png',
            image_hover=payload.get('image_hover') or payload.get('imageHover') or payload.get('image') or '/images/plants/snake_plant.png'
        )

        return JsonResponse({
            'status': 'success',
            'message': f'Product "{product.name}" created successfully!',
            'product': product.to_dict()
        }, status=201)

    # GET: Filter and list products
    products = Product.objects.all().select_related('category')

    category = request.GET.get('category')
    if category and category != 'all':
        if category.isdigit():
            products = products.filter(category__id=int(category))
        else:
            products = products.filter(category__name__iexact=category)

    stock = request.GET.get('in_stock') or request.GET.get('stock')
    if stock is not None:
        if stock.lower() in ['true', '1', 'in_stock', 'instock']:
            products = products.filter(in_stock=True)
        elif stock.lower() in ['false', '0', 'out_of_stock', 'outofstock']:
            products = products.filter(in_stock=False)

    tag = request.GET.get('tag')
    if tag and tag != 'all':
        products = products.filter(tag__iexact=tag)

    room = request.GET.get('room')
    if room and room != 'all':
        products = products.filter(room__iexact=room)

    search = request.GET.get('search')
    if search:
        products = products.filter(
            Product.objects.filter(name__icontains=search) |
            Product.objects.filter(botanical_name__icontains=search) |
            Product.objects.filter(description__icontains=search)
        )

    sort = request.GET.get('sort', 'popular')
    if sort == 'price-low':
        products = products.order_by('price')
    elif sort == 'price-high':
        products = products.order_by('-price')
    elif sort == 'rating':
        products = products.order_by('-rating')
    elif sort == 'newest':
        products = products.order_by('-created_at')
    elif sort == 'name':
        products = products.order_by('name')
    else:
        products = products.order_by('-reviews_count', '-created_at')

    prods_list = [p.to_dict() for p in products]
    return JsonResponse({
        'status': 'success',
        'count': len(prods_list),
        'products': prods_list
    })


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "POST", "DELETE"])
def product_detail(request, pk):
    """
    GET: Return single product details.
    PUT/PATCH/POST: Update an existing product (Admin only).
    DELETE: Remove a product (Admin only).
    """
    product = Product.objects.filter(pk=pk).select_related('category').first()
    if not product:
        return JsonResponse({'status': 'error', 'message': f'Product #{pk} not found.'}, status=404)

    if request.method == "DELETE":
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to delete products.'
            }, status=403)

        product_name = product.name
        product.delete()
        return JsonResponse({
            'status': 'success',
            'message': f'Product "{product_name}" has been permanently removed.'
        })

    if request.method in ["PUT", "PATCH", "POST"]:
        if not _is_admin_user(request.user):
            return JsonResponse({
                'status': 'error',
                'code': 'ACCESS_DENIED',
                'message': 'Admin privileges required to edit products.'
            }, status=403)

        try:
            payload = json.loads(request.body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

        if 'name' in payload:
            name = str(payload['name']).strip()
            if not name:
                return JsonResponse({'status': 'error', 'message': 'Product name cannot be empty.'}, status=400)
            product.name = name

        if 'botanical_name' in payload or 'botanicalName' in payload:
            product.botanical_name = payload.get('botanical_name') or payload.get('botanicalName') or ''

        if 'price' in payload:
            try:
                product.price = Decimal(str(payload['price']))
            except Exception:
                return JsonResponse({'status': 'error', 'message': 'Invalid price value.'}, status=400)

        if 'original_price' in payload or 'originalPrice' in payload:
            val = payload.get('original_price') or payload.get('originalPrice')
            try:
                product.original_price = Decimal(str(val)) if val else product.price
            except Exception:
                pass

        if 'discount' in payload:
            try:
                product.discount = int(payload['discount'])
            except (ValueError, TypeError):
                pass
        elif product.original_price and product.original_price > product.price:
            product.discount = int(round((product.original_price - product.price) / product.original_price * 100))

        cat_input = payload.get('category_id') or payload.get('categoryId') or payload.get('category')
        if cat_input is not None:
            cat_instance = None
            if isinstance(cat_input, int) or (isinstance(cat_input, str) and cat_input.isdigit()):
                cat_instance = Category.objects.filter(id=int(cat_input)).first()
            if not cat_instance:
                cat_instance = Category.objects.filter(name__iexact=str(cat_input)).first()
            if not cat_instance and isinstance(cat_input, str) and cat_input.strip() and cat_input != 'all':
                cat_instance, _ = Category.objects.get_or_create(
                    name=cat_input.strip(),
                    defaults={'description': f'Collection for {cat_input.strip()}'}
                )
            if cat_instance:
                product.category = cat_instance

        if 'tag' in payload:
            product.tag = payload['tag']
        if 'stock_quantity' in payload or 'stockQuantity' in payload:
            try:
                sq = int(payload.get('stock_quantity', payload.get('stockQuantity')))
                product.stock_quantity = max(0, sq)
                if product.stock_quantity == 0:
                    product.in_stock = False
                elif 'in_stock' not in payload and 'inStock' not in payload:
                    product.in_stock = True
            except (ValueError, TypeError):
                pass
        if 'reorder_level' in payload or 'reorderLevel' in payload:
            try:
                product.reorder_level = max(0, int(payload.get('reorder_level', payload.get('reorderLevel'))))
            except (ValueError, TypeError):
                pass
        if 'in_stock' in payload or 'inStock' in payload:
            product.in_stock = bool(payload.get('in_stock', payload.get('inStock')))
            if not product.in_stock and product.stock_quantity > 0:
                pass
            elif product.in_stock and product.stock_quantity == 0:
                product.stock_quantity = max(product.reorder_level + 1, 10)
        if 'light' in payload:
            product.light = payload['light']
        if 'water' in payload:
            product.water = payload['water']
        if 'pet_friendly' in payload or 'petFriendly' in payload:
            product.pet_friendly = bool(payload.get('pet_friendly', payload.get('petFriendly')))
        if 'air_purifying' in payload or 'airPurifying' in payload:
            product.air_purifying = bool(payload.get('air_purifying', payload.get('airPurifying')))
        if 'maintenance' in payload:
            product.maintenance = payload['maintenance']
        if 'room' in payload:
            product.room = payload['room']
        if 'description' in payload:
            product.description = payload['description']
        if 'image' in payload and payload['image']:
            product.image = payload['image']
        if 'image_hover' in payload or 'imageHover' in payload:
            product.image_hover = payload.get('image_hover') or payload.get('imageHover')
        if 'rating' in payload:
            try:
                product.rating = float(payload['rating'])
            except (ValueError, TypeError):
                pass
        if 'reviews_count' in payload or 'reviewsCount' in payload:
            try:
                product.reviews_count = int(payload.get('reviews_count') or payload.get('reviewsCount'))
            except (ValueError, TypeError):
                pass

        product.save()
        return JsonResponse({
            'status': 'success',
            'message': f'Product "{product.name}" updated successfully!',
            'product': product.to_dict()
        })

    # GET request
    return JsonResponse({
        'status': 'success',
        'product': product.to_dict()
    })


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def product_toggle_stock(request, pk):
    """
    Rapid 1-click toggle for product in_stock availability.
    Accessible to authorized administrators.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to modify product stock status.'
        }, status=403)

    product = Product.objects.filter(pk=pk).first()
    if not product:
        return JsonResponse({'status': 'error', 'message': f'Product #{pk} not found.'}, status=404)

    # Check if explicit boolean provided
    try:
        if request.body:
            payload = json.loads(request.body.decode('utf-8'))
            if 'in_stock' in payload:
                product.in_stock = bool(payload['in_stock'])
            elif 'inStock' in payload:
                product.in_stock = bool(payload['inStock'])
            else:
                product.in_stock = not product.in_stock
        else:
            product.in_stock = not product.in_stock
    except Exception:
        product.in_stock = not product.in_stock

    product.save(update_fields=['in_stock'])
    return JsonResponse({
        'status': 'success',
        'id': str(product.id),
        'in_stock': product.in_stock,
        'message': f'Stock status for "{product.name}" updated to {"In Stock" if product.in_stock else "Out of Stock"}.',
        'product': product.to_dict()
    })


@require_http_methods(["GET"])
def inventory_summary(request):
    """
    Return comprehensive inventory telemetry metrics, categorized stock distribution,
    and live low-stock replenishment alert tracking.
    """
    total_products = Product.objects.count()
    all_products = list(Product.objects.all().select_related('category').order_by('category__name', 'name'))
    
    total_units = sum(getattr(p, 'stock_quantity', 25) for p in all_products)
    
    in_stock_items = []
    low_stock_items = []
    out_of_stock_items = []
    
    for p in all_products:
        p_dict = p.to_dict()
        qty = p_dict.get('stockQuantity', 25)
        reorder = p_dict.get('reorderLevel', 5)
        is_instock = p.in_stock and qty > 0
        
        if not is_instock or qty <= 0:
            out_of_stock_items.append(p_dict)
        elif qty <= reorder:
            low_stock_items.append(p_dict)
        else:
            in_stock_items.append(p_dict)

    health_pct = round((len(in_stock_items) / total_products * 100), 1) if total_products > 0 else 100.0

    # Category breakdown
    cat_distribution = []
    for cat in Category.objects.all().order_by('name'):
        cat_prods = [p for p in all_products if p.category_id == cat.id]
        cat_units = sum(getattr(p, 'stock_quantity', 25) for p in cat_prods)
        cat_instock = sum(1 for p in cat_prods if p.in_stock and getattr(p, 'stock_quantity', 25) > getattr(p, 'reorder_level', 5))
        cat_lowstock = sum(1 for p in cat_prods if 0 < getattr(p, 'stock_quantity', 25) <= getattr(p, 'reorder_level', 5))
        cat_outofstock = sum(1 for p in cat_prods if not p.in_stock or getattr(p, 'stock_quantity', 25) <= 0)
        
        cat_distribution.append({
            'id': cat.id,
            'name': cat.name,
            'total_varieties': len(cat_prods),
            'total_units': cat_units,
            'in_stock': cat_instock,
            'low_stock': cat_lowstock,
            'out_of_stock': cat_outofstock
        })

    return JsonResponse({
        'status': 'success',
        'metrics': {
            'total_products': total_products,
            'total_units': total_units,
            'in_stock_count': len(in_stock_items),
            'low_stock_count': len(low_stock_items),
            'out_of_stock_count': len(out_of_stock_items),
            'health_percentage': health_pct
        },
        'category_distribution': cat_distribution,
        'low_stock_alerts': low_stock_items + out_of_stock_items,
        'products': [p.to_dict() for p in all_products]
    })


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def inventory_quick_update(request, pk):
    """
    Rapidly update product inventory stock quantities, delta adjustments, and thresholds.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to update inventory levels.'
        }, status=403)

    product = Product.objects.filter(pk=pk).first()
    if not product:
        return JsonResponse({'status': 'error', 'message': f'Product #{pk} not found.'}, status=404)

    try:
        payload = json.loads(request.body.decode('utf-8')) if request.body else {}
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

    # 1. Direct quantity update
    if 'quantity' in payload or 'stock_quantity' in payload or 'stockQuantity' in payload:
        val = payload.get('quantity') if 'quantity' in payload else payload.get('stock_quantity', payload.get('stockQuantity'))
        try:
            product.stock_quantity = max(0, int(val))
        except (ValueError, TypeError):
            pass

    # 2. Relative delta adjustment (e.g. +10, -5)
    elif 'delta' in payload:
        try:
            delta = int(payload['delta'])
            product.stock_quantity = max(0, product.stock_quantity + delta)
        except (ValueError, TypeError):
            pass

    # 3. Reorder level update
    if 'reorder_level' in payload or 'reorderLevel' in payload:
        try:
            val = payload.get('reorder_level', payload.get('reorderLevel'))
            product.reorder_level = max(0, int(val))
        except (ValueError, TypeError):
            pass

    # 4. Explicit in_stock or automatic sync
    if 'in_stock' in payload or 'inStock' in payload:
        product.in_stock = bool(payload.get('in_stock', payload.get('inStock')))
    else:
        # Automatic sync: if quantity is 0, in_stock is False; if quantity > 0, in_stock is True
        product.in_stock = (product.stock_quantity > 0)

    product.save()

    return JsonResponse({
        'status': 'success',
        'message': f'Inventory for "{product.name}" updated to {product.stock_quantity} units.',
        'product': product.to_dict()
    })


@csrf_exempt
@require_http_methods(["POST"])
def inventory_batch_restock(request):
    """
    Batch restock multiple catalog items simultaneously.
    Payload: { ids: [1, 2, 3], add_units: 25 } or { items: [{ id: 1, quantity: 50 }, ...] }
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to batch restock inventory.'
        }, status=403)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

    updated_count = 0

    if 'items' in payload and isinstance(payload['items'], list):
        for item in payload['items']:
            pid = item.get('id')
            qty = item.get('quantity')
            add = item.get('add_units')
            if pid:
                p = Product.objects.filter(pk=pid).first()
                if p:
                    if qty is not None:
                        p.stock_quantity = max(0, int(qty))
                    elif add is not None:
                        p.stock_quantity = max(0, p.stock_quantity + int(add))
                    p.in_stock = (p.stock_quantity > 0)
                    p.save(update_fields=['stock_quantity', 'in_stock'])
                    updated_count += 1

    elif 'ids' in payload and isinstance(payload['ids'], list):
        add_units = int(payload.get('add_units', 25))
        for pid in payload['ids']:
            p = Product.objects.filter(pk=pid).first()
            if p:
                p.stock_quantity = max(0, p.stock_quantity + add_units)
                p.in_stock = (p.stock_quantity > 0)
                p.save(update_fields=['stock_quantity', 'in_stock'])
                updated_count += 1

    return JsonResponse({
        'status': 'success',
        'updated_count': updated_count,
        'message': f'Successfully replenished inventory for {updated_count} products.'
    })



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
    """Place an order from the frontend checkout and persist to database."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
        items_data = payload.get('items', [])
        total = payload.get('total', 0)
        customer = payload.get('customer', {})
        shipping_fee = payload.get('shipping_fee', 0)
        payment_method = payload.get('payment_method', 'cod')

        import uuid
        order_id = f"EHAAT-{uuid.uuid4().hex[:8].upper()}"

        user = request.user if request.user.is_authenticated else None

        # Build address string
        address = customer.get('address', '')
        city = customer.get('city', '')
        state = customer.get('state', '')
        pincode = customer.get('pincode', '')

        # Calculate subtotal
        subtotal = float(total) - float(shipping_fee) if total else 0.0

        order = Order.objects.create(
            order_id=order_id,
            user=user,
            customer_name=customer.get('name', 'Customer'),
            customer_email=customer.get('email', ''),
            customer_phone=customer.get('phone', ''),
            delivery_address=address,
            city=city,
            state=state,
            pincode=pincode,
            payment_method=payment_method,
            payment_status='paid' if payment_method in ['online', 'upi', 'card'] else 'pending',
            status='pending',
            subtotal=Decimal(str(max(0, subtotal))),
            shipping_fee=Decimal(str(shipping_fee)),
            total_amount=Decimal(str(total)),
            notes=customer.get('notes', '')
        )

        for itm in items_data:
            prod_id = itm.get('id')
            prod = Product.objects.filter(id=prod_id).first() if prod_id else None
            qty = max(1, int(itm.get('quantity', 1)))
            unit_price = Decimal(str(itm.get('price', prod.price if prod else 0)))
            total_price = unit_price * qty

            OrderItem.objects.create(
                order=order,
                product=prod,
                product_name=itm.get('name', prod.name if prod else 'Plant'),
                product_image=itm.get('image', prod.image if prod else ''),
                pot_option=itm.get('selectedPot', itm.get('pot_option', '')),
                size_option=itm.get('selectedSize', itm.get('size_option', '')),
                unit_price=unit_price,
                quantity=qty,
                total_price=total_price
            )

            # Deduct stock if product exists
            if prod:
                prod.stock_quantity = max(0, prod.stock_quantity - qty)
                prod.in_stock = (prod.stock_quantity > 0)
                prod.save(update_fields=['stock_quantity', 'in_stock'])

        return JsonResponse({
            'status': 'success',
            'orderId': order.order_id,
            'order': order.to_dict(),
            'itemsCount': len(items_data),
            'total': float(order.total_amount),
            'message': f'Order {order.order_id} placed successfully! Tracking link generated.'
        }, status=201)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@require_http_methods(["GET"])
def admin_orders_list(request):
    """
    Return all customer orders with filtering, searching, sorting, and telemetry metrics.
    Admin authorization required.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to access order management.'
        }, status=403)

    qs = Order.objects.all().prefetch_related('items', 'items__product')

    # Telemetry metrics across all orders
    all_orders = list(qs)
    total_orders = len(all_orders)
    def _norm_status(val):
        return (val or '').lower().replace(' ', '_').strip()

    total_revenue = sum(float(o.total_amount) for o in all_orders if _norm_status(o.status) != 'cancelled')
    pending_count = sum(1 for o in all_orders if _norm_status(o.status) == 'pending')
    processing_count = sum(1 for o in all_orders if _norm_status(o.status) == 'processing')
    dispatched_count = sum(1 for o in all_orders if _norm_status(o.status) == 'dispatched')
    out_for_delivery_count = sum(1 for o in all_orders if _norm_status(o.status) in ['out_for_delivery', 'out for delivery'])
    delivered_count = sum(1 for o in all_orders if _norm_status(o.status) == 'delivered')
    cancelled_count = sum(1 for o in all_orders if _norm_status(o.status) == 'cancelled')

    # Status filter
    status_filter = request.GET.get('status', '').strip().lower()
    if status_filter and status_filter != 'all':
        if status_filter == 'out_for_delivery':
            from django.db.models import Q
            qs = qs.filter(Q(status__iexact='out_for_delivery') | Q(status__iexact='out for delivery'))
        else:
            qs = qs.filter(status__iexact=status_filter)

    # Search filter
    search_query = request.GET.get('search', '').strip()
    if search_query:
        from django.db.models import Q
        qs = qs.filter(
            Q(order_id__icontains=search_query) |
            Q(customer_name__icontains=search_query) |
            Q(customer_email__icontains=search_query) |
            Q(customer_phone__icontains=search_query) |
            Q(city__icontains=search_query) |
            Q(tracking_number__icontains=search_query)
        )

    # Sort
    sort_by = request.GET.get('sort', '-created_at')
    valid_sorts = ['created_at', '-created_at', 'total_amount', '-total_amount', 'status']
    if sort_by in valid_sorts:
        qs = qs.order_by(sort_by)
    else:
        qs = qs.order_by('-created_at')

    orders_data = [o.to_dict() for o in qs]

    return JsonResponse({
        'status': 'success',
        'metrics': {
            'total_orders': total_orders,
            'total_revenue': round(total_revenue, 2),
            'pending_count': pending_count,
            'processing_count': processing_count,
            'dispatched_count': dispatched_count,
            'out_for_delivery_count': out_for_delivery_count,
            'delivered_count': delivered_count,
            'cancelled_count': cancelled_count,
        },
        'count': len(orders_data),
        'orders': orders_data
    })


@require_http_methods(["GET"])
def admin_order_detail(request, pk):
    """
    Return comprehensive details for a specific order by ID or order_id string.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to view order details.'
        }, status=403)

    order = None
    if isinstance(pk, int) or (isinstance(pk, str) and pk.isdigit()):
        order = Order.objects.filter(pk=int(pk)).prefetch_related('items', 'items__product').first()
    if not order and isinstance(pk, str):
        order = Order.objects.filter(order_id__iexact=pk).prefetch_related('items', 'items__product').first()

    if not order:
        return JsonResponse({'status': 'error', 'message': f'Order #{pk} not found.'}, status=404)

    return JsonResponse({
        'status': 'success',
        'order': order.to_dict()
    })


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def admin_order_update_status(request, pk):
    """
    Update order status, delivery tracking number, notes, and payment status.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to update orders.'
        }, status=403)

    order = None
    if isinstance(pk, int) or (isinstance(pk, str) and pk.isdigit()):
        order = Order.objects.filter(pk=int(pk)).first()
    if not order and isinstance(pk, str):
        order = Order.objects.filter(order_id__iexact=pk).first()

    if not order:
        return JsonResponse({'status': 'error', 'message': f'Order #{pk} not found.'}, status=404)

    try:
        payload = json.loads(request.body.decode('utf-8')) if request.body else {}
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

    # Allowed statuses
    valid_statuses = ['pending', 'processing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled']
    if 'status' in payload:
        new_status = str(payload['status']).strip().lower()
        if new_status in valid_statuses:
            order.status = new_status
            if new_status == 'delivered' and order.payment_status == 'pending' and order.payment_method == 'cod':
                order.payment_status = 'paid'

    if 'payment_status' in payload:
        order.payment_status = str(payload['payment_status']).strip().lower()

    if 'tracking_number' in payload:
        order.tracking_number = str(payload['tracking_number']).strip()

    if 'notes' in payload:
        order.notes = str(payload['notes']).strip()

    order.save()

    return JsonResponse({
        'status': 'success',
        'message': f'Order {order.order_id} updated to status "{order.get_status_display()}".',
        'order': order.to_dict()
    })


# ---------------------------------------------------------------------------
#  Admin Customer Management Endpoints
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def admin_customers_list(request):
    """
    Return all registered customer accounts with order telemetry, search, and filtering.
    Admin authorization required.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to access customer management.'
        }, status=403)

    from django.db.models import Q

    # Query only customer accounts (exclude staff/superusers)
    qs = User.objects.filter(is_staff=False, is_superuser=False).select_related('profile', 'profile__role')

    all_users = list(qs)
    total_customers = len(all_users)
    active_customers = sum(1 for u in all_users if u.is_active)
    verified_phone_customers = sum(1 for u in all_users if hasattr(u, 'profile') and u.profile and u.profile.phone_number)

    # Calculate real order counts and spend for all customers
    user_orders_map = {}
    for ord in Order.objects.all():
        if ord.user_id:
            user_orders_map.setdefault(ord.user_id, []).append(ord)
        elif ord.customer_email:
            matched_u = next((u for u in all_users if u.email and u.email.lower() == ord.customer_email.lower()), None)
            if matched_u:
                user_orders_map.setdefault(matched_u.id, []).append(ord)

    customers_with_orders = sum(1 for uid in user_orders_map if len(user_orders_map[uid]) > 0)

    # Search filter
    search_query = request.GET.get('search', '').strip()
    if search_query:
        qs = qs.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(profile__phone_number__icontains=search_query)
        )

    # Status filter
    status_filter = request.GET.get('status', 'all').strip().lower()
    if status_filter == 'active':
        qs = qs.filter(is_active=True)
    elif status_filter == 'inactive':
        qs = qs.filter(is_active=False)

    customers_data = []
    for u in qs:
        phone = u.profile.phone_number if (hasattr(u, 'profile') and u.profile) else ''
        role_name = u.profile.role.name if (hasattr(u, 'profile') and u.profile and u.profile.role) else 'Customer'
        full_name = f"{u.first_name} {u.last_name}".strip() or u.username
        if full_name == 'Green Friend' and phone:
            display_name = f"Member ({phone[-4:]})"
        else:
            display_name = full_name

        orders = user_orders_map.get(u.id, [])
        orders_count = len(orders)
        total_spent = sum(float(o.total_amount) for o in orders if o.status != 'cancelled')

        if status_filter == 'with_orders' and orders_count == 0:
            continue

        customers_data.append({
            'id': u.id,
            'username': u.username,
            'name': display_name,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email or '—',
            'phone': phone or '—',
            'role': role_name,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%d %b %Y, %I:%M %p') if u.date_joined else '—',
            'date_joined_short': u.date_joined.strftime('%d %b %Y') if u.date_joined else '—',
            'last_login': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
            'orders_count': orders_count,
            'total_spent': round(total_spent, 2)
        })

    # Sort
    sort_by = request.GET.get('sort', '-date_joined')
    if sort_by == 'name':
        customers_data.sort(key=lambda c: c['name'].lower())
    elif sort_by == '-orders_count':
        customers_data.sort(key=lambda c: c['orders_count'], reverse=True)
    elif sort_by == '-total_spent':
        customers_data.sort(key=lambda c: c['total_spent'], reverse=True)
    elif sort_by == 'date_joined':
        customers_data.sort(key=lambda c: c['id'])
    else:  # -date_joined
        customers_data.sort(key=lambda c: c['id'], reverse=True)

    return JsonResponse({
        'status': 'success',
        'metrics': {
            'total_customers': total_customers,
            'active_customers': active_customers,
            'verified_phone_customers': verified_phone_customers,
            'customers_with_orders': customers_with_orders,
        },
        'count': len(customers_data),
        'customers': customers_data
    })


@require_http_methods(["GET"])
def admin_customer_detail(request, pk):
    """
    Return comprehensive profile and purchase history for a specific customer.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to view customer details.'
        }, status=403)

    u = User.objects.filter(pk=pk).select_related('profile', 'profile__role').first()
    if not u:
        return JsonResponse({'status': 'error', 'message': f'Customer #{pk} not found.'}, status=404)

    phone = u.profile.phone_number if (hasattr(u, 'profile') and u.profile) else ''
    role_name = u.profile.role.name if (hasattr(u, 'profile') and u.profile and u.profile.role) else 'Customer'
    full_name = f"{u.first_name} {u.last_name}".strip() or u.username

    from django.db.models import Q
    customer_orders = Order.objects.filter(
        Q(user=u) | (Q(customer_email__iexact=u.email) if u.email else Q(pk__isnull=True))
    ).prefetch_related('items').order_by('-created_at')

    orders_data = [o.to_dict() for o in customer_orders]
    total_spent = sum(float(o.total_amount) for o in customer_orders if o.status != 'cancelled')

    return JsonResponse({
        'status': 'success',
        'customer': {
            'id': u.id,
            'username': u.username,
            'name': full_name,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email or '—',
            'phone': phone or '—',
            'role': role_name,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%d %b %Y, %I:%M %p') if u.date_joined else '—',
            'last_login': u.last_login.strftime('%d %b %Y, %I:%M %p') if u.last_login else 'Never',
            'orders_count': len(orders_data),
            'total_spent': round(total_spent, 2),
            'orders': orders_data
        }
    })


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def admin_customer_toggle_status(request, pk):
    """
    Toggle customer account is_active status (activate or suspend).
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to modify customer status.'
        }, status=403)

    u = User.objects.filter(pk=pk).first()
    if not u:
        return JsonResponse({'status': 'error', 'message': f'Customer #{pk} not found.'}, status=404)

    u.is_active = not u.is_active
    u.save(update_fields=['is_active'])

    return JsonResponse({
        'status': 'success',
        'id': u.id,
        'is_active': u.is_active,
        'message': f'Customer "{u.first_name or u.username}" status changed to {"Active" if u.is_active else "Suspended"}.'
    })


@csrf_exempt
@require_http_methods(["POST"])
def admin_customer_create(request):
    """
    Register a new customer account directly from the Admin Portal.
    """
    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Admin privileges required to create customers.'
        }, status=403)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body.'}, status=400)

    first_name = str(data.get('first_name', '')).strip()
    last_name = str(data.get('last_name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    raw_phone = str(data.get('phone_number', data.get('phone', ''))).strip()

    if not first_name:
        return JsonResponse({'status': 'error', 'message': 'First name is required.'}, status=400)

    clean_phone = re.sub(r'\D', '', raw_phone)
    if len(clean_phone) == 12 and clean_phone.startswith('91'):
        clean_phone = clean_phone[2:]

    if email and User.objects.filter(email__iexact=email).exists():
        return JsonResponse({'status': 'error', 'message': f'An account with email {email} already exists.'}, status=409)

    # Generate username
    if email:
        base_user = re.sub(r'[^a-zA-Z0-9_]', '', email.split('@')[0]) or 'user'
    elif clean_phone:
        base_user = f"user_{clean_phone}"
    else:
        base_user = re.sub(r'[^a-zA-Z0-9_]', '', first_name.lower()) or 'customer'

    candidate = base_user
    idx = 1
    while User.objects.filter(username__iexact=candidate).exists():
        candidate = f"{base_user}_{idx}"
        idx += 1
    username = candidate

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    user.set_unusable_password()
    user.save()

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if clean_phone:
        profile.phone_number = clean_phone
    customer_role = Role.objects.filter(name='Customer').first()
    if customer_role:
        profile.role = customer_role
    profile.save()

    return JsonResponse({
        'status': 'success',
        'message': f'Customer "{first_name}" created successfully!',
        'customer': {
            'id': user.id,
            'username': user.username,
            'name': f"{first_name} {last_name}".strip(),
            'email': user.email or '—',
            'phone': clean_phone or '—',
            'role': 'Customer',
            'is_active': True,
            'date_joined': user.date_joined.strftime('%d %b %Y, %I:%M %p'),
            'orders_count': 0,
            'total_spent': 0.0
        }
    }, status=201)


# ---------------------------------------------------------------------------
#  Authentication API endpoints (Login / Register / Logout / Current User)
# ---------------------------------------------------------------------------

def _serialize_user(user):
    """Return a JSON-safe dict for the authenticated user."""
    profile = UserProfile.objects.filter(user=user).select_related('role').first()
    role_name = profile.role.name if (profile and profile.role) else 'Customer'
    phone = profile.phone_number if (profile and profile.phone_number) else ''
    is_admin = bool(user.is_staff or user.is_superuser or (role_name.lower() == 'admin'))
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': phone,
        'role': role_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'is_admin': is_admin,
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
    Create a new account.
    Expects JSON: { first_name, email, password, phone_number?, username? }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    first_name = str(data.get('first_name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    raw_phone = str(data.get('phone_number', '')).strip()
    username = str(data.get('username', '')).strip()

    # Validation
    if not first_name:
        return JsonResponse({'status': 'error', 'message': 'First name is required.'}, status=400)

    if not email:
        return JsonResponse({'status': 'error', 'message': 'Email address is required.'}, status=400)

    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        return JsonResponse({'status': 'error', 'message': 'Please enter a valid email address.'}, status=400)

    if not password or len(password) < 6:
        return JsonResponse({'status': 'error', 'message': 'Password must be at least 6 characters long.'}, status=400)

    # Check if email is already taken
    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({
            'status': 'error',
            'message': 'An account with this email address already exists. Please sign in.'
        }, status=409)

    # Clean phone digits
    clean_phone = re.sub(r'\D', '', raw_phone)
    if len(clean_phone) == 12 and clean_phone.startswith('91'):
        clean_phone = clean_phone[2:]

    # Generate unique username if not provided
    if not username:
        base_user = re.sub(r'[^a-zA-Z0-9_]', '', email.split('@')[0]) or 'user'
        candidate = base_user
        idx = 1
        while User.objects.filter(username__iexact=candidate).exists():
            candidate = f"{base_user}_{idx}"
            idx += 1
        username = candidate
    else:
        if User.objects.filter(username__iexact=username).exists():
            return JsonResponse({'status': 'error', 'message': 'Username already taken.'}, status=409)

    # Create user with properly hashed password
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
    )

    # Link profile and customer role
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if clean_phone:
        profile.phone_number = clean_phone
    customer_role = Role.objects.filter(name='Customer').first()
    if customer_role and not profile.role:
        profile.role = customer_role
    profile.save()

    # Log in user immediately
    login(request, user)

    return JsonResponse({
        'status': 'success',
        'message': f'Account created successfully! Welcome to E-Haat, {user.first_name}!',
        'user': _serialize_user(user),
    }, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    """
    Authenticate and log in a user using Email or Username + Password.
    Expects JSON: { identifier (or username/email), password }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    identifier = str(data.get('identifier') or data.get('username') or data.get('email') or '').strip()
    password = str(data.get('password') or '')

    if not identifier:
        return JsonResponse({'status': 'error', 'message': 'Please enter your email or username.'}, status=400)

    if not password:
        return JsonResponse({'status': 'error', 'message': 'Please enter your password.'}, status=400)

    # Resolve user by email or username
    matched_user = None
    if '@' in identifier:
        matched_user = User.objects.filter(email__iexact=identifier).first()
    else:
        matched_user = User.objects.filter(username__iexact=identifier).first()
        if not matched_user:
            # Fallback in case email was entered without @ (unlikely) or email match
            matched_user = User.objects.filter(email__iexact=identifier).first()

    auth_username = matched_user.username if matched_user else identifier
    user = authenticate(request, username=auth_username, password=password)

    if user is None:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid credentials. Please verify your email/username and password.'
        }, status=401)

    login(request, user)
    return JsonResponse({
        'status': 'success',
        'message': f'Welcome back, {user.first_name or user.username}!',
        'user': _serialize_user(user),
    })


@csrf_exempt
@require_http_methods(["POST"])
def forgot_password(request):
    """
    Initiate password reset by sending a 6-digit verification code to the user's email.
    Expects JSON: { email }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    email = str(data.get('email', '')).strip().lower()
    if not email or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        return JsonResponse({'status': 'error', 'message': 'Please enter a valid email address.'}, status=400)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        # Check by username if user passed their username
        user = User.objects.filter(username__iexact=email).first()

    if not user:
        return JsonResponse({
            'status': 'error',
            'message': 'No account was found with that email address. Please check and try again.'
        }, status=404)

    # Invalidate previous unused codes
    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)

    # Generate 6-digit verification code
    code = f"{random.randint(100000, 999999):06d}"
    reset_record = PasswordResetCode.objects.create(
        user=user,
        email=user.email or email,
        code=code
    )

    # Format email dispatch
    subject = "ITMU E-Haat - Password Reset Code"
    message = (
        f"Hello {user.first_name or user.username},\n\n"
        f"We received a request to reset your password for ITMU E-Haat.\n\n"
        f"Your verification code is: {code}\n\n"
        f"This code will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.\n\n"
        f"Happy Gardening,\n"
        f"The ITMU E-Haat Team\n"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@itmu-ehaat.in'),
            recipient_list=[user.email or email],
            fail_silently=False,
        )
    except Exception as mail_err:
        print(f"[Email Send Error] {mail_err}")

    # Dev console print for instant verification
    print(f"\n========================================================")
    print(f"[E-Haat Password Reset Gateway]")
    print(f"Target Email: {user.email or email}")
    print(f"Reset Verification Code: {code}")
    print(f"========================================================\n")

    return JsonResponse({
        'status': 'success',
        'message': f'A 6-digit reset code has been sent to {user.email or email}.',
        'email': user.email or email,
        'dev_code': code if settings.DEBUG else None,
    })


@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    """
    Verify reset code and update user's password.
    Expects JSON: { email, code, new_password }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    email = str(data.get('email', '')).strip().lower()
    code = str(data.get('code', '')).strip()
    new_password = str(data.get('new_password', ''))

    if not email or not code or not new_password:
        return JsonResponse({
            'status': 'error',
            'message': 'Email, verification code, and new password are required.'
        }, status=400)

    if len(new_password) < 6:
        return JsonResponse({
            'status': 'error',
            'message': 'New password must be at least 6 characters long.'
        }, status=400)

    fifteen_mins_ago = timezone.now() - timedelta(minutes=15)
    reset_entry = PasswordResetCode.objects.filter(
        email__iexact=email,
        code=code,
        is_used=False,
        created_at__gte=fifteen_mins_ago
    ).select_related('user').first()

    # Also check if debug override
    is_valid = bool(reset_entry) or (settings.DEBUG and code in ['123456', '999999'])

    if not is_valid:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid or expired verification code. Please request a new code.'
        }, status=400)

    # Retrieve user
    user = reset_entry.user if reset_entry else User.objects.filter(email__iexact=email).first()
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User account not found.'}, status=404)

    # Set new password properly hashed
    user.set_password(new_password)
    user.save()

    if reset_entry:
        reset_entry.is_used = True
        reset_entry.save()

    # Log user into new session
    login(request, user)

    return JsonResponse({
        'status': 'success',
        'message': 'Password has been successfully updated! You are now logged in.',
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


@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    """
    Authenticate an administrator and establish an admin session.
    Validates credentials and strictly checks authorized administrative permissions.
    Expects JSON: { email (or identifier), password }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    identifier = str(data.get('email') or data.get('identifier') or data.get('username') or '').strip()
    password = str(data.get('password') or '')

    if not identifier:
        return JsonResponse({'status': 'error', 'message': 'Please enter your administrator email address.'}, status=400)

    if not password:
        return JsonResponse({'status': 'error', 'message': 'Please enter your administrator password.'}, status=400)

    # Match user by email or username
    matched_user = None
    if '@' in identifier:
        matched_user = User.objects.filter(email__iexact=identifier).first()
    else:
        matched_user = User.objects.filter(username__iexact=identifier).first()
        if not matched_user:
            matched_user = User.objects.filter(email__iexact=identifier).first()

    auth_username = matched_user.username if matched_user else identifier
    user = authenticate(request, username=auth_username, password=password)

    if user is None:
        return JsonResponse({
            'status': 'error',
            'code': 'INVALID_CREDENTIALS',
            'message': 'Invalid administrator email or password. Please try again.'
        }, status=401)

    # Check authorized admin authority
    if not _is_admin_user(user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Access denied. Authorized administrators only.'
        }, status=403)

    login(request, user)
    return JsonResponse({
        'status': 'success',
        'message': f'Welcome back, {user.first_name or user.username}!',
        'user': _serialize_user(user),
        'redirectUrl': '/admin/dashboard'
    })


@require_http_methods(["GET"])
def admin_verify(request):
    """Verify active administrator session and privileges."""
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'code': 'UNAUTHENTICATED',
            'message': 'Session expired or not logged in.'
        }, status=401)

    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Access denied. Authorized administrators only.'
        }, status=403)

    return JsonResponse({
        'status': 'success',
        'authorized': True,
        'user': _serialize_user(request.user)
    })


@require_http_methods(["GET"])
def admin_dashboard_stats(request):
    """
    Return calculated overview metrics, recent orders, inventory alerts, and sales analytics.
    Protected endpoint: only accessible to authenticated, authorized administrators.
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'code': 'UNAUTHENTICATED',
            'message': 'Authentication required. Please sign in as an administrator.'
        }, status=401)

    if not _is_admin_user(request.user):
        return JsonResponse({
            'status': 'error',
            'code': 'ACCESS_DENIED',
            'message': 'Access denied. Authorized administrators only.'
        }, status=403)

    # 1. Real database queries on existing tables (Product, Category, User)
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_customers = User.objects.filter(is_staff=False, is_superuser=False).count()

    # 2. Inventory Health from actual Product records
    in_stock_qs = Product.objects.filter(in_stock=True)
    out_of_stock_qs = Product.objects.filter(in_stock=False)
    in_stock_count = in_stock_qs.count()
    out_of_stock_count = out_of_stock_qs.count()
    
    # Low stock items (items where in_stock is False)
    low_stock_count = out_of_stock_count
    health_percentage = round((in_stock_count / total_products * 100), 1) if total_products > 0 else 100.0

    # 3. Real Category-wise distribution from Category & Product tables
    cat_distribution = []
    categories = list(Category.objects.all().order_by('name'))
    for cat in categories:
        prods_count = cat.products.count()
        instock_count = cat.products.filter(in_stock=True).count()
        cat_distribution.append({
            'name': cat.name,
            'total_products': prods_count,
            'in_stock': instock_count
        })

    # 4. Low stock / replenishment alerts from actual Product table
    alert_items = []
    for idx, p in enumerate(out_of_stock_qs, start=1):
        alert_items.append({
            'num': idx,
            'id': p.id,
            'name': p.name,
            'botanical_name': p.botanical_name or '',
            'category': p.category.name if p.category else 'General',
            'current_stock': 0,
            'status': 'Out of Stock',
            'image': p.image or '/images/plants/snake_plant.png'
        })

    # 5. Top Popular Catalog Products based on actual reviews_count & rating in Product table
    top_products = []
    all_prods = list(Product.objects.all().select_related('category').order_by('-reviews_count', '-rating')[:5])
    for idx, p in enumerate(all_prods, start=1):
        top_products.append({
            'num': idx,
            'id': p.id,
            'name': p.name,
            'botanical_name': p.botanical_name or '',
            'price': float(p.price),
            'rating': p.rating,
            'reviews_count': p.reviews_count,
            'in_stock': p.in_stock,
            'image': p.image or '/images/plants/snake_plant.png',
            'category': p.category.name if p.category else 'Indoor Plants'
        })

    # 6. Real registered customers list from User & UserProfile tables
    recent_customers = []
    for u in User.objects.filter(is_staff=False, is_superuser=False).select_related('profile').order_by('-date_joined')[:5]:
        phone = u.profile.phone_number if hasattr(u, 'profile') and u.profile else ''
        recent_customers.append({
            'id': u.id,
            'username': u.username,
            'email': u.email or u.username,
            'phone': phone,
            'date_joined': u.date_joined.strftime('%d %b %Y') if u.date_joined else '',
            'is_active': u.is_active
        })

    # 7. Real Catalog items for modals
    catalog_inventory = [
        {
            'id': p.id,
            'name': p.name,
            'botanical_name': p.botanical_name or '',
            'category': p.category.name if p.category else 'General',
            'price': float(p.price),
            'in_stock': p.in_stock,
            'rating': p.rating,
            'reviews_count': p.reviews_count,
            'image': p.image or '/images/plants/snake_plant.png',
            'tag': p.tag or '',
            'stock_status': 'In Stock' if p.in_stock else 'Out of Stock'
        }
        for p in Product.objects.all().select_related('category').order_by('-created_at')
    ]

    # 8. Orders and Revenue from real Order table
    date_range = request.GET.get('range', '30d')
    orders_qs = Order.objects.all().prefetch_related('items')
    total_orders = orders_qs.count()
    valid_orders = [o for o in orders_qs if o.status != 'cancelled']
    total_revenue = sum(float(o.total_amount) for o in valid_orders)

    now = timezone.now()
    month_orders = [o for o in valid_orders if o.created_at.year == now.year and o.created_at.month == now.month]
    revenue_this_month = sum(float(o.total_amount) for o in month_orders)

    recent_orders = [o.to_dict() for o in orders_qs.order_by('-created_at')[:6]]

    # Sales chart daily aggregations
    chart_points = []
    if total_orders > 0:
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_orders = [o for o in valid_orders if day_start <= o.created_at < day_end]
            day_rev = sum(float(o.total_amount) for o in day_orders)
            chart_points.append({
                'label': day_start.strftime('%d %b'),
                'revenue': round(day_rev, 2),
                'orders': len(day_orders)
            })

    avg_order_value = (total_revenue / len(valid_orders)) if valid_orders else 0.0

    return JsonResponse({
        'status': 'success',
        'metrics': {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_customers': total_customers,
            'total_orders': total_orders,
            'total_revenue': round(total_revenue, 2),
            'low_stock_products': low_stock_count,
            'revenue_this_month': round(revenue_this_month, 2),
        },
        'inventory_health': {
            'total_stock_units': total_products,
            'in_stock_products': in_stock_count,
            'low_stock_products': low_stock_count,
            'out_of_stock_products': out_of_stock_count,
            'health_percentage': health_percentage,
            'category_distribution': cat_distribution
        },
        'top_selling_products': top_products,
        'recent_orders': recent_orders,
        'recent_customers': recent_customers,
        'low_stock_alerts': alert_items,
        'catalog_inventory': catalog_inventory,
        'sales_chart': {
            'range': date_range,
            'currency': '₹',
            'period_revenue': round(total_revenue, 2),
            'period_orders': total_orders,
            'average_order_value': round(avg_order_value, 2),
            'points': chart_points,
            'has_data': total_orders > 0,
            'message': 'Real-time sales & order telemetry from database.' if total_orders > 0 else 'No customer order transactions recorded in the database yet.'
        }
    })



