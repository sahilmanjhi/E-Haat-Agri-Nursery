from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Category, Product, Role, UserProfile, PhoneOTP, PasswordResetCode, Cart, CartItem

User = get_user_model()



@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'updated_by', 'edited_by', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discount', 'rating', 'in_stock', 'created_at')
    search_fields = ('name', 'botanical_name', 'description')
    list_filter = ('category', 'in_stock', 'tag', 'room')



@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_by', 'updated_by', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Role & Profile'
    fk_name = 'user'


# Re-register UserAdmin to display UserProfile inline
try:
    admin.site.unregister(User)

    @admin.register(User)
    class UserAdmin(BaseUserAdmin):
        inlines = (UserProfileInline,)
except admin.sites.NotRegistered:
    pass


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email', 'phone_number', 'role__name')


@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'otp', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('phone_number', 'otp')
    readonly_fields = ('created_at',)


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'code', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email', 'user__username', 'code')
    readonly_fields = ('created_at',)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('added_at',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = (CartItemInline,)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('cart__id', 'product__name', 'cart__user__username')
    readonly_fields = ('added_at',)




