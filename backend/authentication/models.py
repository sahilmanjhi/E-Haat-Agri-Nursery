from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_categories'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_categories'
    )
    edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='edited_categories'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def to_dict(self):
        prod_count = self.products.count() if hasattr(self, 'products') else 0
        raw_id = getattr(self, 'id', getattr(self, 'pk', None))
        return {
            'id': self.name,
            'rawId': raw_id,
            'name': self.name,
            'description': self.description or '',
            'productsCount': prod_count
        }


class Product(models.Model):
    name = models.CharField(max_length=255)
    botanical_name = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    tag = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.IntegerField(default=0)
    rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=5)
    light = models.CharField(max_length=100, blank=True, null=True)
    water = models.CharField(max_length=100, blank=True, null=True)
    pet_friendly = models.BooleanField(default=False)
    air_purifying = models.BooleanField(default=False)
    maintenance = models.CharField(max_length=100, blank=True, null=True)
    room = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    image_hover = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def to_dict(self):
        cat_name = self.category.name if self.category else 'Indoor Plants'
        prod_id = getattr(self, 'id', getattr(self, 'pk', 1))
        price_val = float(str(self.price))
        orig_price_val = float(str(self.original_price)) if self.original_price else price_val

        created_at_dt = getattr(self, 'created_at', None)
        created_at_str = created_at_dt.strftime('%Y-%m-%d') if hasattr(created_at_dt, 'strftime') else None

        return {
            'id': str(prod_id),
            'rawId': prod_id,
            'name': self.name,
            'botanicalName': self.botanical_name or '',
            'category': cat_name,
            'categoryId': getattr(self, 'category_id', None),
            'tag': self.tag or '',
            'price': price_val,
            'originalPrice': orig_price_val,
            'discount': self.discount,
            'createdAt': created_at_str,
            'rating': self.rating,
            'reviewsCount': self.reviews_count,
            'inStock': getattr(self, 'in_stock', True),
            'stockQuantity': getattr(self, 'stock_quantity', 25),
            'reorderLevel': getattr(self, 'reorder_level', 5),
            'stockStatus': 'In Stock',
            'light': self.light or 'Bright Indirect Sunlight',
            'water': self.water or 'Once a week',
            'petFriendly': self.pet_friendly,
            'airPurifying': self.air_purifying,
            'maintenance': self.maintenance or 'Easy / Low Maintenance',
            'room': self.room or 'Living Room',
            'description': self.description or '',
            'image': self.image or '/images/plants/snake_plant.png',
            'imageHover': self.image_hover or self.image or '/images/plants/snake_plant.png',
            'gallery': [
                self.image or '/images/plants/snake_plant.png',
                self.image_hover or '/images/plants/snake_plant.png'
            ],
            'potOptions': [
                {'id': 'white', 'name': 'White Self-Watering Pot', 'hex': '#FFFFFF', 'extraPrice': 0},
                {'id': 'terracotta', 'name': 'Terracotta Planter', 'hex': '#C86446', 'extraPrice': 100},
                {'id': 'emerald', 'name': 'Emerald Gloss Ceramic', 'hex': '#0A4C36', 'extraPrice': 200}
            ],
            'sizeOptions': ['Small (6")', 'Medium (8")', 'Large (10")'],
            'careSpecs': {
                'sunlight': 'Thrives in indirect sunlight. Can handle dark corners as well as bright spots.',
                'watering': 'Water only when top soil is dry. Overwatering is harmful.',
                'humidity': 'Tolerates normal room humidity.',
                'fertilizer': 'Feed with organic liquid fertilizer once a month.'
            }
        }


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_roles'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_roles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profiles'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True, db_index=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        role_name = self.role.name if self.role else 'No Role'
        phone = f" - {self.phone_number}" if self.phone_number else ""
        return f"{self.user} ({role_name}){phone}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Dispatched', 'Dispatched'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    order_id = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='orders'
    )
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    city = models.CharField(max_length=100, default='Gwalior')
    state = models.CharField(max_length=100, default='Madhya Pradesh')
    pincode = models.CharField(max_length=20, default='474001')
    payment_method = models.CharField(max_length=50, default='UPI Verified')
    payment_status = models.CharField(max_length=50, default='Paid')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Processing')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    estimated_delivery = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_id} - {self.customer_name} (₹{self.total_amount})"

    def to_dict(self):
        items_mgr = getattr(self, 'items', None)
        item_list = [item.to_dict() for item in items_mgr.all()] if items_mgr is not None else []
        created_at_dt = getattr(self, 'created_at', None)
        if hasattr(created_at_dt, 'strftime'):
            formatted_dt = created_at_dt.strftime('%d %b %Y, %I:%M %p')
            created_at_iso = created_at_dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            formatted_dt = str(created_at_dt or '')
            created_at_iso = str(created_at_dt or '')

        status_val = str(getattr(self, 'status', 'pending') or 'pending')
        stat_lower = status_val.lower().replace(' ', '_')
        stat_display = self.get_status_display() if hasattr(self, 'get_status_display') else status_val
        payment_status_str = str(getattr(self, 'payment_status', 'pending') or 'pending')
        order_pk = getattr(self, 'id', getattr(self, 'pk', None))

        subtotal_val = float(str(getattr(self, 'subtotal', 0) or 0))
        shipping_fee_val = float(str(getattr(self, 'shipping_fee', 0) or 0))
        total_amount_val = float(str(getattr(self, 'total_amount', 0) or 0))

        return {
            'id': order_pk,
            'rawId': order_pk,
            'order_id': str(self.order_id),
            'orderId': str(self.order_id),
            'customer_name': self.customer_name,
            'customerName': self.customer_name,
            'customer': self.customer_name,
            'customer_email': self.customer_email or '',
            'customerEmail': self.customer_email or '',
            'customer_phone': self.customer_phone,
            'customerPhone': self.customer_phone,
            'delivery_address': self.delivery_address,
            'deliveryAddress': self.delivery_address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'payment_method': self.payment_method,
            'paymentMethod': self.payment_method,
            'payment_method_display': self.payment_method,
            'payment_status': payment_status_str.lower(),
            'paymentStatus': self.payment_status,
            'status': stat_lower,
            'status_display': stat_display,
            'subtotal': subtotal_val,
            'shipping_fee': shipping_fee_val,
            'shippingFee': shipping_fee_val,
            'total_amount': total_amount_val,
            'total': total_amount_val,
            'tracking_number': self.tracking_number or '',
            'trackingNumber': self.tracking_number or '',
            'estimated_delivery': self.estimated_delivery or '',
            'estimatedDelivery': self.estimated_delivery or '',
            'notes': self.notes or '',
            'created_at': created_at_iso,
            'createdAt': created_at_iso,
            'formatted_date': formatted_dt,
            'dateFormatted': formatted_dt,
            'items_count': len(item_list),
            'itemsCount': len(item_list),
            'items': item_list,
        }


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL, related_name='order_items')
    product_name = models.CharField(max_length=255)
    product_image = models.CharField(max_length=500, blank=True, null=True)
    pot_option = models.CharField(max_length=100, blank=True, null=True)
    size_option = models.CharField(max_length=100, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_id}"

    def to_dict(self):
        item_pk = getattr(self, 'id', getattr(self, 'pk', None))
        prod_id_val = getattr(self, 'product_id', None)
        unit_price_val = float(str(getattr(self, 'unit_price', 0) or 0))
        total_price_val = float(str(getattr(self, 'total_price', 0) or 0))
        return {
            'id': item_pk,
            'productId': prod_id_val,
            'product_id': prod_id_val,
            'name': self.product_name,
            'product_name': self.product_name,
            'image': self.product_image or '/images/plants/snake_plant.png',
            'product_image': self.product_image or '/images/plants/snake_plant.png',
            'pot': self.pot_option or 'Standard Pot',
            'pot_option': self.pot_option or 'Standard Pot',
            'size': self.size_option or 'Medium',
            'size_option': self.size_option or 'Medium',
            'price': unit_price_val,
            'unit_price': unit_price_val,
            'quantity': self.quantity,
            'total': total_price_val,
            'total_price': total_price_val,
        }


class Cart(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carts',
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['-created_at']

    def __str__(self):
        user_identifier = getattr(self.user, 'username', 'Anonymous') if self.user else 'Anonymous'
        status_str = 'Active' if self.is_active else 'Inactive'
        return f"Cart #{self.id} - {user_identifier} ({status_str})"

    def to_dict(self):
        created_at_dt = getattr(self, 'created_at', None)
        updated_at_dt = getattr(self, 'updated_at', None)
        user_val = getattr(self, 'user_id', None)
        if user_val is None and self.user:
            user_val = getattr(self.user, 'id', getattr(self.user, 'pk', None))

        return {
            'id': self.id,
            'user': user_val,
            'is_active': self.is_active,
            'created_at': created_at_dt.isoformat() if created_at_dt else None,
            'updated_at': updated_at_dt.isoformat() if updated_at_dt else None,
        }


class CartItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        ordering = ['-added_at']

    def __str__(self):
        prod_name = self.product.name if self.product else 'Unknown Product'
        cart_id = getattr(self, 'cart_id', None) or (self.cart.id if self.cart else 'None')
        return f"{self.quantity}x {prod_name} in Cart #{cart_id}"

    def to_dict(self):
        item_pk = getattr(self, 'id', getattr(self, 'pk', None))
        cart_id_val = getattr(self, 'cart_id', None)
        prod_id_val = getattr(self, 'product_id', None)
        added_at_dt = getattr(self, 'added_at', None)
        added_at_str = added_at_dt.isoformat() if hasattr(added_at_dt, 'isoformat') else (str(added_at_dt) if added_at_dt else None)

        product_data = self.product.to_dict() if self.product and hasattr(self.product, 'to_dict') else None

        return {
            'id': item_pk,
            'cart': cart_id_val,
            'cart_id': cart_id_val,
            'product': prod_id_val,
            'product_id': prod_id_val,
            'quantity': self.quantity,
            'added_at': added_at_str,
            'product_details': product_data,
        }


# Compatibility alias for cartItem
cartItem = CartItem


from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)



