import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Printer,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Check,
  X,
  ExternalLink,
  Copy,
  IndianRupee,
  ShieldCheck,
  Send
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  updateAdminOrderStatus
} from '../services/api';

export default function AdminOrders({ onLogout, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Orders and telemetry
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending_count: 0,
    processing_count: 0,
    dispatched_count: 0,
    out_for_delivery_count: 0,
    delivered_count: 0,
    cancelled_count: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('-created_at');

  // Detail Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [orderNotesInput, setOrderNotesInput] = useState('');

  // Invoice Print View
  const [printOrder, setPrintOrder] = useState(null);

  // Set browser title
  useEffect(() => {
    document.title = 'Order Management | ITMU E-Haat Admin';
  }, []);

  // Show auto-dismissing toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Load orders
  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetchAdminOrders({
        status: selectedStatus,
        search: searchQuery,
        sort: sortBy
      });

      if (res && res.status === 'success') {
        setOrders(res.orders || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setError(res?.message || 'Failed to load order records.');
      }
    } catch (err) {
      setError('Network communication error while fetching orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, sortBy]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  // View order detail
  const handleViewOrder = async (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumberInput(ord.tracking_number || '');
    setOrderNotesInput(ord.notes || '');

    // Fetch full order data if items missing
    setDetailLoading(true);
    try {
      const res = await fetchAdminOrderDetail(ord.order_id || ord.id);
      if (res && res.status === 'success' && res.order) {
        setSelectedOrder(res.order);
        setNewStatus(res.order.status);
        setTrackingNumberInput(res.order.tracking_number || '');
        setOrderNotesInput(res.order.notes || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder) return;

    setStatusUpdating(true);
    try {
      const payload = {
        status: newStatus,
        tracking_number: trackingNumberInput,
        notes: orderNotesInput
      };
      const res = await updateAdminOrderStatus(selectedOrder.id, payload);
      if (res && res.status === 'success' && res.order) {
        setSelectedOrder(res.order);
        showToast(`Order ${res.order.order_id} status updated to ${res.order.status_display}!`);
        // Refresh list in background
        loadOrders(true);
      } else {
        showToast(res?.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      showToast('Network error updating status.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Quick inline status change from table
  const handleInlineStatusChange = async (ord, newStat) => {
    try {
      const res = await updateAdminOrderStatus(ord.id, { status: newStat });
      if (res && res.status === 'success') {
        showToast(`Order ${ord.order_id} marked as ${res.order.status_display}.`);
        loadOrders(true);
      } else {
        showToast(res?.message || 'Status update failed.', 'error');
      }
    } catch (err) {
      showToast('Network error updating status.', 'error');
    }
  };

  // Copy tracking number / order ID to clipboard
  const handleCopy = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Trigger print invoice
  const handlePrintInvoice = (ord) => {
    setPrintOrder(ord);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          border: '#FDE68A',
          label: 'Pending',
          icon: Clock
        };
      case 'processing':
        return {
          bg: '#E0E7FF',
          color: '#3730A3',
          border: '#C7D2FE',
          label: 'Processing',
          icon: Package
        };
      case 'dispatched':
        return {
          bg: '#E0F2FE',
          color: '#075985',
          border: '#BAE6FD',
          label: 'Dispatched',
          icon: Truck
        };
      case 'out_for_delivery':
        return {
          bg: '#F3E8FF',
          color: '#6B21A8',
          border: '#E9D5FF',
          label: 'Out for Delivery',
          icon: Send
        };
      case 'delivered':
        return {
          bg: '#DCFCE7',
          color: '#166534',
          border: '#BBF7D0',
          label: 'Delivered',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          bg: '#FFE4E6',
          color: '#9F1239',
          border: '#FECDD3',
          label: 'Cancelled',
          icon: XCircle
        };
      default:
        return {
          bg: '#F3F4F6',
          color: '#374151',
          border: '#E5E7EB',
          label: status,
          icon: Clock
        };
    }
  };

  // Stepper delivery progress helper
  const getDeliverySteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'processing', label: 'Processing & Packed' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' }
    ];

    if (currentStatus === 'cancelled') {
      return [{ key: 'cancelled', label: 'Order Cancelled', isError: true }];
    }

    const orderIndex = {
      'pending': 0,
      'processing': 1,
      'dispatched': 2,
      'out_for_delivery': 3,
      'delivered': 4
    };

    const activeIdx = orderIndex[currentStatus] ?? 0;

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= activeIdx,
      current: idx === activeIdx
    }));
  };

  // Image fallback helper
  const resolvePlantThumb = (img, name) => {
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

  return (
    <AdminLayout
      activeNav="orders"
      onNavigate={onNavigate}
      onLogout={onLogout}
      searchQuery={searchQuery}
      onSearchChange={(q) => setSearchQuery(q)}
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="itmu-admin-btn-secondary"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            title="Refresh order records"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={15} className={refreshing ? 'itmu-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Orders'}</span>
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

      {/* Main Order Management Body */}
      <div className="itmu-orders-container" style={{ padding: '0 0 40px 0' }}>

        {/* Page Header */}
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
                <ShoppingCart size={22} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#0D3829',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Order Management
                </h1>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.88rem', color: '#527867' }}>
                  Live customer order fulfillment, tracking updates, and delivery dispatch telemetry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            1. TELEMETRY KPI CARDS
           ========================================================================= */}
        <div className="itmu-orders-kpi-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {/* Total Orders */}
          <div className="itmu-orders-kpi-card" style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#68897A', fontWeight: 700 }}>
                  Total Orders
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D3829', marginTop: 4 }}>
                  {metrics.total_orders}
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
                <ShoppingBag size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#68897A', marginTop: 8 }}>
              Cumulative orders placed
            </div>
          </div>

          {/* Total Revenue */}
          <div className="itmu-orders-kpi-card" style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#68897A', fontWeight: 700 }}>
                  Total Revenue
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D3829', marginTop: 4 }}>
                  ₹{Number(metrics.total_revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B45309'
              }}>
                <IndianRupee size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#68897A', marginTop: 8 }}>
              Excludes cancelled orders
            </div>
          </div>

          {/* Pending & Processing */}
          <div className="itmu-orders-kpi-card" style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#B45309', fontWeight: 700 }}>
                  Fulfillment Queue
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                  {metrics.pending_count + metrics.processing_count}
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
                <Clock size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: 8 }}>
              {metrics.pending_count} Pending • {metrics.processing_count} In Packing
            </div>
          </div>

          {/* Dispatched & In Transit */}
          <div className="itmu-orders-kpi-card" style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369A1', fontWeight: 700 }}>
                  In Transit
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
                  {metrics.dispatched_count + metrics.out_for_delivery_count}
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
                <Truck size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0369A1', marginTop: 8 }}>
              {metrics.dispatched_count} Dispatched • {metrics.out_for_delivery_count} Out for delivery
            </div>
          </div>

          {/* Delivered */}
          <div className="itmu-orders-kpi-card" style={{
            background: '#FFFFFF',
            border: '1.5px solid #E3EDE7',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(10,76,54,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803D', fontWeight: 700 }}>
                  Delivered
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', marginTop: 4 }}>
                  {metrics.delivered_count}
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
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: 8 }}>
              Successful deliveries
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
              { id: 'all', label: 'All Orders', count: metrics.total_orders },
              { id: 'pending', label: 'Pending', count: metrics.pending_count, color: '#B45309' },
              { id: 'processing', label: 'Processing', count: metrics.processing_count, color: '#4338CA' },
              { id: 'dispatched', label: 'Dispatched', count: metrics.dispatched_count, color: '#0369A1' },
              { id: 'out_for_delivery', label: 'Out for Delivery', count: metrics.out_for_delivery_count, color: '#7E22CE' },
              { id: 'delivered', label: 'Delivered', count: metrics.delivered_count, color: '#15803D' },
              { id: 'cancelled', label: 'Cancelled', count: metrics.cancelled_count, color: '#BE123C' }
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
                placeholder="Search by Order ID (EHAAT-...), customer name, phone, city..."
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
                    setTimeout(() => loadOrders(), 50);
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
                <option value="-created_at">Date: Newest First</option>
                <option value="created_at">Date: Oldest First</option>
                <option value="-total_amount">Amount: High to Low</option>
                <option value="total_amount">Amount: Low to High</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. ORDERS DATA TABLE
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
              <h4 style={{ margin: 0, color: '#0D3829', fontWeight: 700 }}>Retrieving live orders...</h4>
              <p style={{ margin: '6px 0 0 0', color: '#68897A', fontSize: '0.85rem' }}>
                Connecting to ITMU E-Haat order fulfillment registry
              </p>
            </div>
          ) : error ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, color: '#991B1B', fontWeight: 700 }}>{error}</h4>
              <button
                type="button"
                className="itmu-admin-btn-secondary"
                onClick={() => loadOrders()}
                style={{ marginTop: 14 }}
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
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
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ margin: 0, color: '#0D3829', fontWeight: 700, fontSize: '1.1rem' }}>
                No orders match your filter criteria
              </h4>
              <p style={{ margin: '6px 0 16px 0', color: '#68897A', fontSize: '0.88rem' }}>
                {searchQuery ? `No results found for "${searchQuery}".` : 'No orders found in this status category.'}
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{
                    background: '#F6FAF7',
                    borderBottom: '1.5px solid #E1EBE5'
                  }}>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Order ID & Date
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Customer Details
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Items
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Payment
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Amount
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Delivery Status
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#527867', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord, idx) => {
                    const statusInfo = getStatusBadge(ord.status);
                    const StatusIcon = statusInfo.icon;
                    const items = ord.items || [];
                    const itemCount = items.reduce((acc, itm) => acc + (itm.quantity || 1), 0);

                    return (
                      <tr
                        key={ord.id}
                        style={{
                          borderBottom: idx === orders.length - 1 ? 'none' : '1px solid #EEF4F0',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FDFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Order ID & Date */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              color: '#0A4C36'
                            }}>
                              {ord.order_id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(ord.order_id, 'Order ID')}
                              title="Copy Order ID"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#88A798',
                                padding: 2
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            marginTop: 4,
                            fontSize: '0.76rem',
                            color: '#6C8C7E'
                          }}>
                            <Calendar size={12} />
                            <span>{ord.formatted_date}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, color: '#133827', fontSize: '0.9rem' }}>
                            {ord.customer_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#68897A', marginTop: 2 }}>
                            {ord.customer_phone ? (
                              <a
                                href={`tel:${ord.customer_phone}`}
                                style={{ color: '#146B3A', textDecoration: 'none', fontWeight: 600 }}
                              >
                                {ord.customer_phone}
                              </a>
                            ) : ord.customer_email || 'No phone'}
                          </div>
                          {ord.city && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              marginTop: 4,
                              fontSize: '0.74rem',
                              color: '#436B57',
                              background: '#F0F6F2',
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              <MapPin size={11} />
                              <span>{ord.city}{ord.state ? `, ${ord.state}` : ''}</span>
                            </div>
                          )}
                        </td>

                        {/* Items Stack */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Thumbnails stack */}
                            <div style={{ display: 'flex', marginLeft: 4 }}>
                              {items.slice(0, 3).map((itm, iIdx) => (
                                <img
                                  key={iIdx}
                                  src={resolvePlantThumb(itm.product_image, itm.product_name)}
                                  alt={itm.product_name}
                                  title={`${itm.product_name} (${itm.quantity}x)`}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                    border: '2px solid #FFFFFF',
                                    marginLeft: iIdx > 0 ? -10 : 0,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/plants/snake_plant.png';
                                  }}
                                />
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#133827' }}>
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </div>
                              <div style={{
                                fontSize: '0.74rem',
                                color: '#68897A',
                                maxWidth: 160,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {items.map(i => i.product_name).join(', ') || 'Nursery catalog items'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Payment */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: ord.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                            color: ord.payment_status === 'paid' ? '#166534' : '#92400E',
                            border: `1px solid ${ord.payment_status === 'paid' ? '#BBF7D0' : '#FDE68A'}`
                          }}>
                            {ord.payment_status === 'paid' ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            <span style={{ textTransform: 'uppercase' }}>{ord.payment_status}</span>
                          </div>
                          <div style={{
                            fontSize: '0.74rem',
                            color: '#68897A',
                            marginTop: 4,
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            {ord.payment_method_display || ord.payment_method}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{
                            fontSize: '0.98rem',
                            fontWeight: 800,
                            color: '#0A4C36'
                          }}>
                            ₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}
                          </div>
                          {Number(ord.shipping_fee || 0) > 0 ? (
                            <div style={{ fontSize: '0.72rem', color: '#68897A', marginTop: 2 }}>
                              Incl. ₹{ord.shipping_fee} delivery
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600, marginTop: 2 }}>
                              Free Delivery
                            </div>
                          )}
                        </td>

                        {/* Delivery Status */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 999,
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              border: `1px solid ${statusInfo.border}`,
                              fontSize: '0.8rem',
                              fontWeight: 700
                            }}>
                              <StatusIcon size={13} />
                              <span>{statusInfo.label}</span>
                            </div>

                            {/* Tracking snippet if available */}
                            {ord.tracking_number && (
                              <div style={{
                                fontSize: '0.72rem',
                                color: '#68897A',
                                marginTop: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                              }}>
                                <span style={{ fontFamily: 'monospace' }}>{ord.tracking_number}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleViewOrder(ord)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '7px 12px',
                                borderRadius: 8,
                                border: '1.5px solid #146B3A',
                                background: '#E8F5E9',
                                color: '#0A4C36',
                                fontSize: '0.82rem',
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
                              <Eye size={14} />
                              <span>Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePrintInvoice(ord)}
                              title="Print Invoice / Delivery Slip"
                              style={{
                                padding: '7px 10px',
                                borderRadius: 8,
                                border: '1.5px solid #DCE6E1',
                                background: '#FFFFFF',
                                color: '#527867',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#146B3A';
                                e.currentTarget.style.color = '#146B3A';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#DCE6E1';
                                e.currentTarget.style.color = '#527867';
                              }}
                            >
                              <Printer size={15} />
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
          4. ORDER DETAILS DRAWER / MODAL
         ========================================================================= */}
      {selectedOrder && (
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
          {/* Backdrop click to close */}
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            onClick={() => setSelectedOrder(null)}
          />

          {/* Drawer Body */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 640,
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
              padding: '20px 24px',
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#BBE2C6'
                  }}>
                    {selectedOrder.order_id}
                  </span>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: 'rgba(255,255,255,0.18)',
                    color: '#FFFFFF'
                  }}>
                    {selectedOrder.status_display}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#CADFD4', marginTop: 3 }}>
                  Placed on {selectedOrder.formatted_date}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} />
                  <span>Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
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
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', flex: 1 }}>

              {/* Delivery Stepper Tracker */}
              <div style={{
                background: '#F7FAF8',
                border: '1.5px solid #E1EBE5',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0D3829',
                  marginBottom: 16
                }}>
                  Fulfillment & Delivery Progress
                </div>

                <div style={{ position: 'relative' }}>
                  {getDeliverySteps(selectedOrder.status).map((step, sIdx, arr) => (
                    <div
                      key={step.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        marginBottom: sIdx === arr.length - 1 ? 0 : 20,
                        position: 'relative'
                      }}
                    >
                      {/* Connecting vertical line */}
                      {sIdx < arr.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: 13,
                          top: 26,
                          bottom: -18,
                          width: 2,
                          background: step.completed ? '#146B3A' : '#D1DFD7'
                        }} />
                      )}

                      {/* Step Circle */}
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: step.completed ? '#146B3A' : '#FFFFFF',
                        border: `2px solid ${step.completed ? '#146B3A' : '#C4D5CC'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.completed ? '#FFFFFF' : '#88A798',
                        zIndex: 2,
                        flexShrink: 0
                      }}>
                        {step.completed ? <Check size={14} strokeWidth={3} /> : <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{sIdx + 1}</span>}
                      </div>

                      <div style={{ paddingTop: 3 }}>
                        <div style={{
                          fontWeight: step.current ? 800 : step.completed ? 700 : 500,
                          fontSize: '0.88rem',
                          color: step.current ? '#0D3829' : step.completed ? '#1A4333' : '#739485'
                        }}>
                          {step.label}
                        </div>
                        {step.current && (
                          <div style={{ fontSize: '0.76rem', color: '#146B3A', fontWeight: 600, marginTop: 2 }}>
                            Current active state
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Updater Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #146B3A',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24,
                boxShadow: '0 4px 16px rgba(20,107,58,0.06)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14
                }}>
                  <div style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#0A4C36'
                  }}>
                    Update Order Fulfillment
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#5C8271' }}>
                    Instant live sync
                  </div>
                </div>

                <form onSubmit={handleUpdateStatus}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                      Change Order Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid #CADFD4',
                        background: '#F9FBF9',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#0D3829',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending (Order Placed)</option>
                      <option value="processing">Processing (Packing & Quality Inspection)</option>
                      <option value="dispatched">Dispatched (Handed to Nursery Courier)</option>
                      <option value="out_for_delivery">Out for Delivery (With Delivery Agent)</option>
                      <option value="delivered">Delivered (Successfully Handed to Customer)</option>
                      <option value="cancelled">Cancelled (Order Voided)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                      Tracking Number / Courier AWB
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DEL-EHAAT-892147"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CADFD4',
                        background: '#FFFFFF',
                        fontSize: '0.88rem',
                        color: '#0D3829',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#3A5B4C', marginBottom: 6 }}>
                      Fulfillment Notes / Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add nursery dispatch notes or customer special requests..."
                      value={orderNotesInput}
                      onChange={(e) => setOrderNotesInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CADFD4',
                        background: '#FFFFFF',
                        fontSize: '0.86rem',
                        color: '#0D3829',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={statusUpdating}
                    style={{
                      width: '100%',
                      padding: '11px 18px',
                      borderRadius: 8,
                      background: '#146B3A',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0D4E29'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#146B3A'}
                  >
                    {statusUpdating ? (
                      <>
                        <RefreshCw size={16} className="itmu-spin" />
                        <span>Updating Record...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>Save Status & Tracking</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Customer & Delivery Address Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #E1EBE5',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0D3829',
                  marginBottom: 14
                }}>
                  Customer & Shipping Address
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#133827', marginTop: 2 }}>{selectedOrder.customer_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#146B3A', marginTop: 2 }}>
                      <a href={`tel:${selectedOrder.customer_phone}`} style={{ color: '#146B3A', textDecoration: 'none' }}>
                        {selectedOrder.customer_phone || 'N/A'}
                      </a>
                    </div>
                  </div>
                </div>

                {selectedOrder.customer_email && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.74rem', color: '#68897A', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: '0.88rem', color: '#133827', marginTop: 2 }}>{selectedOrder.customer_email}</div>
                  </div>
                )}

                <div style={{
                  background: '#F7FAF8',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E3EDE7'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#527867', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} />
                    <span>Delivery Address</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#133827', marginTop: 4, lineHeight: 1.45 }}>
                    {selectedOrder.delivery_address || 'No street address specified'}<br />
                    {selectedOrder.city}{selectedOrder.state ? `, ${selectedOrder.state}` : ''} {selectedOrder.pincode ? `- ${selectedOrder.pincode}` : ''}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #E1EBE5',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 24
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #EEF4F0',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0D3829'
                }}>
                  Ordered Plants & Supplies ({selectedOrder.items?.length || 0})
                </div>

                <div style={{ padding: '8px 20px' }}>
                  {(selectedOrder.items || []).map((itm, iIdx) => (
                    <div
                      key={itm.id || iIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: iIdx === (selectedOrder.items.length - 1) ? 'none' : '1px solid #F0F5F2'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={resolvePlantThumb(itm.product_image, itm.product_name)}
                          alt={itm.product_name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid #E2EAE5'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/plants/snake_plant.png';
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#133827' }}>
                            {itm.product_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#68897A', marginTop: 2 }}>
                            {itm.pot_option && <span>Pot: {itm.pot_option} • </span>}
                            {itm.size_option && <span>Size: {itm.size_option} • </span>}
                            Qty: {itm.quantity}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0A4C36' }}>
                          ₹{Number(itm.total_price || (itm.unit_price * itm.quantity) || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#68897A' }}>
                          ₹{itm.unit_price} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal, Shipping, Total Breakdown */}
                <div style={{
                  padding: '14px 20px',
                  background: '#F9FBF9',
                  borderTop: '1.5px solid #EEF4F0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#527867', marginBottom: 6 }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#527867', marginBottom: 8 }}>
                    <span>Shipping Fee:</span>
                    <span style={{ fontWeight: 600, color: Number(selectedOrder.shipping_fee) === 0 ? '#15803D' : '#527867' }}>
                      {Number(selectedOrder.shipping_fee) === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0A4C36',
                    paddingTop: 8,
                    borderTop: '1px solid #E1EBE5'
                  }}>
                    <span>Grand Total:</span>
                    <span>₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. PRINTABLE INVOICE / RECEIPT MODAL
         ========================================================================= */}
      {printOrder && (
        <div className="itmu-invoice-print-container" style={{ display: 'none' }}>
          <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0A4C36', paddingBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#0A4C36' }}>ITMU E-Haat Agri Nursery</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#555' }}>
                  ITM University Gwalior Campus, NH-44, Turari, Gwalior (M.P.) 474001
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
                  GSTIN: 23AABCI1234F1Z8 | Contact: +91 751 244 0000 | support@itmu-ehaat.in
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: '#333' }}>TAX INVOICE</h3>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>{printOrder.order_id}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>Date: {printOrder.formatted_date}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', textTransform: 'uppercase', color: '#666' }}>Billed / Shipped To:</h4>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{printOrder.customer_name}</div>
                <div style={{ fontSize: '0.9rem', marginTop: 4 }}>
                  {printOrder.delivery_address}<br />
                  {printOrder.city}, {printOrder.state} - {printOrder.pincode}<br />
                  Phone: {printOrder.customer_phone}<br />
                  {printOrder.customer_email && `Email: ${printOrder.customer_email}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: '0 0 6px 0', textTransform: 'uppercase', color: '#666' }}>Payment Details:</h4>
                <div style={{ fontSize: '0.9rem' }}>
                  Method: <strong>{printOrder.payment_method_display || printOrder.payment_method}</strong><br />
                  Status: <strong>{printOrder.payment_status?.toUpperCase()}</strong><br />
                  Delivery Tracking: <strong>{printOrder.tracking_number || 'Standard Dispatch'}</strong>
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
              <thead>
                <tr style={{ background: '#F2F6F4', borderBottom: '1px solid #CCC' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Pot / Size</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(printOrder.items || []).map((itm, iIdx) => (
                  <tr key={iIdx} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '10px' }}><strong>{itm.product_name}</strong></td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem' }}>{itm.pot_option || 'Standard'} / {itm.size_option || 'Regular'}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{itm.unit_price}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{itm.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{itm.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <div style={{ width: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <span>₹{printOrder.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Shipping Fee:</span>
                  <span>₹{printOrder.shipping_fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #0A4C36', fontWeight: 'bold', fontSize: '1.1rem', color: '#0A4C36' }}>
                  <span>Total Amount:</span>
                  <span>₹{printOrder.total_amount}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 60, borderTop: '1px solid #EEE', paddingTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
              Thank you for supporting sustainable greenery with ITMU E-Haat! Fresh plants guaranteed.
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
