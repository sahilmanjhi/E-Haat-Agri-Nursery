import React, { useEffect, useState, useMemo } from 'react';
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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  IndianRupee,
  Sprout,
  Plus,
  Box,
  MoreHorizontal,
  X,
  Menu,
  CheckCircle2,
  ExternalLink,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { adminVerifySession, fetchAdminDashboardStats, logoutUser } from '../services/api';

export default function AdminDashboard({ onLogout, onNavigate }) {
  // Session & Auth
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');

  // Dashboard Telemetry
  const [stats, setStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '30d' | '3m' | '6m' | '1y' | 'custom'
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'add_product' | 'categories' | 'inventory' | 'orders' | 'order_detail'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Set browser tab title
  useEffect(() => {
    document.title = 'ITMU E-Haat — Admin Dashboard';
  }, []);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Admin!';
    if (hour < 17) return 'Good Afternoon, Admin!';
    return 'Good Evening, Admin!';
  }, []);

  // Verify administrator session
  useEffect(() => {
    let isMounted = true;
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
  }, []);

  // Fetch telemetry metrics
  const loadStats = async (range = dateRange) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const res = await fetchAdminDashboardStats(range);
      if (res && res.status === 'success') {
        setStats(res);
      } else {
        setDataError(res.message || 'Failed to load statistics.');
      }
    } catch (e) {
      setDataError('Network connection error.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadStats(dateRange);
    }
  }, [adminUser, dateRange]);

  // Logout handler
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      if (onLogout) onLogout();
      else {
        window.history.pushState({}, '', '/admin/login');
        window.location.pathname = '/admin/login';
      }
    }
  };

  // Nav items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'inventory', label: 'Inventory', icon: CalendarDays },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setMobileSidebarOpen(false);
    if (id === 'dashboard') {
      setActiveNav('dashboard');
    } else if (id === 'products') {
      if (onNavigate) {
        onNavigate('/admin/products');
      } else {
        window.history.pushState({}, '', '/admin/products');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (id === 'categories') {
      if (onNavigate) {
        onNavigate('/admin/categories');
      } else {
        window.history.pushState({}, '', '/admin/categories');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (id === 'inventory') {
      if (onNavigate) {
        onNavigate('/admin/inventory');
      } else {
        window.history.pushState({}, '', '/admin/inventory');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (id === 'orders') {
      if (onNavigate) {
        onNavigate('/admin/orders');
      } else {
        window.history.pushState({}, '', '/admin/orders');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (id === 'customers') {
      if (onNavigate) {
        onNavigate('/admin/customers');
      } else {
        window.history.pushState({}, '', '/admin/customers');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else {
      setActiveNav(id);
    }
  };

  // Metrics from API (Strictly real database telemetry)
  const metrics = stats?.metrics || {
    total_products: 0,
    total_categories: 0,
    total_customers: 0,
    total_orders: 0,
    total_revenue: 0.0,
    low_stock_products: 0,
    revenue_this_month: 0.0
  };

  const inventoryHealth = stats?.inventory_health || {
    total_stock_units: 0,
    in_stock_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    health_percentage: 100.0,
    category_distribution: []
  };

  // Real database products ordered by reviews and rating
  const topSellingProducts = stats?.top_selling_products || [];

  // Plant image resolver
  const getPlantThumb = (img, name) => {
    if (img && img.startsWith('/images/')) return img;
    const lower = (name || '').toLowerCase();
    if (lower.includes('snake')) return '/images/plants/snake_plant.png';
    if (lower.includes('monstera')) return '/images/plants/monstera.png';
    if (lower.includes('zz')) return '/images/plants/zz_plant.png';
    if (lower.includes('lily')) return '/images/plants/peace_lily.png';
    if (lower.includes('palm') || lower.includes('areca')) return '/images/plants/areca_palm.jpg';
    if (lower.includes('jade') || lower.includes('money')) return '/images/plants/jade_plant.jpg';
    if (lower.includes('seed')) return '/images/plants/heirloom_seeds.jpg';
    return '/images/plants/snake_plant.png';
  };

  // Low stock alert items from real DB
  const lowStockAlerts = stats?.low_stock_alerts || [];

  // Recent orders (real DB telemetry; empty when no orders exist)
  const recentOrders = stats?.recent_orders || [];

  // Sales Chart Data (real DB telemetry; empty when no transactions exist)
  const salesChartData = stats?.sales_chart?.points || [];

  // Derived period metrics
  const periodRevenue = useMemo(() => {
    return stats?.sales_chart?.period_revenue || salesChartData.reduce((acc, p) => acc + (p.revenue || 0), 0);
  }, [stats, salesChartData]);

  const periodOrders = useMemo(() => {
    return stats?.sales_chart?.period_orders || salesChartData.reduce((acc, p) => acc + (p.orders_count || 0), 0);
  }, [stats, salesChartData]);

  const averageOrderValue = useMemo(() => {
    if (stats?.sales_chart?.average_order_value) return stats.sales_chart.average_order_value;
    return periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;
  }, [stats, periodRevenue, periodOrders]);

  // Filter low stock table based on top search bar query
  const filteredStock = useMemo(() => {
    if (!searchQuery.trim()) return lowStockAlerts;
    const q = searchQuery.toLowerCase();
    return lowStockAlerts.filter(item => 
      item.name.toLowerCase().includes(q) ||
      (item.botanical_name && item.botanical_name.toLowerCase().includes(q))
    );
  }, [lowStockAlerts, searchQuery]);

  // Filter orders based on search bar query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return recentOrders;
    const q = searchQuery.toLowerCase();
    return recentOrders.filter(ord => 
      ord.customer.toLowerCase().includes(q) ||
      ord.id.toLowerCase().includes(q) ||
      ord.status.toLowerCase().includes(q)
    );
  }, [recentOrders, searchQuery]);

  // Range display label
  const rangeLabelMap = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '3m': 'Last 3 Months',
    '6m': 'Last 6 Months',
    '1y': 'This Year',
    'custom': 'Custom Range'
  };

  // Loading screen
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

  // Access denied
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

  // Max value for SVG chart scaling
  const maxRev = Math.max(...salesChartData.map(d => d.revenue), 40000);
  const maxOrd = Math.max(...salesChartData.map(d => d.orders_count), 40);

  return (
    <div className="itmu-dashboard-layout">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="itmu-sidebar-backdrop" 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* =========================================================================
          1. DARK GREEN SIDEBAR WITH OFFICIAL ITMU E-HAAT LOGO
         ========================================================================= */}
      <aside className={`itmu-sidebar ${mobileSidebarOpen ? 'itmu-sidebar--open' : ''}`}>
        {/* Brand Header with Official Dual Logos: ITM University & ITMU E-Haat */}
        <div className="itmu-sidebar-brand">
          <div 
            className="itmu-official-logo-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveNav('dashboard')}
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

        {/* Navigation Menu */}
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
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={20} className="itmu-nav-icon" />
                    <span className="itmu-nav-text">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Promo Card: "Greener Spaces Happier Lives" */}
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

        {/* Sidebar Logout Button */}
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

      {/* =========================================================================
          2. MAIN CONTENT BODY
         ========================================================================= */}
      <div className="itmu-main-wrapper">
        {/* Top Navigation Bar */}
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

            {/* Rounded Global Search Bar */}
            <div className="itmu-search-bar">
              <Search size={18} className="itmu-search-icon" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="itmu-search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="itmu-search-clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="itmu-topbar-right">
            {/* Notification Bell with Badge */}
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
                        <p><strong>Nursery Catalog Loaded:</strong> {metrics.total_products} botanical varieties live in database.</p>
                        <small>2 min ago</small>
                      </div>
                    </div>
                    <div className="itmu-notif-item">
                      <div className="itmu-notif-dot itmu-notif-dot--amber" />
                      <div>
                        <p><strong>Stock Health Check:</strong> {metrics.low_stock_products} products below inventory reorder line.</p>
                        <small>15 min ago</small>
                      </div>
                    </div>
                    <div className="itmu-notif-item">
                      <div className="itmu-notif-dot itmu-notif-dot--blue" />
                      <div>
                        <p><strong>Backend Telemetry:</strong> Connected to SQLite backend on port 8000.</p>
                        <small>1 hr ago</small>
                      </div>
                    </div>
                  </div>
                  <div className="itmu-dropdown-foot">
                    <button type="button" onClick={() => setNotificationsOpen(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Pill */}
            <div className="itmu-dropdown-rel">
              <button
                type="button"
                className="itmu-admin-profile-btn"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
              >
                <div className="itmu-profile-avatar">
                  {adminUser.first_name ? adminUser.first_name[0].toUpperCase() : 'A'}
                </div>
                <span className="itmu-profile-name">
                  {adminUser.first_name ? adminUser.first_name : 'Admin'}
                </span>
                <ChevronDown size={14} color="#64748B" />
              </button>

              {profileDropdownOpen && (
                <div className="itmu-dropdown-panel itmu-profile-panel">
                  <div className="itmu-profile-dropdown-head">
                    <strong>{adminUser.first_name ? `${adminUser.first_name} ${adminUser.last_name || ''}`.trim() : 'Administrator'}</strong>
                    <small>{adminUser.email || 'admin@itmu-ehaat.in'}</small>
                  </div>
                  <div className="itmu-profile-links">
                    <button 
                      type="button" 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        loadStats();
                      }}
                      className="itmu-profile-action"
                    >
                      <RefreshCw size={14} />
                      <span>Refresh Telemetry</span>
                    </button>
                    <a 
                      href="/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="itmu-profile-action"
                    >
                      <ExternalLink size={14} />
                      <span>Live Storefront</span>
                    </a>
                    <button 
                      type="button" 
                      onClick={handleSignOut} 
                      className="itmu-profile-action itmu-profile-action--danger"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="itmu-content-canvas">
          {/* Breadcrumb Navigation */}
          <div className="itmu-breadcrumb-row">
            <span className="itmu-bc-link">Home</span>
            <span className="itmu-bc-slash">&gt;</span>
            <span className="itmu-bc-active">Dashboard</span>
          </div>

          {/* Heading Banner with "Good Morning, Admin!" + Calligraphy Art */}
          <section className="itmu-header-banner">
            <div className="itmu-banner-text-side">
              <div className="itmu-banner-heading-wrap">
                <h1 className="itmu-page-title">{greeting}</h1>
                <span className="itmu-leaf-pill">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20.24 12.24C21.09 7.78 17.78 3.5 13.5 3.5C7.5 3.5 3.5 8.5 3.5 14.5C3.5 18 6.5 20.5 10 20.5C16 20.5 19.5 16.5 20.24 12.24Z" fill="#146B3A" />
                    <path d="M3.5 20.5C6.5 17.5 10.5 13.5 14.5 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <p className="itmu-page-subtitle">
                Here's what's happening with your nursery business today.
              </p>
            </div>

            {/* Right side banner: "Nurturing A Greener Tomorrow" with potted plants */}
            <div className="itmu-banner-art-side">
              <div className="itmu-art-slogan">
                <svg className="itmu-slogan-leaf" width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20.24 12.24C21.09 7.78 17.78 3.5 13.5 3.5C7.5 3.5 3.5 8.5 3.5 14.5C3.5 18 6.5 20.5 10 20.5C16 20.5 19.5 16.5 20.24 12.24Z" fill="#146B3A" />
                  <path d="M3.5 20.5C6.5 17.5 10.5 13.5 14.5 12" stroke="#E8F5E9" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <div className="itmu-slogan-text">
                  <span className="itmu-slogan-line1">Nurturing</span>
                  <span className="itmu-slogan-line2">A Greener Tomorrow</span>
                </div>
              </div>
              <div className="itmu-art-plants-box">
                <img 
                  src="/images/plants/peace_lily.png" 
                  alt="Peace Lily" 
                  className="itmu-art-plant-img itmu-plant-lily" 
                />
                <img 
                  src="/images/plants/monstera.png" 
                  alt="Monstera Deliciosa" 
                  className="itmu-art-plant-img itmu-plant-monstera" 
                />
                <img 
                  src="/images/plants/snake_plant.png" 
                  alt="Snake Plant" 
                  className="itmu-art-plant-img itmu-plant-snake" 
                />
              </div>
            </div>
          </section>

          {/* =========================================================================
              3. SIX SUMMARY CARDS ROW (Exact Match to Reference + Clickable)
             ========================================================================= */}
          <section className="itmu-cards-grid">
            {/* 1. Total Products */}
            <div
              className="itmu-stat-card"
              onClick={() => {
                if (onNavigate) onNavigate('/admin/products');
                else {
                  window.history.pushState({}, '', '/admin/products');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
                <Sprout size={20} color="#146B3A" />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">{metrics.total_products}</span>
                <span className="itmu-stat-title">Total Products</span>
                <div className="itmu-stat-trend itmu-stat-trend--green">
                  <span>● Live Catalog</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>

            {/* 2. Total Categories */}
            <div
              className="itmu-stat-card"
              onClick={() => {
                if (onNavigate) onNavigate('/admin/categories');
                else {
                  window.history.pushState({}, '', '/admin/categories');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
                <Layers size={20} color="#146B3A" />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">{metrics.total_categories}</span>
                <span className="itmu-stat-title">Total Categories</span>
                <div className="itmu-stat-trend itmu-stat-trend--green">
                  <span>● Active Segments</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>

            {/* 3. Total Customers */}
            <div
              className="itmu-stat-card"
              onClick={() => {
                if (onNavigate) onNavigate('/admin/customers');
                else {
                  window.history.pushState({}, '', '/admin/customers');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
                <Users size={20} color="#146B3A" />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">{metrics.total_customers.toLocaleString('en-IN')}</span>
                <span className="itmu-stat-title">Total Customers</span>
                <div className="itmu-stat-trend itmu-stat-trend--green">
                  <span>● Registered Users</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>

            {/* 4. Total Orders */}
            <div className="itmu-stat-card" onClick={() => setActiveModal('orders')} role="button" tabIndex={0}>
              <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
                <ShoppingCart size={20} color="#146B3A" />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">{metrics.total_orders}</span>
                <span className="itmu-stat-title">Total Orders</span>
                <div className="itmu-stat-trend itmu-stat-trend--green">
                  <span>● Recorded Orders</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>

            {/* 5. Total Revenue */}
            <div className="itmu-stat-card">
              <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
                <IndianRupee size={20} color="#146B3A" />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">
                  ₹ {metrics.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="itmu-stat-title">Total Revenue</span>
                <div className="itmu-stat-trend itmu-stat-trend--green">
                  <span>● Total Sales</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>

            {/* 6. Low-Stock Products */}
            <div
              className="itmu-stat-card"
              onClick={() => {
                if (onNavigate) onNavigate('/admin/inventory');
                else {
                  window.history.pushState({}, '', '/admin/inventory');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={`itmu-stat-icon-circle ${metrics.low_stock_products > 0 ? 'itmu-stat-icon-circle--red' : 'itmu-stat-icon-circle--green'}`}>
                <AlertTriangle size={20} color={metrics.low_stock_products > 0 ? '#DC2626' : '#146B3A'} />
              </div>
              <div className="itmu-stat-details">
                <span className="itmu-stat-number">{metrics.low_stock_products}</span>
                <span className="itmu-stat-title">Low-Stock Products</span>
                <div className={`itmu-stat-trend ${metrics.low_stock_products > 0 ? 'itmu-stat-trend--red' : 'itmu-stat-trend--green'}`}>
                  <span>{metrics.low_stock_products > 0 ? '⚠ Attention Required' : '✓ All in Stock'}</span>
                  <ChevronRight size={14} className="itmu-trend-arrow" />
                </div>
              </div>
            </div>
          </section>

          {/* Top Summary Banner: Real Database Telemetry & Slogan */}
          <div className="itmu-bottom-summary-strip">
            <div className="itmu-summary-left">
              <div className="itmu-summary-stat">
                <span>Total Orders</span>
                <strong>{metrics.total_orders}</strong>
              </div>
              <div className="itmu-summary-divider" />
              <div className="itmu-summary-stat">
                <span>Active Customers</span>
                <strong>{metrics.total_customers}</strong>
              </div>
              <div className="itmu-summary-divider" />
              <div className="itmu-summary-stat">
                <span>Total Products</span>
                <strong>{metrics.total_products}</strong>
              </div>
              <div className="itmu-summary-divider" />
              <div className="itmu-summary-stat">
                <span>Revenue This Month</span>
                <strong className="itmu-text-green">₹ {metrics.revenue_this_month.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="itmu-summary-right">
              <Sprout size={16} color="#146B3A" />
              <span>Growing Together — More greenery, healthier spaces, a better tomorrow.</span>
            </div>
          </div>

          {/* =========================================================================
              4. MIDDLE ROW: SALES OVERVIEW (CHART) & QUICK ACTIONS
             ========================================================================= */}
          <div className="itmu-middle-grid">
            {/* Left: Large Sales Overview Panel */}
            <div className="itmu-panel itmu-sales-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <BarChart3 size={18} color="#146B3A" />
                    <h3>Sales Overview</h3>
                  </div>
                  <p className="itmu-panel-sub">Total revenue and orders over time</p>
                </div>

                {/* Date Dropdown Select with all options */}
                <div className="itmu-chart-dropdown-wrap">
                  <button
                    type="button"
                    className="itmu-dropdown-btn"
                    onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                  >
                    <span>{rangeLabelMap[dateRange] || 'Last 30 Days'}</span>
                    <ChevronDown size={14} />
                  </button>

                  {dateDropdownOpen && (
                    <div className="itmu-dropdown-menu-list">
                      {['7d', '30d', '3m', '6m', '1y', 'custom'].map((rng) => (
                        <button 
                          key={rng}
                          type="button" 
                          onClick={() => { setDateRange(rng); setDateDropdownOpen(false); }}
                          className={dateRange === rng ? 'active' : ''}
                        >
                          {rangeLabelMap[rng]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Strip inside Sales Overview */}
              <div className="itmu-sales-kpi-strip">
                <div className="itmu-sales-kpi-item">
                  <span>Total Revenue</span>
                  <strong>₹ {periodRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div className="itmu-sales-kpi-divider" />
                <div className="itmu-sales-kpi-item">
                  <span>Total Orders</span>
                  <strong>{periodOrders}</strong>
                </div>
                <div className="itmu-sales-kpi-divider" />
                <div className="itmu-sales-kpi-item">
                  <span>Average Order Value</span>
                  <strong>₹ {averageOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="itmu-chart-legend">
                <div className="itmu-legend-item">
                  <span className="itmu-legend-dot itmu-legend-dot--darkgreen" />
                  <span>Revenue (₹)</span>
                </div>
                <div className="itmu-legend-item">
                  <span className="itmu-legend-rect itmu-legend-rect--lightgreen" />
                  <span>Orders</span>
                </div>
              </div>

              {/* Dynamic Chart Container */}
              <div className="itmu-chart-container">
                {salesChartData.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    backgroundColor: '#F8FAF7',
                    borderRadius: 12,
                    border: '1px dashed #D1E7DD',
                    padding: 24,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10
                    }}>
                      <BarChart3 size={24} color="#146B3A" />
                    </div>
                    <strong style={{ color: '#172B24', fontSize: '0.95rem', marginBottom: 4 }}>
                      Real-Time Sales Tracking
                    </strong>
                    <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0, maxWidth: 420 }}>
                      No customer transactions have been recorded in the database yet. Sales graphs and revenue curves will populate automatically as orders are placed.
                    </p>
                  </div>
                ) : (
                  <svg viewBox="0 0 650 200" className="itmu-chart-svg" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="45" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="160" x2="600" y2="160" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Left Y-axis labels */}
                    <text x="40" y="24" textAnchor="end" fontSize="10" fill="#94A3B8">{(maxRev / 1000).toFixed(0)}K</text>
                    <text x="40" y="64" textAnchor="end" fontSize="10" fill="#94A3B8">{((maxRev * 0.75) / 1000).toFixed(0)}K</text>
                    <text x="40" y="104" textAnchor="end" fontSize="10" fill="#94A3B8">{((maxRev * 0.5) / 1000).toFixed(0)}K</text>
                    <text x="40" y="144" textAnchor="end" fontSize="10" fill="#94A3B8">{((maxRev * 0.25) / 1000).toFixed(0)}K</text>
                    <text x="40" y="164" textAnchor="end" fontSize="10" fill="#94A3B8">0</text>

                    {/* Right Y-axis labels */}
                    <text x="608" y="24" textAnchor="start" fontSize="10" fill="#94A3B8">{maxOrd}</text>
                    <text x="608" y="64" textAnchor="start" fontSize="10" fill="#94A3B8">{(maxOrd * 0.75).toFixed(0)}</text>
                    <text x="608" y="104" textAnchor="start" fontSize="10" fill="#94A3B8">{(maxOrd * 0.5).toFixed(0)}</text>
                    <text x="608" y="144" textAnchor="start" fontSize="10" fill="#94A3B8">{(maxOrd * 0.25).toFixed(0)}</text>
                    <text x="608" y="164" textAnchor="start" fontSize="10" fill="#94A3B8">0</text>

                    {/* Order Vertical Bars (Light Mint) */}
                    {salesChartData.map((pt, i) => {
                      const step = 550 / Math.max(salesChartData.length - 1, 1);
                      const x = 50 + i * step;
                      const barHeight = Math.min((pt.orders_count / Math.max(maxOrd, 1)) * 130, 130);
                      const y = 160 - barHeight;
                      return (
                        <rect 
                          key={i} 
                          x={x - 6} 
                          y={y} 
                          width="12" 
                          height={barHeight} 
                          rx="3" 
                          fill="#C4E7C7" 
                        />
                      );
                    })}

                    {/* Revenue Spline Line (Dark Forest Green) */}
                    <path
                      d={salesChartData.map((pt, i) => {
                        const step = 550 / Math.max(salesChartData.length - 1, 1);
                        const x = 50 + i * step;
                        const y = 160 - Math.min((pt.revenue / Math.max(maxRev, 1)) * 135, 135);
                        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#064E35"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points on Line */}
                    {salesChartData.map((pt, i) => {
                      const step = 550 / Math.max(salesChartData.length - 1, 1);
                      const x = 50 + i * step;
                      const y = 160 - Math.min((pt.revenue / Math.max(maxRev, 1)) * 135, 135);
                      return (
                        <circle 
                          key={i} 
                          cx={x} 
                          cy={y} 
                          r="3.5" 
                          fill="#FFFFFF" 
                          stroke="#064E35" 
                          strokeWidth="2.5" 
                        />
                      );
                    })}

                    {/* X-axis date labels */}
                    {salesChartData.map((pt, i) => {
                      const step = 550 / Math.max(salesChartData.length - 1, 1);
                      const x = 50 + i * step;
                      return (
                        <text key={i} x={x} y="180" textAnchor="middle" fontSize="10" fill="#64748B">
                          {pt.date}
                        </text>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="itmu-panel itmu-actions-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <span className="itmu-lightning-icon">⚡</span>
                    <h3>Quick Actions</h3>
                  </div>
                  <p className="itmu-panel-sub">Get started with common tasks</p>
                </div>
              </div>

              <div className="itmu-actions-grid">
                {/* 1. Add New Product */}
                <button
                  type="button"
                  className="itmu-action-card"
                  onClick={() => {
                    if (onNavigate) onNavigate('/admin/products/create');
                    else {
                      window.history.pushState({}, '', '/admin/products/create');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                >
                  <div className="itmu-action-icon itmu-action-icon--darkgreen">
                    <Plus size={18} color="#FFFFFF" />
                  </div>
                  <div className="itmu-action-text">
                    <strong>Add New Product</strong>
                    <span>Add plants, pots, seeds and more</span>
                  </div>
                  <ChevronRight size={18} className="itmu-action-arrow" />
                </button>

                {/* 2. Manage Categories */}
                <button
                  type="button"
                  className="itmu-action-card"
                  onClick={() => {
                    if (onNavigate) onNavigate('/admin/categories');
                    else {
                      window.history.pushState({}, '', '/admin/categories');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                >
                  <div className="itmu-action-icon itmu-action-icon--lightgreen">
                    <Layers size={18} color="#064E35" />
                  </div>
                  <div className="itmu-action-text">
                    <strong>Manage Categories</strong>
                    <span>Organize your product categories</span>
                  </div>
                  <ChevronRight size={18} className="itmu-action-arrow" />
                </button>

                {/* 3. Update Inventory */}
                <button
                  type="button"
                  className="itmu-action-card"
                  onClick={() => setActiveModal('inventory')}
                >
                  <div className="itmu-action-icon itmu-action-icon--lightgreen">
                    <Box size={18} color="#064E35" />
                  </div>
                  <div className="itmu-action-text">
                    <strong>Update Inventory</strong>
                    <span>Manage stock and availability</span>
                  </div>
                  <ChevronRight size={18} className="itmu-action-arrow" />
                </button>

                {/* 4. View All Orders */}
                <button
                  type="button"
                  className="itmu-action-card"
                  onClick={() => setActiveModal('orders')}
                >
                  <div className="itmu-action-icon itmu-action-icon--lightgreen">
                    <ShoppingCart size={18} color="#064E35" />
                  </div>
                  <div className="itmu-action-text">
                    <strong>View All Orders</strong>
                    <span>Process and track orders</span>
                  </div>
                  <ChevronRight size={18} className="itmu-action-arrow" />
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              5. INVENTORY HEALTH & TOP SELLING PRODUCTS
             ========================================================================= */}
          <div className="itmu-inventory-grid">
            {/* Dedicated Inventory Health Card */}
            <div className="itmu-panel itmu-inv-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <Box size={18} color="#146B3A" />
                    <h3>Inventory Health</h3>
                  </div>
                  <p className="itmu-panel-sub">Real-time nursery inventory monitoring</p>
                </div>
                <button 
                  type="button" 
                  className="itmu-view-all-link"
                  onClick={() => setActiveModal('inventory')}
                >
                  <span>Audit Stock</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="itmu-inv-content">
                {/* Circular Indicator + High Level Metrics */}
                <div className="itmu-inv-circle-wrap">
                  <div className="itmu-inv-radial-box">
                    <svg viewBox="0 0 36 36" className="itmu-circular-chart">
                      <path
                        className="itmu-circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="itmu-circle-fill"
                        strokeDasharray={`${inventoryHealth.health_percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="itmu-radial-text">
                      <strong>{inventoryHealth.health_percentage}%</strong>
                      <small>Healthy</small>
                    </div>
                  </div>

                  <div className="itmu-inv-badges-grid">
                    <div className="itmu-inv-metric-badge">
                      <span className="itmu-badge-dot itmu-badge-dot--green" />
                      <div>
                        <strong>{inventoryHealth.in_stock_products}</strong>
                        <span>In Stock</span>
                      </div>
                    </div>
                    <div className="itmu-inv-metric-badge">
                      <span className="itmu-badge-dot itmu-badge-dot--orange" />
                      <div>
                        <strong>{inventoryHealth.low_stock_products}</strong>
                        <span>Low Stock</span>
                      </div>
                    </div>
                    <div className="itmu-inv-metric-badge">
                      <span className="itmu-badge-dot itmu-badge-dot--red" />
                      <div>
                        <strong>{inventoryHealth.out_of_stock_products}</strong>
                        <span>Out of Stock</span>
                      </div>
                    </div>
                    <div className="itmu-inv-metric-badge">
                      <span className="itmu-badge-dot itmu-badge-dot--dark" />
                      <div>
                        <strong>{inventoryHealth.total_stock_units}</strong>
                        <span>Catalog Units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category-wise Stock Distribution */}
                <div className="itmu-cat-stock-bars">
                  <span className="itmu-cat-bars-title">Category Stock Distribution</span>
                  {inventoryHealth.category_distribution.length === 0 ? (
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No categories registered.</p>
                  ) : (
                    inventoryHealth.category_distribution.map((cat, idx) => (
                      <div key={idx} className="itmu-cat-bar-item">
                        <div className="itmu-cat-bar-labels">
                          <span>{cat.name}</span>
                          <strong>{cat.in_stock}/{cat.total_products} In Stock</strong>
                        </div>
                        <div className="itmu-cat-progress-track">
                          <div 
                            className="itmu-cat-progress-fill" 
                            style={{ width: `${Math.min((cat.in_stock / Math.max(cat.total_products, 1)) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Top Popular Products Card */}
            <div className="itmu-panel itmu-topsell-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <ShoppingBag size={18} color="#146B3A" />
                    <h3>Top Rated Products</h3>
                  </div>
                  <p className="itmu-panel-sub">Highest rated botanical catalog items</p>
                </div>
                <button 
                  type="button" 
                  className="itmu-view-all-link"
                  onClick={() => setActiveModal('add_product')}
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="itmu-topsell-list">
                {topSellingProducts.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.85rem', padding: 16 }}>No catalog products found in database.</p>
                ) : (
                  topSellingProducts.map((prod) => (
                    <div key={prod.id} className="itmu-topsell-row">
                      <div className="itmu-topsell-left">
                        <img 
                          src={getPlantThumb(prod.image, prod.name)} 
                          alt={prod.name} 
                          className="itmu-topsell-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/plants/snake_plant.png';
                          }}
                        />
                        <div className="itmu-topsell-info">
                          <strong>{prod.name}</strong>
                          <span>{prod.category} {prod.botanical_name ? `• ${prod.botanical_name}` : ''}</span>
                        </div>
                      </div>
                      <div className="itmu-topsell-right">
                        <div className="itmu-topsell-units">
                          <strong>★ {prod.rating || 4.8} ({prod.reviews_count?.toLocaleString('en-IN') || 0})</strong>
                          <span>₹ {prod.price}</span>
                        </div>
                        <span className={`itmu-trend-badge-green ${prod.in_stock ? '' : 'itmu-trend-badge-red'}`}>
                          {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              6. RECENT ORDERS & TOP LOW STOCK PRODUCTS
             ========================================================================= */}
          <div className="itmu-bottom-grid">
            {/* Left: Recent Orders Table */}
            <div className="itmu-panel itmu-table-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <ShoppingCart size={18} color="#064E35" />
                    <h3>Recent Orders</h3>
                  </div>
                  <p className="itmu-panel-sub">Live customer transactions from database</p>
                </div>
                <button 
                  type="button" 
                  className="itmu-view-all-link"
                  onClick={() => setActiveModal('orders')}
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="itmu-table-responsive">
                <table className="itmu-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ width: 60, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <ShoppingCart size={28} color="#94A3B8" />
                            <strong style={{ color: '#172B24', fontSize: '0.92rem' }}>No Orders Recorded</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              Customer checkout orders will appear here automatically in real time.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord, idx) => (
                        <tr key={ord.id || idx}>
                          <td className="itmu-td-muted">{ord.num || idx + 1}</td>
                          <td className="itmu-td-order-id">{ord.id}</td>
                          <td className="itmu-td-customer">{ord.customer}</td>
                          <td className="itmu-td-muted">{ord.date}</td>
                          <td className="itmu-td-amount">{ord.amount}</td>
                          <td>
                            <span className={`itmu-status-pill itmu-status-pill--${(ord.status || 'pending').toLowerCase()}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="itmu-td-action">
                            <button 
                              type="button" 
                              className="itmu-action-dots-btn"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setActiveModal('order_detail');
                              }}
                              title="View order details"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Low Stock Alerts Table */}
            <div className="itmu-panel itmu-table-panel">
              <div className="itmu-panel-header">
                <div>
                  <div className="itmu-panel-title-row">
                    <AlertTriangle size={18} color="#DC2626" />
                    <h3>Top Low Stock Products</h3>
                  </div>
                  <p className="itmu-panel-sub">Products requiring restock attention</p>
                </div>
                <button 
                  type="button" 
                  className="itmu-view-all-link"
                  onClick={() => setActiveModal('inventory')}
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="itmu-table-responsive">
                <table className="itmu-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Product</th>
                      <th style={{ minWidth: 110 }}>Available Qty</th>
                      <th style={{ minWidth: 110 }}>Stock Status</th>
                      <th style={{ width: 60, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={28} color="#146B3A" />
                            <strong style={{ color: '#172B24', fontSize: '0.92rem' }}>All Products In Stock</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              All {metrics.total_products} items in the database are currently healthy and available.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStock.map((prod, idx) => (
                        <tr key={prod.id || idx}>
                          <td className="itmu-td-muted">{prod.num || idx + 1}</td>
                          <td className="itmu-td-product">
                            <img 
                              src={getPlantThumb(prod.image, prod.name)} 
                              alt={prod.name} 
                              className="itmu-plant-table-img" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/plants/snake_plant.png';
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="itmu-product-name">{prod.name}</span>
                              {prod.botanical_name && (
                                <small style={{ color: '#94A3B8', fontSize: '0.72rem', fontStyle: 'italic' }}>
                                  {prod.botanical_name}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className={`itmu-td-stock ${prod.current_stock === 0 ? 'itmu-td-stock--zero' : ''}`}>
                            {prod.current_stock} units
                          </td>
                          <td>
                            <span className={`itmu-stock-pill itmu-stock-pill--${prod.status === 'Out of Stock' ? 'out' : 'low'}`}>
                              <span className={`itmu-pill-dot ${prod.status === 'Out of Stock' ? 'itmu-pill-dot--red' : 'itmu-pill-dot--orange'}`} />
                              {prod.status}
                            </span>
                          </td>
                          <td className="itmu-td-action">
                            <button 
                              type="button" 
                              className="itmu-action-dots-btn"
                              onClick={() => setActiveModal('inventory')}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          8. INTERACTIVE MODALS (Connected to Real Database Entities)
         ========================================================================= */}
      {activeModal && (
        <div className="itmu-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="itmu-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="itmu-modal-header">
              <div className="itmu-modal-title">
                {activeModal === 'add_product' && <><Plus size={20} color="#146B3A" /><h3>Nursery Botanical Catalog ({metrics.total_products} Products)</h3></>}
                {activeModal === 'categories' && <><Layers size={20} color="#146B3A" /><h3>Nursery Categories ({metrics.total_categories} Segments)</h3></>}
                {activeModal === 'inventory' && <><Box size={20} color="#146B3A" /><h3>Nursery Stock &amp; Inventory Management</h3></>}
                {activeModal === 'orders' && <><ShoppingCart size={20} color="#146B3A" /><h3>Customer Orders Fulfillment</h3></>}
                {activeModal === 'order_detail' && <><ShoppingCart size={20} color="#146B3A" /><h3>Order Details &bull; {selectedOrder?.id}</h3></>}
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="itmu-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="itmu-modal-body">
              {activeModal === 'add_product' && (
                <div>
                  <div className="itmu-modal-alert">
                    <CheckCircle2 size={18} color="#146B3A" />
                    <span>Live database records: <strong>{metrics.total_products} botanical varieties</strong> currently active.</span>
                  </div>
                  <div className="itmu-modal-product-list">
                    {(stats?.catalog_inventory || []).map((p, idx) => (
                      <div key={p.id || idx} className="itmu-modal-item-row">
                        <img 
                          src={getPlantThumb(p.image, p.name)} 
                          alt={p.name} 
                          className="itmu-modal-thumb" 
                        />
                        <div className="itmu-modal-item-info">
                          <strong>{p.name}</strong>
                          <span>{p.category || 'General'} {p.botanical_name ? `• ${p.botanical_name}` : ''}</span>
                        </div>
                        <div className="itmu-modal-item-price">
                          <span className={p.in_stock ? 'itmu-instock-tag' : 'itmu-outstock-tag'}>
                            {p.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <strong>₹ {p.price}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'categories' && (
                <div>
                  <div className="itmu-modal-alert">
                    <Layers size={18} color="#146B3A" />
                    <span>Existing database records: <strong>{metrics.total_categories} nursery categories</strong> registered.</span>
                  </div>
                  <div className="itmu-cat-grid">
                    {(inventoryHealth.category_distribution || []).map((cat, i) => (
                      <div key={i} className="itmu-cat-box">
                        <strong>{cat.name}</strong>
                        <p>{cat.in_stock} of {cat.total_products} in stock</p>
                        <span className="itmu-cat-badge">{cat.total_products} {cat.total_products === 1 ? 'Product' : 'Products'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'inventory' && (
                <div>
                  <div className="itmu-modal-alert">
                    <Box size={18} color="#146B3A" />
                    <span>Catalog stock health: <strong>{inventoryHealth.health_percentage}%</strong> ({inventoryHealth.in_stock_products} in stock, {inventoryHealth.out_of_stock_products} out of stock).</span>
                  </div>
                  <div className="itmu-modal-product-list">
                    {(stats?.catalog_inventory || []).map((item, idx) => (
                      <div key={item.id || idx} className="itmu-modal-item-row">
                        <img 
                          src={getPlantThumb(item.image, item.name)} 
                          alt={item.name} 
                          className="itmu-modal-thumb" 
                        />
                        <div className="itmu-modal-item-info">
                          <strong>{item.name}</strong>
                          <span>{item.category} • ₹ {item.price}</span>
                        </div>
                        <span className={`itmu-stock-pill itmu-stock-pill--${item.in_stock ? 'in' : 'out'}`}>
                          {item.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'orders' && (
                <div>
                  <div className="itmu-modal-alert">
                    <ShoppingCart size={18} color="#146B3A" />
                    <span>Orders dispatcher & customer fulfillment tracking.</span>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                      <ShoppingCart size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                      <p style={{ margin: 0, fontWeight: 600, color: '#172B24' }}>No Customer Orders in Database</p>
                      <small style={{ color: '#64748B' }}>When customer purchases occur, orders will appear here automatically.</small>
                    </div>
                  ) : (
                    <div className="itmu-table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <table className="itmu-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((ord, idx) => (
                            <tr key={idx}>
                              <td className="itmu-td-order-id">{ord.id}</td>
                              <td>{ord.customer}</td>
                              <td>{ord.date}</td>
                              <td className="itmu-td-amount">{ord.amount}</td>
                              <td>
                                <span className={`itmu-status-pill itmu-status-pill--${ord.status.toLowerCase()}`}>
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'order_detail' && selectedOrder && (
                <div className="itmu-order-detail-view">
                  <div className="itmu-modal-alert">
                    <CheckCircle2 size={18} color="#146B3A" />
                    <span>Order <strong>{selectedOrder.id}</strong> details for <strong>{selectedOrder.customer}</strong>.</span>
                  </div>
                  <div className="itmu-order-spec-grid">
                    <div>
                      <small>Order Date</small>
                      <strong>{selectedOrder.date}</strong>
                    </div>
                    <div>
                      <small>Total Amount</small>
                      <strong className="itmu-text-green">{selectedOrder.amount}</strong>
                    </div>
                    <div>
                      <small>Fulfillment Status</small>
                      <span className={`itmu-status-pill itmu-status-pill--${selectedOrder.status.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <small>Items</small>
                      <strong>{selectedOrder.items || 'Nursery Plant Assortment'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="itmu-modal-footer">
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="itmu-btn-green"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
