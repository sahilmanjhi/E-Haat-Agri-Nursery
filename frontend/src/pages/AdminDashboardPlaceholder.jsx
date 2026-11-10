import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  ArrowLeft,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { adminVerifySession, logoutUser } from '../services/api';

export default function AdminDashboardPlaceholder({ onLogout }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard | ITMU E-Haat';
    
    async function checkAuth() {
      try {
        const res = await adminVerifySession();
        if (res && res.authorized && res.user) {
          setAdminUser(res.user);
        } else {
          setAccessDenied(true);
        }
      } catch {
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await logoutUser();
    if (onLogout) {
      onLogout();
    } else {
      window.location.pathname = '/admin/login';
    }
  };

  if (loading) {
    return (
      <div className="admin-portal-container">
        <div className="admin-loading-screen">
          <span className="admin-btn-spinner" style={{ width: 36, height: 36, borderColor: 'rgba(27, 94, 32, 0.25)', borderTopColor: '#1B5E20' }} />
          <p style={{ marginTop: 14, color: '#1B5E20', fontWeight: 600 }}>Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !adminUser) {
    return (
      <div className="admin-portal-container">
        <div className="admin-card-wrapper">
          <div className="admin-login-card" style={{ textAlign: 'center' }}>
            <div className="admin-modal-icon-badge" style={{ margin: '0 auto 16px', background: '#FEF2F2', color: '#B91C1C' }}>
              <Lock size={26} />
            </div>
            <h2 className="admin-login-heading" style={{ color: '#991B1B' }}>Access Denied</h2>
            <p className="admin-login-subtext" style={{ marginBottom: 24 }}>
              You must be logged in as an authorized administrator to view this portal.
            </p>
            <button
              type="button"
              className="admin-submit-btn"
              onClick={() => {
                if (onLogout) onLogout();
                else window.location.pathname = '/admin/login';
              }}
            >
              <span>Go to Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal-container" style={{ background: '#F8FAF8' }}>
      {/* Top Navbar */}
      <header className="admin-dashboard-nav">
        <div className="admin-dashboard-brand">
          <img src="/images/itmu_ehaat_logo.png" alt="ITMU E-Haat" style={{ height: 38 }} />
          <span className="admin-portal-tag">Admin Management Portal</span>
        </div>

        <div className="admin-dashboard-user-actions">
          <div className="admin-user-pill">
            <span className="admin-user-avatar">
              {adminUser.first_name ? adminUser.first_name[0].toUpperCase() : 'A'}
            </span>
            <div className="admin-user-info">
              <strong>{adminUser.first_name || adminUser.username}</strong>
              <small>{adminUser.email || 'Administrator'}</small>
            </div>
            <span className="admin-role-badge">
              <ShieldCheck size={12} />
              {adminUser.role || 'Admin'}
            </span>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleSignOut}
            title="Sign out of administration session"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Dashboard Shell */}
      <main className="admin-dashboard-body">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-banner">
            <div className="admin-banner-icon">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1 className="admin-banner-title">Welcome to ITMU E-Haat Admin Portal</h1>
              <p className="admin-banner-subtitle">
                Authenticated session active for <strong>{adminUser.email}</strong> with verified administrator privileges.
              </p>
            </div>
          </div>

          <div className="admin-modules-grid">
            <div className="admin-module-card">
              <div className="admin-module-icon"><Package size={24} /></div>
              <h3>Plant Inventory &amp; Stock</h3>
              <p>10 Live Nursery Products &bull; 7 Active Botanical Categories</p>
              <span className="admin-coming-soon">Modules Connecting...</span>
            </div>

            <div className="admin-module-card">
              <div className="admin-module-icon"><ShoppingBag size={24} /></div>
              <h3>Order Dispatch &amp; Logistics</h3>
              <p>Campus delivery queues, customer addresses, and tracking</p>
              <span className="admin-coming-soon">Modules Connecting...</span>
            </div>

            <div className="admin-module-card">
              <div className="admin-module-icon"><Users size={24} /></div>
              <h3>Customer Profiles &amp; Roles</h3>
              <p>Role-based access control, nursery memberships &amp; staff</p>
              <span className="admin-coming-soon">Modules Connecting...</span>
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/" className="admin-secondary-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ArrowLeft size={16} />
              <span>View Nursery Storefront</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
