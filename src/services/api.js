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

/**
 * Send 4-digit OTP to mobile number via SMS/WhatsApp.
 */
export async function sendOtp({ phone_number }) {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || `Server returned ${res.status}. Please try again.`
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
 * Verify OTP and log in / auto-register.
 */
export async function verifyOtp({ phone_number, otp, name }) {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number, otp, name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: 'error',
        message: data.message || 'Verification failed. Please check the OTP.'
      };
    }
    return data;
  } catch (err) {
    return {
      status: 'error',
      message: 'Unable to connect to authentication backend. Please try again.'
    };
  }
}

/**
 * Register a new customer account.
 */
export async function registerUser({ username, email, password, first_name, last_name }) {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, first_name, last_name }),
  });
  return await res.json();
}

/**
 * Log in with username + password.
 */
export async function loginUser({ username, password }) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

/**
 * Log out the current session.
 */
export async function logoutUser() {
  const res = await fetch(`${API_BASE}/auth/logout/`, { method: 'POST' });
  return await res.json();
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

