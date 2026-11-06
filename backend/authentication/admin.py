from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Category, Product, Stock, Role, UserProfile, Cart, CartItem, Order, OrderItem

User = get_user_model()



@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'updated_by', 'edited_by', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')


class StockInline(admin.TabularInline):
    model = Stock
    extra = 0
    fields = ('quantity', 'reserved_quantity', 'reorder_level', 'updated_at')
    readonly_fields = ('updated_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discount', 'rating', 'created_at')
    search_fields = ('name', 'botanical_name', 'description')
    list_filter = ('category', 'tag', 'room')
    inlines = (StockInline,)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'quantity', 'reserved_quantity', 'reorder_level', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('product__name',)
    readonly_fields = ('updated_at',)



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


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user')
    search_fields = ('user__username', 'user__email')
    inlines = (CartItemInline,)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity')
    search_fields = ('cart__id', 'product__name', 'cart__user__username')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('subtotal',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_number', 'customer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'customer__username', 'customer__email', 'shipping_address')
    readonly_fields = ('created_at',)
    inlines = (OrderItemInline,)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product', 'quantity', 'unit_price', 'subtotal')
    list_filter = ('order__status',)
    search_fields = ('order__order_number', 'product__name')

