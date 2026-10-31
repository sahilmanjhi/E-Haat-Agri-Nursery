import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '../data/products';

const API_BASE = '/api';

/**
 * Health check: verify if the Django backend is online and responding.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Backend] Health check failed, falling back to local mode:', err.message);
    return { status: 'offline', connected: false };
  }
}

/**
 * Fetch categories from Django backend (with local fallback).
 */
export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.categories && data.categories.length > 0) {
      // Include 'all' category at the beginning
      return [{ id: 'all', name: 'All Products' }, ...data.categories];
    }
  } catch (err) {
    console.warn('[Backend] Categories fetch failed, using fallback:', err.message);
  }
  return FALLBACK_CATEGORIES;
}

/**
 * Fetch products from Django backend with query filters (with local fallback).
 */
export async function fetchProducts({ category = 'all', room = 'all', sort = 'popular', search = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (room && room !== 'all') params.append('room', room);
    if (sort) params.append('sort', sort);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/products/?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.products && data.products.length > 0) {
      return data.products;
    }
  } catch (err) {
    console.warn('[Backend] Products fetch failed, using fallback:', err.message);
  }

  // Filter fallback products locally
  let filtered = [...FALLBACK_PRODUCTS];
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (room && room !== 'all') {
    filtered = filtered.filter(p => p.room && p.room.toLowerCase() === room.toLowerCase());
  }
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  return filtered;
}

/**
 * Fetch roles from Django backend.
 */
export async function fetchRoles() {
  try {
    const res = await fetch(`${API_BASE}/roles/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.roles || [];
  } catch (err) {
    console.warn('[Backend] Roles fetch failed:', err.message);
    return [];
  }
}

/**
 * Submit order to Django backend.
 */
export async function submitOrder(orderData) {
  try {
    const res = await fetch(`${API_BASE}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Backend] Order submission fallback:', err.message);
    return {
      status: 'success',
      orderId: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
      message: 'Order processed (local simulation mode).'
    };
  }
}


// ---------------------------------------------------------------------------
//  Authentication API helpers
// ---------------------------------------------------------------------------
//  Authentication API helpers (Email + Password, Register, Reset, Session)
// ---------------------------------------------------------------------------

/**
 * Register a new customer account.
 * Parameters: { first_name, email, password, phone_number, username? }
 */
export async function registerUser({ first_name, email, password, phone_number, username }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, email, password, phone_number, username }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || `Registration failed (HTTP ${res.status}).`
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Unable to connect to authentication server. Please verify backend is running.'
    };
  }
}

/**
 * Log in with Email or Username + Password.
 * Parameters: { identifier, password } or { username, password } or { email, password }
 */
export async function loginUser({ identifier, username, email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: identifier || username || email,
        password
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Invalid credentials. Please verify your email/username and password.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Unable to reach backend server. Please verify Django is running on port 8000.'
    };
  }
}

/**
 * Request password reset verification code via email.
 * Parameters: { email }
 */
export async function forgotPassword({ email }) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Unable to request password reset.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Network error while requesting password reset. Please try again.'
    };
  }
}

/**
 * Reset password using verification code.
 * Parameters: { email, code, new_password }
 */
export async function resetPassword({ email, code, new_password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Verification code failed or expired.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Network error while resetting password. Please try again.'
    };
  }
}

/**
 * Log out the current session.
 */
export async function logoutUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout/`, { method: 'POST' });
    return await res.json().catch(() => ({ status: 'success' }));
  } catch {
    return { status: 'success' };
  }
}

/**
 * Get the currently authenticated user (session-based).
 */
export async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me/`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Backward-compatible helper for legacy OTP calls (deprecated).
 */
export async function sendOtp({ phone_number }) {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number }),
    });
    return await res.json().catch(() => ({}));
  } catch {
    return { status: 'error', message: 'OTP service unavailable.' };
  }
}

export async function verifyOtp({ phone_number, otp, name }) {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number, otp, name }),
    });
    return await res.json().catch(() => ({}));
  } catch {
    return { status: 'error', message: 'OTP verification failed.' };
  }
}

/**
 * Authenticate administrator with verified privileges.
 * Parameters: { email, password }
 */
export async function adminLogin({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || (res.status === 403 
          ? 'Access denied. You do not have administrator privileges.' 
          : 'Invalid administrator email or password.')
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Unable to reach authentication server. Please verify backend is running on port 8000.'
    };
  }
}

/**
 * Verify active administrator session.
 */
export async function adminVerifySession() {
  try {
    const res = await fetch(`${API_BASE}/auth/admin/verify/`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { authorized: false, code: data.code || 'UNAUTHENTICATED', message: data.message };
    }
    const data = await res.json();
    return data;
  } catch {
    return { authorized: false, code: 'NETWORK_ERROR' };
  }
}

/**
 * Fetch Admin Dashboard Overview metrics, charts, and recent activity.
 * Query parameter: range ('7d' or '30d')
 */
export async function fetchAdminDashboardStats(range = '7d') {
  try {
    const res = await fetch(`${API_BASE}/auth/admin/dashboard-stats/?range=${encodeURIComponent(range)}`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to retrieve administrative dashboard metrics.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to administrative server. Please check your backend connection.'
    };
  }
}

/**
 * Fetch products list for Admin Product Management with filters.
 */
export async function fetchAdminProducts({ category = 'all', inStock = 'all', tag = 'all', search = '', sort = 'newest' } = {}) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (inStock && inStock !== 'all') params.append('in_stock', inStock);
    if (tag && tag !== 'all') params.append('tag', tag);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${API_BASE}/products/?${params.toString()}`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to load products.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to products endpoint.'
    };
  }
}

/**
 * Fetch a single product by ID for editing or details view.
 */
export async function fetchProductDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Product not found.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Network error retrieving product details.'
    };
  }
}

/**
 * Create a new product (Admin only).
 */
export async function createProduct(productData) {
  try {
    const res = await fetch(`${API_BASE}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to create product.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network connection failed while creating product.'
    };
  }
}

/**
 * Update an existing product (Admin only).
 */
export async function updateProduct(id, productData) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'POST', // Django handles POST/PUT with @csrf_exempt
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to update product.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network connection failed while updating product.'
    };
  }
}

/**
 * Delete a product (Admin only).
 */
export async function deleteProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to delete product.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error deleting product.'
    };
  }
}

/**
 * Quick 1-click toggle for product in_stock availability (Admin only).
 */
export async function toggleProductStock(id, inStock = null) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/toggle-stock/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: inStock !== null ? JSON.stringify({ in_stock: inStock }) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to update stock status.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error updating stock status.'
    };
  }
}

/**
 * Fetch all categories with full administrative details and product counts.
 */
export async function fetchAdminCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories/`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Failed to retrieve categories.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Network error retrieving categories.'
    };
  }
}

/**
 * Create a new product category (Admin only).
 */
export async function createCategory({ name, description }) {
  try {
    const res = await fetch(`${API_BASE}/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to create category.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error creating category.'
    };
  }
}

/**
 * Update an existing category (Admin only).
 */
export async function updateCategory(id, { name, description }) {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}/`, {
      method: 'POST', // Django handles POST/PUT/PATCH with csrf_exempt
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to update category.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error updating category.'
    };
  }
}

/**
 * Delete a category (Admin only).
 */
export async function deleteCategory(id) {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to delete category.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error deleting category.'
    };
  }
}

/**
 * Fetch inventory summary telemetry, stock distributions, and reorder alerts.
 */
export async function fetchInventorySummary() {
  try {
    const res = await fetch(`${API_BASE}/inventory/summary/`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to retrieve inventory telemetry.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error retrieving inventory summary.'
    };
  }
}

/**
 * Quick update for product stock quantity, delta adjustments, or reorder levels.
 */
export async function updateInventoryStock(id, payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}/update-stock/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to update inventory stock.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error updating inventory stock.'
    };
  }
}

/**
 * Batch restock multiple products simultaneously.
 * Payload: { ids: [1, 2, 3], add_units: 25 } or { items: [{ id: 1, quantity: 50 }, ...] }
 */
export async function batchRestockInventory(payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/inventory/batch-restock/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to execute batch restock.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error executing batch restock.'
    };
  }
}

/**
 * Fetch orders list with filtering and search for admin order management.
 */
export async function fetchAdminOrders({ status = 'all', search = '', sort = '-created_at' } = {}) {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${API_BASE}/admin/orders/?${params.toString()}`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to retrieve orders.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error retrieving orders.'
    };
  }
}

/**
 * Fetch detailed order information by order ID.
 */
export async function fetchAdminOrderDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to fetch order detail.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error fetching order details.'
    };
  }
}

/**
 * Update order status, tracking number, notes, or payment status.
 */
export async function updateAdminOrderStatus(id, payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/update-status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to update order status.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error updating order status.'
    };
  }
}

/**
 * Fetch registered customer accounts with metrics and search filters.
 */
export async function fetchAdminCustomers({ search = '', status = 'all', sort = '-date_joined' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${API_BASE}/admin/customers/?${params.toString()}`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to retrieve customers.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error retrieving customers.'
    };
  }
}

/**
 * Fetch detailed customer profile and past orders.
 */
export async function fetchAdminCustomerDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/${id}/`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to retrieve customer details.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error retrieving customer details.'
    };
  }
}

/**
 * Toggle customer account is_active status (activate / suspend).
 */
export async function toggleAdminCustomerStatus(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/${id}/toggle-status/`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to toggle customer status.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error toggling customer status.'
    };
  }
}

/**
 * Register a new customer directly from the admin portal.
 */
export async function createAdminCustomer(payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || `HTTP_${res.status}`,
        message: data.message || 'Failed to create customer.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Network error creating customer.'
    };
  }
}








