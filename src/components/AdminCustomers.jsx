import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Smartphone,
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  MessageCircle,
  Clock,
  IndianRupee,
  Lock,
  ChevronRight,
  MoreVertical,
  Check
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchAdminCustomers,
  fetchAdminCustomerDetail,
  toggleAdminCustomerStatus,
  createAdminCustomer
} from '../services/api';

export default function AdminCustomers({ onLogout, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Customer records & telemetry
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({
    total_customers: 0,
    active_customers: 0,
    verified_phone_customers: 0,
    customers_with_orders: 0
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'inactive' | 'with_orders'
  const [sortBy, setSortBy] = useState('-date_joined');

  // Customer Profile Drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Customer Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Set browser title
  useEffect(() => {
    document.title = 'Customer Management | ITMU E-Haat Admin';
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Load customer records from database
  const loadCustomers = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetchAdminCustomers({
        search: searchQuery,
        status: selectedStatus,
        sort: sortBy
      });

      if (res && res.status === 'success') {
        setCustomers(res.customers || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setError(res?.message || 'Failed to load customer records.');
      }
    } catch (err) {
      setError('Network communication error while fetching customers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedStatus, sortBy]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  // View Customer Profile Drawer
  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setDetailLoading(true);
    try {
      const res = await fetchAdminCustomerDetail(cust.id);
      if (res && res.status === 'success' && res.customer) {
        setSelectedCustomer(res.customer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle Customer Active / Suspended
  const handleToggleStatus = async (cust) => {
    try {
      const res = await toggleAdminCustomerStatus(cust.id);
      if (res && res.status === 'success') {
        showToast(res.message);
        // Update local list
        setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, is_active: res.is_active } : c));
        if (selectedCustomer && selectedCustomer.id === cust.id) {
          setSelectedCustomer(prev => ({ ...prev, is_active: res.is_active }));
        }
      } else {
        showToast(res?.message || 'Failed to update account status.', 'error');
      }
    } catch (err) {
      showToast('Network error modifying account status.', 'error');
    }
  };

  // Create New Customer Account
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.first_name.trim()) {
      showToast('First name is required.', 'error');
      return;
    }

    setAddLoading(true);
    try {
      const res = await createAdminCustomer(newCustomer);
      if (res && res.status === 'success') {
        showToast(`Customer "${res.customer.name}" registered successfully!`);
        setAddModalOpen(false);
        setNewCustomer({ first_name: '', last_name: '', email: '', phone: '' });
        loadCustomers(true);
      } else {
        showToast(res?.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast('Network error registering customer.', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // Generate avatar initials and consistent color
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      { bg: '#E8F5E9', text: '#146B3A' },
      { bg: '#E0F2FE', text: '#0369A1' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#F3E8FF', text: '#7E22CE' },
      { bg: '#FCE7F3', text: '#BE185D' }
    ];
    return colors[(id || 0) % colors.length];
  };

  return (
    <AdminLayout
      activeNav="customers"
      onNavigate={onNavigate}
      onLogout={onLogout}
      searchQuery={searchQuery}
      onSearchChange={(q) => setSearchQuery(q)}
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="itmu-admin-btn-secondary"
            onClick={() => loadCustomers(true)}
            disabled={refreshing}
            title="Refresh customer records"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={15} className={refreshing ? 'itmu-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Members'}</span>
          </button>

          <button
            type="button"
            className="itmu-admin-btn-primary"
            onClick={() => setAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#146B3A',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={`itmu-toast itmu-toast--${toast.type}`}
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 10,
            background: toast.type === 'error' ? '#991B1B' : '#0A4C36',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Customers Container */}
      <div className="itmu-customers-container" style={{ padding: '0 0 40px 0' }}>
        
        {/* Page Header Title */}
        <div className="itmu-page-header-row" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#146B3A'
              }}>
                <Users size={22} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#0D3829',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Customer Management
                </h1>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.88rem', color: '#527867' }}>
                  Registered plant parents, authenticated accounts, and engagement telemetry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            1. TELEMETRY KPI CARDS (Real Database Telemetry)
           ========================================================================= */}
        <div className="itmu-customers-kpi-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {/* Total Customers */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#68897A', fontWeight: 700 }}>
                  Total Customers
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D3829', marginTop: 4 }}>
                  {metrics.total_customers}
                </div>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#146B3A'
              }}>
                <Users size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#68897A', marginTop: 8 }}>
              Registered database accounts
            </div>
          </div>

          {/* Active Members */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803D', fontWeight: 700 }}>
                  Active Accounts
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', marginTop: 4 }}>
                  {metrics.active_customers}
                </div>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A'
              }}>
                <UserCheck size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: 8 }}>
              Enabled for login & checkout
            </div>
          </div>

          {/* Mobile Verified */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369A1', fontWeight: 700 }}>
                  Phone Verified
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
                  {metrics.verified_phone_customers}
                </div>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284C7'
              }}>
                <Smartphone size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0369A1', marginTop: 8 }}>
              OTP & SMS enabled profiles
            </div>
          </div>

          {/* Purchasing Customers */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#B45309', fontWeight: 700 }}>
                  With Placed Orders
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                  {metrics.customers_with_orders}
                </div>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706'
              }}>
                <ShoppingBag size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: 8 }}>
              Storefront order history
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. FILTER TABS & SEARCH BAR
           ========================================================================= */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E3EDE7',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
          boxShadow: '0 2px 10px rgba(10,76,54,0.03)'
        }}>
          {/* Status Tab Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 12,
            borderBottom: '1px solid #EEF4F0'
          }}>
            {[
              { id: 'all', label: 'All Customers', count: metrics.total_customers },
              { id: 'active', label: 'Active Members', count: metrics.active_customers },
              { id: 'inactive', label: 'Suspended Accounts', count: metrics.total_customers - metrics.active_customers },
              { id: 'with_orders', label: 'With Orders', count: metrics.customers_with_orders }
            ].map(tab => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: isActive ? '1.5px solid #146B3A' : '1.5px solid #E2EAE5',
                    background: isActive ? '#0D3829' : '#F7FAF8',
                    color: isActive ? '#FFFFFF' : '#3B5949',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 20,
                    height: 20,
                    padding: '0 6px',
                    borderRadius: 10,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    background: isActive ? 'rgba(255,255,255,0.22)' : '#E7EFEA',
                    color: isActive ? '#FFFFFF' : '#224433'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 14,
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 320px', position: 'relative' }}>
              <Search size={17} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6F9181'
              }} />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: 10,
                  border: '1.5px solid #DCE6E1',
                  background: '#F9FBFA',
                  fontSize: '0.88rem',
                  color: '#133827',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTimeout(() => loadCustomers(), 50);
                  }}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6F9181'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#68897A' }}>
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #DCE6E1',
                  background: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0D3829',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="-date_joined">Joined: Newest First</option>
                <option value="date_joined">Joined: Oldest First</option>
                <option value="name">Name: A to Z</option>
                <option value="-orders_count">Orders: High to Low</option>
                <option value="-total_spent">Total Spent: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. CUSTOMERS DATA TABLE
           ========================================================================= */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E3EDE7',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(10,76,54,0.03)'
        }}>
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="itmu-admin-spinner" style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ margin: 0, color: '#0D3829', fontWeight: 700 }}>Retrieving registered customer profiles...</h4>
              <p style={{ margin: '6px 0 0 0', color: '#68897A', fontSize: '0.85rem' }}>
                Querying database customer table
              </p>
            </div>
          ) : error ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, color: '#991B1B', fontWeight: 700 }}>{error}</h4>
              <button
                type="button"
                className="itmu-admin-btn-secondary"
                onClick={() => loadCustomers()}
                style={{ marginTop: 14 }}
              >
                Try Again
              </button>
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#146B3A'
              }}>
                <Users size={28} />
              </div>
              <h4 style={{ margin: 0, color: '#0D3829', fontWeight: 700, fontSize: '1.1rem' }}>
                No customer records match your filter criteria
              </h4>
              <p style={{ margin: '6px 0 16px 0', color: '#68897A', fontSize: '0.88rem' }}>
                {searchQuery ? `No results found for "${searchQuery}".` : 'No customers found under this segment.'}
              </p>
              {(searchQuery || selectedStatus !== 'all') && (
                <button
                  type="button"
                  className="itmu-admin-btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{
                width: '100%',
                minWidth: '1080px',
                borderCollapse: 'collapse',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{
                    background: '#F6FAF7',
                    borderBottom: '1.5px solid #E1EBE5'
                  }}>
                    <th style={{ padding: '14px 18px', minWidth: 200, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Customer Profile
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 200, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Contact Details
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 120, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Role
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 140, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Joined Date
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 120, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Orders Placed
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 130, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Spent
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 110, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Status
                    </th>
                    <th style={{ padding: '14px 18px', minWidth: 160, whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust, idx) => {
                    const avatarStyle = getAvatarColor(cust.id);
                    return (
                      <tr
                        key={cust.id}
                        style={{
                          borderBottom: idx === customers.length - 1 ? 'none' : '1px solid #EEF4F0',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FDFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Profile Name & Avatar */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: avatarStyle.bg,
                              color: avatarStyle.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}>
                              {getAvatarInitials(cust.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#133827', fontSize: '0.92rem' }}>
                                {cust.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#68897A', marginTop: 1, fontFamily: 'monospace' }}>
                                @{cust.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {cust.phone && cust.phone !== '—' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
                                <Phone size={13} color="#146B3A" />
                                <a
                                  href={`tel:${cust.phone}`}
                                  style={{ color: '#146B3A', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  {cust.phone}
                                </a>
                                <a
                                  href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                                >
                                  <MessageCircle size={14} />
                                </a>
                              </div>
                            ) : null}

                            {cust.email && cust.email !== '—' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#527867' }}>
                                <Mail size={12} />
                                <a
                                  href={`mailto:${cust.email}`}
                                  style={{ color: '#527867', textDecoration: 'none' }}
                                >
                                  {cust.email}
                                </a>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: '#88A798' }}>No email provided</span>
                            )}
                          </div>
                        </td>

                        {/* Account Role */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#F0F6F2',
                            color: '#0A4C36',
                            border: '1px solid #D6E6DC'
                          }}>
                            <ShieldCheck size={12} />
                            <span>{cust.role}</span>
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.84rem', color: '#133827', fontWeight: 600 }}>
                            <Calendar size={13} color="#68897A" />
                            <span>{cust.date_joined_short}</span>
                          </div>
                        </td>

                        {/* Orders Placed */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            background: cust.orders_count > 0 ? '#E8F5E9' : '#F4F5F4',
                            color: cust.orders_count > 0 ? '#146B3A' : '#73837B'
                          }}>
                            {cust.orders_count} {cust.orders_count === 1 ? 'Order' : 'Orders'}
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0A4C36' }}>
                            ₹{Number(cust.total_spent || 0).toLocaleString('en-IN')}
                          </div>
                        </td>

                        {/* Status (Active / Suspended) */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 999,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: cust.is_active ? '#DCFCE7' : '#F3F4F6',
                            color: cust.is_active ? '#15803D' : '#6B7280',
                            border: `1px solid ${cust.is_active ? '#BBF7D0' : '#E5E7EB'}`
                          }}>
                            <span style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: cust.is_active ? '#16A34A' : '#9CA3AF'
                            }} />
                            <span>{cust.is_active ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleViewCustomer(cust)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1.5px solid #146B3A',
                                background: '#E8F5E9',
                                color: '#0A4C36',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0A4C36';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#E8F5E9';
                                e.currentTarget.style.color = '#0A4C36';
                              }}
                            >
                              <Eye size={13} />
                              <span>Profile</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cust)}
                              title={cust.is_active ? 'Suspend account' : 'Reactivate account'}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1.5px solid #DCE6E1',
                                background: '#FFFFFF',
                                color: cust.is_active ? '#B45309' : '#15803D',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {cust.is_active ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          4. CUSTOMER PROFILE DRAWER
         ========================================================================= */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 25, 18, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            onClick={() => setSelectedCustomer(null)}
          />

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 580,
            height: '100%',
            background: '#FFFFFF',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            overflowY: 'auto'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '22px 24px',
              borderBottom: '1.5px solid #E5EFE9',
              background: '#0D3829',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#146B3A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}>
                  {getAvatarInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {selectedCustomer.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#CADFD4', marginTop: 2 }}>
                    Member since {selectedCustomer.date_joined}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: 24, flex: 1 }}>

              {/* Account Overview Card */}
              <div style={{
                background: '#F7FAF8',
                border: '1.5px solid #E1EBE5',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 20
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0D3829',
                  marginBottom: 14
                }}>
                  Account Information
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Username</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#133827', marginTop: 2, fontFamily: 'monospace' }}>
                      @{selectedCustomer.username}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Account Status</div>
                    <div style={{ marginTop: 2 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: selectedCustomer.is_active ? '#DCFCE7' : '#F3F4F6',
                        color: selectedCustomer.is_active ? '#15803D' : '#6B7280'
                      }}>
                        {selectedCustomer.is_active ? 'Active Member' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#146B3A', marginTop: 2 }}>
                      {selectedCustomer.phone !== '—' ? selectedCustomer.phone : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: '0.86rem', color: '#133827', marginTop: 2 }}>
                      {selectedCustomer.email !== '—' ? selectedCustomer.email : 'Not provided'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #E1EBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#68897A' }}>
                    Toggle account accessibility
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedCustomer)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1.5px solid',
                      borderColor: selectedCustomer.is_active ? '#DC2626' : '#146B3A',
                      background: selectedCustomer.is_active ? '#FEF2F2' : '#E8F5E9',
                      color: selectedCustomer.is_active ? '#DC2626' : '#146B3A',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedCustomer.is_active ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                </div>
              </div>

              {/* Purchase History Section */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #E1EBE5',
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #EEF4F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#0D3829'
                  }}>
                    Purchase History ({selectedCustomer.orders?.length || 0})
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A4C36' }}>
                    Spent: ₹{Number(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ padding: '12px 20px' }}>
                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                    <div style={{ padding: '32px 10px', textAlign: 'center', color: '#68897A' }}>
                      <ShoppingBag size={28} color="#88A798" style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0D3829' }}>No orders placed yet</div>
                      <div style={{ fontSize: '0.8rem', marginTop: 3 }}>This customer has not completed any purchases yet.</div>
                    </div>
                  ) : (
                    selectedCustomer.orders.map((ord, oIdx) => (
                      <div
                        key={ord.id || oIdx}
                        style={{
                          padding: '12px 0',
                          borderBottom: oIdx === selectedCustomer.orders.length - 1 ? 'none' : '1px solid #F0F5F2',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0A4C36', fontSize: '0.88rem' }}>
                            {ord.order_id}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#68897A', marginTop: 2 }}>
                            {ord.formatted_date} • {ord.status_display}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#0A4C36', fontSize: '0.92rem' }}>
                            ₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#16A34A', textTransform: 'uppercase', fontWeight: 700 }}>
                            {ord.payment_status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. ADD NEW CUSTOMER MODAL
         ========================================================================= */}
      {addModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 25, 18, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '18px 24px',
              background: '#0D3829',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="#BBE2C6" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Register New Customer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #CADFD4',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #CADFD4',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ramesh.sharma@example.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CADFD4',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9826012345"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CADFD4',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #CADFD4',
                    background: '#FFFFFF',
                    color: '#527867',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#146B3A',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {addLoading ? (
                    <>
                      <RefreshCw size={15} className="itmu-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
