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

    @property
    def stock(self):
        try:
            return self.stocks.first()
        except Exception:
            return None

    @property
    def stock_quantity(self):
        stk = self.stock
        return stk.quantity if stk else 25

    @property
    def in_stock(self):
        stk = self.stock
        return (stk.quantity > 0) if stk else True

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
            'inStock': self.in_stock,
            'stockQuantity': self.stock_quantity,
            'reorderLevel': (self.stock.reorder_level if self.stock else getattr(self, 'reorder_level', 5)),
            'stockStatus': 'Out of Stock' if not self.in_stock else ('Low Stock' if self.stock_quantity <= (self.stock.reorder_level if self.stock else getattr(self, 'reorder_level', 5)) else 'In Stock'),
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



class Stock(models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='stocks',
        db_column='product_id'
    )
    quantity = models.IntegerField(default=0)
    reserved_quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Stock'
        verbose_name_plural = 'Stocks'
        ordering = ['-updated_at']

    def __str__(self):
        prod = getattr(self, 'product', None)
        prod_name = prod.name if prod else f"Product #{getattr(self, 'product_id', 'Unknown')}"
        return f"Stock for {prod_name}: {self.quantity} units (Reserved: {self.reserved_quantity})"

    @property
    def available_quantity(self):
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        return self.quantity <= self.reorder_level

    @property
    def is_out_of_stock(self):
        return self.quantity <= 0

    def to_dict(self):
        stock_pk = getattr(self, 'id', getattr(self, 'pk', None))
        prod_id = getattr(self, 'product_id', None)
        updated_at_dt = getattr(self, 'updated_at', None)
        updated_at_str = updated_at_dt.isoformat() if hasattr(updated_at_dt, 'isoformat') else (str(updated_at_dt) if updated_at_dt else None)

        return {
            'id': stock_pk,
            'product_id': prod_id,
            'productId': prod_id,
            'quantity': self.quantity,
            'reserved_quantity': self.reserved_quantity,
            'reservedQuantity': self.reserved_quantity,
            'reorder_level': self.reorder_level,
            'reorderLevel': self.reorder_level,
            'available_quantity': self.available_quantity,
            'availableQuantity': self.available_quantity,
            'updated_at': updated_at_str,
            'updatedAt': updated_at_str,
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

    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='orders',
        db_column='customer_id'
    )
    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    shipping_address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        cust_id = getattr(self, 'customer_id', None)
        cust_name = self.customer.username if self.customer else (f"Customer #{cust_id}" if cust_id else "Guest Customer")
        return f"{self.order_number} - {cust_name} (₹{self.total_amount})"

    @property
    def order_id(self):
        return self.order_number

    @order_id.setter
    def order_id(self, val):
        self.order_number = val

    @property
    def user(self):
        return self.customer

    @user.setter
    def user(self, val):
        self.customer = val

    @property
    def delivery_address(self):
        return self.shipping_address

    @delivery_address.setter
    def delivery_address(self, val):
        self.shipping_address = val

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

        status_val = str(getattr(self, 'status', 'Pending') or 'Pending')
        stat_lower = status_val.lower().replace(' ', '_')
        stat_display = self.get_status_display() if hasattr(self, 'get_status_display') else status_val
        order_pk = getattr(self, 'id', getattr(self, 'pk', None))
        total_amount_val = float(str(getattr(self, 'total_amount', 0) or 0))

        cust = getattr(self, 'customer', None)
        cust_id = getattr(self, 'customer_id', None)
        cust_name = ''
        cust_email = ''
        cust_phone = ''
        if cust:
            cust_name = getattr(cust, 'get_full_name', lambda: '')() or cust.first_name or cust.username
            cust_email = cust.email or ''
            if hasattr(cust, 'profile') and cust.profile:
                cust_phone = getattr(cust.profile, 'phone_number', '') or ''

        if not cust_name:
            cust_name = f"Customer #{cust_id}" if cust_id else "Guest Customer"

        ord_num = str(getattr(self, 'order_number', order_pk))
        ship_addr = str(getattr(self, 'shipping_address', '') or '')

        return {
            'id': order_pk,
            'rawId': order_pk,
            'order_id': ord_num,
            'orderId': ord_num,
            'order_number': ord_num,
            'orderNumber': ord_num,
            'customer_id': cust_id,
            'customerId': cust_id,
            'customer_name': cust_name,
            'customerName': cust_name,
            'customer': cust_name,
            'customer_email': cust_email,
            'customerEmail': cust_email,
            'customer_phone': cust_phone,
            'customerPhone': cust_phone,
            'shipping_address': ship_addr,
            'shippingAddress': ship_addr,
            'delivery_address': ship_addr,
            'deliveryAddress': ship_addr,
            'city': 'Gwalior',
            'state': 'Madhya Pradesh',
            'pincode': '',
            'payment_method': 'Online',
            'paymentMethod': 'Online',
            'payment_status': 'paid',
            'paymentStatus': 'Paid',
            'status': stat_lower,
            'status_display': stat_display,
            'subtotal': total_amount_val,
            'shipping_fee': 0.0,
            'shippingFee': 0.0,
            'total_amount': total_amount_val,
            'total': total_amount_val,
            'tracking_number': '',
            'trackingNumber': '',
            'estimated_delivery': '',
            'estimatedDelivery': '',
            'notes': '',
            'created_at': created_at_iso,
            'createdAt': created_at_iso,
            'formatted_date': formatted_dt,
            'dateFormatted': formatted_dt,
            'items_count': len(item_list),
            'itemsCount': len(item_list),
            'items': item_list,
        }


class OrderItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        db_column='order_id'
    )
    product = models.ForeignKey(
        Product,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='order_items',
        db_column='product_id'
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        prod_id = getattr(self, 'product_id', None)
        prod_name = self.product.name if self.product else f"Product #{prod_id or 'Unknown'}"
        ord_id = getattr(self, 'order_id', None)
        ord_num = self.order.order_number if self.order else f"Order #{ord_id or 'Unknown'}"
        return f"{self.quantity}x {prod_name} in {ord_num}"

    @property
    def total_price(self):
        return self.subtotal

    @total_price.setter
    def total_price(self, val):
        self.subtotal = val

    @property
    def product_name(self):
        return self.product.name if self.product else 'Plant'

    @property
    def product_image(self):
        return self.product.image if (self.product and self.product.image) else '/images/plants/snake_plant.png'

    def to_dict(self):
        item_pk = getattr(self, 'id', getattr(self, 'pk', None))
        ord_id_val = getattr(self, 'order_id', None)
        prod_id_val = getattr(self, 'product_id', None)
        unit_price_val = float(str(getattr(self, 'unit_price', 0) or 0))
        subtotal_val = float(str(getattr(self, 'subtotal', getattr(self, 'total_price', 0)) or 0))

        prod = getattr(self, 'product', None)
        p_name = prod.name if prod else f'Product #{prod_id_val}'
        p_img = prod.image if (prod and getattr(prod, 'image', None)) else '/images/plants/snake_plant.png'

        return {
            'id': item_pk,
            'order_id': ord_id_val,
            'orderId': ord_id_val,
            'productId': prod_id_val,
            'product_id': prod_id_val,
            'name': p_name,
            'product_name': p_name,
            'image': p_img,
            'product_image': p_img,
            'pot': 'Standard Pot',
            'pot_option': 'Standard Pot',
            'size': 'Medium',
            'size_option': 'Medium',
            'price': unit_price_val,
            'unit_price': unit_price_val,
            'quantity': self.quantity,
            'subtotal': subtotal_val,
            'total': subtotal_val,
            'total_price': subtotal_val,
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

@receiver(post_save, sender=Product)
def create_or_update_product_stock(sender, instance, created, **kwargs):
    if created:
        Stock.objects.get_or_create(
            product=instance,
            defaults={
                'quantity': 25,
                'reserved_quantity': 0,
                'reorder_level': getattr(instance, 'reorder_level', 5),
            }
        )

