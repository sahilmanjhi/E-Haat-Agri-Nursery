from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('categories/', views.category_list, name='category_list'),
    path('products/', views.product_list, name='product_list'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('roles/', views.role_list, name='role_list'),
    path('orders/', views.create_order, name='create_order'),

    # Authentication endpoints
    path('auth/send-otp/', views.send_otp, name='send_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),
    path('auth/me/', views.current_user, name='current_user'),
]

