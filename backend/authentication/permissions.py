from functools import wraps
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from .models import Role, UserProfile


def get_user_role(user):
    """
    Get the Role instance for a given user.
    Returns None if user is not authenticated or has no assigned role.
    """
    if not user or not user.is_authenticated:
        return None
    try:
        profile = getattr(user, 'profile', None)
        if profile is None:
            profile = UserProfile.objects.filter(user=user).select_related('role').first()
        if profile and profile.role:
            return profile.role
    except Exception:
        pass
    return None


def get_user_role_name(user):
    """
    Get the string name of the user's role, or None.
    """
    role = get_user_role(user)
    return role.name if role else None


def has_role(user, *role_names):
    """
    Check if a user has any of the specified roles (by name).
    Superusers automatically pass this check.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    user_role = get_user_role(user)
    if user_role and user_role.name in role_names:
        return True
    return False


def is_admin_user(user):
    """
    Check if a user is an Admin (either assigned 'Admin' role or is_superuser).
    """
    return has_role(user, 'Admin')


def assign_role(user, role_name_or_instance):
    """
    Assign a role to a user.
    `role_name_or_instance` can be a Role instance or a role name string.
    """
    if isinstance(role_name_or_instance, str):
        role = Role.objects.get(name=role_name_or_instance)
    else:
        role = role_name_or_instance

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save(update_fields=['role'])
    user.profile = profile
    return profile


def role_required(allowed_roles, return_json=False):
    """
    View decorator that verifies whether the authenticated user has one of `allowed_roles`.
    If `return_json=True`, returns 401/403 JsonResponse (useful for API endpoints).
    Otherwise raises PermissionDenied.
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                if return_json:
                    return JsonResponse({'error': 'Authentication required'}, status=401)
                raise PermissionDenied("Authentication required")

            if not has_role(request.user, *allowed_roles):
                if return_json:
                    return JsonResponse({'error': 'Permission denied: insufficient role privileges'}, status=403)
                raise PermissionDenied("Permission denied: insufficient role privileges")

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def admin_role_required(view_func=None, *, return_json=False):
    """
    Convenience decorator to restrict access to Admin role or superusers.
    Supports usage with or without arguments:
      @admin_role_required
      @admin_role_required(return_json=True)
    """
    decorator = role_required(['Admin'], return_json=return_json)
    if view_func is not None and callable(view_func):
        return decorator(view_func)
    return decorator
