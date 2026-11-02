import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  CalendarDays,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  X,
  Menu,
  Lock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { adminVerifySession, logoutUser } from '../services/api';

export default function AdminLayout({
  activeNav = 'products',
  adminUser: initialAdminUser,
  onLogout,
  onNavigate,
  searchQuery,
  onSearchChange,
  headerActions,
  children
}) {
  const [adminUser, setAdminUser] = useState(initialAdminUser || null);
  const [authLoading, setAuthLoading] = useState(!initialAdminUser);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Verify administrator session if not already provided
  useEffect(() => {
    let isMounted = true;
    if (initialAdminUser) {
      setAdminUser(initialAdminUser);
      setAuthLoading(false);
      return;
    }

    async function verify() {
      setAuthLoading(true);
      try {
        const res = await adminVerifySession();
        if (!isMounted) return;
        if (res && res.authorized && res.user) {
          setAdminUser(res.user);
          setAccessDenied(false);
        } else {
          setAccessDenied(true);
          setAccessMessage(res.message || 'Access denied. Authorized administrators only.');
        }
      } catch (e) {
        if (!isMounted) return;
        setAccessDenied(true);
        setAccessMessage('Unable to verify administrative authorization.');
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }
    verify();
    return () => { isMounted = false; };
  }, [initialAdminUser]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      if (onLogout) onLogout();
      else {
        window.history.pushState({}, '', '/admin/login');
        if (onNavigate) onNavigate('/admin/login');
        else window.location.pathname = '/admin/login';
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'categories', label: 'Categories', icon: Layers, path: '/admin/categories' },
    { id: 'inventory', label: 'Inventory', icon: CalendarDays, path: '/admin/inventory' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleNavClick = (item) => {
    setMobileSidebarOpen(false);
    if (onNavigate) {
      onNavigate(item.path);
    } else {
      window.history.pushState({}, '', item.path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (authLoading) {
    return (
      <div className="itmu-admin-loading-root">
        <div className="itmu-admin-loading-card">
          <div className="itmu-admin-spinner" />
          <h3>ITMU E-Haat Admin Portal</h3>
          <p>Verifying secure administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !adminUser) {
    return (
      <div className="itmu-admin-loading-root">
        <div className="itmu-admin-denied-box">
          <div className="itmu-denied-circle">
            <Lock size={32} />
          </div>
          <h2>Access Denied</h2>
          <p>{accessMessage || 'You must be logged in as an authorized administrator to view this portal.'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="itmu-btn-green"
              onClick={() => {
                if (onLogout) onLogout();
                else if (onNavigate) onNavigate('/admin/login');
                else window.location.pathname = '/admin/login';
              }}
            >
              Sign In to Admin Portal
            </button>
            <a href="/" className="itmu-btn-outline-link">
              Return to Public Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="itmu-dashboard-layout">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="itmu-sidebar-backdrop" 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside className={`itmu-sidebar ${mobileSidebarOpen ? 'itmu-sidebar--open' : ''}`}>
        <div className="itmu-sidebar-brand">
          <div 
            className="itmu-official-logo-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNavClick(navItems[0])}
            title="ITM University & ITMU E-Haat"
          >
            <img 
              src="/images/itm_logo.png" 
              alt="ITM University" 
              className="itmu-sidebar-itm-logo"
            />
            <div className="itmu-sidebar-logo-divider" />
            <img 
              src="/images/itmu_ehaat_logo.png" 
              alt="ITMU E-Haat" 
              className="itmu-sidebar-ehaat-logo"
            />
          </div>
          <button 
            type="button" 
            className="itmu-sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} color="#FFFFFF" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="itmu-sidebar-nav">
          <ul className="itmu-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <li key={item.id} className="itmu-nav-item">
                  <button
                    type="button"
                    className={`itmu-nav-btn ${isActive ? 'itmu-nav-btn--active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <Icon size={20} className="itmu-nav-icon" />
                    <span className="itmu-nav-text">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Promo Card */}
        <div className="itmu-sidebar-promo-card">
          <div className="itmu-promo-header">
            <h4>Greener<br />Spaces<br />Happier Lives</h4>
            <div className="itmu-promo-leaf-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14 8C16 7 19 8 20 10C21 12 20 15 19 17C17 20 13 21 10 21C7 21 4 19 3 16C2 13 4 9 7 7C8 4 10 2 12 2Z" fill="#146B3A" opacity="0.9" />
              </svg>
            </div>
          </div>
          <div className="itmu-promo-image-box">
            <img 
              src="/images/plants/peace_lily.png" 
              alt="Houseplants" 
              className="itmu-promo-plant-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/plants/snake_plant.png';
              }}
            />
          </div>
        </div>

        {/* Logout button */}
        <div className="itmu-sidebar-footer">
          <button 
            type="button" 
            className="itmu-logout-btn"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= Main Wrapper ================= */}
      <div className="itmu-main-wrapper">
        <header className="itmu-topbar">
          <div className="itmu-topbar-left">
            <button
              type="button"
              className="itmu-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} color="#172B24" />
            </button>

            {/* Global Search Bar */}
            {onSearchChange !== undefined ? (
              <div className="itmu-search-bar">
                <Search size={18} className="itmu-search-icon" />
                <input
                  type="text"
                  placeholder="Search products, botanical names, categories..."
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="itmu-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => onSearchChange('')}
                    className="itmu-search-clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <div className="itmu-topbar-right">
            {/* Header Actions slot (e.g. Add Product button) */}
            {headerActions && (
              <div className="itmu-topbar-actions-slot">
                {headerActions}
              </div>
            )}

            {/* Public Store link */}
            <a 
              href="/" 
              target="_blank" 
              rel="noreferrer" 
              className="itmu-store-link-btn"
              title="Open Public Nursery Store in new tab"
            >
              <ExternalLink size={16} />
              <span className="itmu-store-link-text">View Store</span>
            </a>

            {/* Notification Bell */}
            <div className="itmu-dropdown-rel">
              <button
                type="button"
                className="itmu-notif-btn"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={20} color="#172B24" />
                <span className="itmu-notif-badge">3</span>
              </button>

              {notificationsOpen && (
                <div className="itmu-dropdown-panel itmu-notif-panel">
                  <div className="itmu-dropdown-head">
                    <strong>Notifications</strong>
                    <span className="itmu-chip-small">3 New</span>
                  </div>
                  <div className="itmu-notif-list">
                    <div className="itmu-notif-item">
                      <div className="itmu-notif-dot" />
                      <div>
                        <p><strong>Catalog Synchronized:</strong> Live database connected and synced.</p>
                        <small>Just now</small>
                      </div>
                    </div>
                    <div className="itmu-notif-item">
                      <div className="itmu-notif-dot itmu-notif-dot--amber" />
                      <div>
                        <p><strong>Stock Alert:</strong> Check low-stock alerts before peak harvest season.</p>
                        <small>15 min ago</small>
                      </div>
                    </div>
                    <div className="itmu-notif-item">
                      <div className="itmu-notif-dot itmu-notif-dot--blue" />
                      <div>
                        <p><strong>Admin Session:</strong> Active as Super Admin.</p>
                        <small>Today</small>
                      </div>
                    </div>
                  </div>
                  <div className="itmu-dropdown-foot">
                    <button type="button" onClick={() => setNotificationsOpen(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <div className="itmu-dropdown-rel">
              <button
                type="button"
                className="itmu-admin-profile-btn"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                aria-label="Admin Profile Menu"
              >
                <div className="itmu-profile-avatar" title={adminUser.first_name || adminUser.username || 'Admin'}>
                  {adminUser.first_name ? adminUser.first_name[0].toUpperCase() : (adminUser.username ? adminUser.username[0].toUpperCase() : 'A')}
                </div>
                <div className="itmu-profile-info-text">
                  <span className="itmu-profile-name">
                    {adminUser.first_name || adminUser.username || 'Admin'}
                  </span>
                  <span className="itmu-profile-role-badge">Admin</span>
                </div>
                <ChevronDown size={14} color="#64748B" className="itmu-profile-chevron" />
              </button>

              {profileDropdownOpen && (
                <div className="itmu-dropdown-panel itmu-profile-panel">
                  <div className="itmu-profile-dropdown-head">
                    <strong>{adminUser.first_name || adminUser.username || 'Administrator'}</strong>
                    <small>{adminUser.email || 'admin@itmu-ehaat.in'}</small>
                  </div>
                  <div className="itmu-profile-links">
                    <button 
                      type="button" 
                      onClick={() => handleNavClick(navItems[0])}
                      className="itmu-profile-action"
                    >
                      <LayoutDashboard size={16} />
                      <span>Admin Dashboard</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleNavClick(navItems[1])}
                      className="itmu-profile-action"
                    >
                      <Package size={16} />
                      <span>Product Management</span>
                    </button>
                    <div className="itmu-profile-sep" />
                    <button 
                      type="button" 
                      onClick={handleSignOut}
                      className="itmu-profile-action itmu-profile-action--danger"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="itmu-content-canvas">
          {children}
        </main>
      </div>
    </div>
  );
}
