from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('categories/', views.category_list, name='category_list'),
    path('categories/<int:pk>/', views.category_detail, name='category_detail'),
    path('products/', views.product_list, name='product_list'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('products/<int:pk>/toggle-stock/', views.product_toggle_stock, name='product_toggle_stock'),
    path('inventory/summary/', views.inventory_summary, name='inventory_summary'),
    path('inventory/<int:pk>/update-stock/', views.inventory_quick_update, name='inventory_quick_update'),
    path('inventory/batch-restock/', views.inventory_batch_restock, name='inventory_batch_restock'),
    path('roles/', views.role_list, name='role_list'),
    path('orders/', views.create_order, name='create_order'),

    # Authentication endpoints
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/forgot-password/', views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', views.reset_password, name='reset_password'),
    path('auth/logout/', views.logout_user, name='logout_user'),
    path('auth/me/', views.current_user, name='current_user'),

    # Admin portal authentication & dashboard
    path('auth/admin/login/', views.admin_login, name='admin_login'),
    path('auth/admin/verify/', views.admin_verify, name='admin_verify'),
    path('auth/admin/dashboard-stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/orders/', views.admin_orders_list, name='admin_orders_list'),
    path('admin/orders/<str:pk>/', views.admin_order_detail, name='admin_order_detail'),
    path('admin/orders/<str:pk>/update-status/', views.admin_order_update_status, name='admin_order_update_status'),
    path('admin/customers/', views.admin_customers_list, name='admin_customers_list'),
    path('admin/customers/<int:pk>/', views.admin_customer_detail, name='admin_customer_detail'),
    path('admin/customers/<int:pk>/toggle-status/', views.admin_customer_toggle_status, name='admin_customer_toggle_status'),
    path('admin/customers/create/', views.admin_customer_create, name='admin_customer_create'),

    # Backward-compatible OTP endpoints (deprecated)
    path('auth/send-otp/', views.send_otp, name='send_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
]



