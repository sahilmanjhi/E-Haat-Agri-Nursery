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
        return {
            'id': self.name,
            'name': self.name,
            'description': self.description or ''
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
    category_name = models.CharField(max_length=100, blank=True, null=True)
    tag = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.IntegerField(default=0)
    rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    in_stock = models.BooleanField(default=True)
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
        cat_name = self.category.name if self.category else (self.category_name or 'Indoor Plants')
        prod_id = getattr(self, 'id', getattr(self, 'pk', 1))
        price_val = float(str(self.price))
        orig_price_val = float(str(self.original_price)) if self.original_price else price_val
        return {
            'id': str(prod_id),
            'name': self.name,
            'botanicalName': self.botanical_name or '',
            'category': cat_name,
            'tag': self.tag or '',
            'price': price_val,
            'originalPrice': orig_price_val,
            'discount': self.discount,
            'rating': self.rating,
            'reviewsCount': self.reviews_count,
            'inStock': self.in_stock,
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


class PhoneOTP(models.Model):
    phone_number = models.CharField(max_length=20, db_index=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    objects = models.Manager()

    class Meta:
        verbose_name = 'Phone OTP'
        verbose_name_plural = 'Phone OTPs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone_number} - {self.otp}"


from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

