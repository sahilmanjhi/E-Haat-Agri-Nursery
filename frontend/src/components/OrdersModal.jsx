import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  ShoppingBag, 
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { fetchUserOrders } from '../services/api';

export default function OrdersModal({ isOpen, onClose, user, onOpenAuth }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status badge styling helper
  const getStatusStyles = (statusStr = '') => {
    const s = statusStr.toLowerCase();
    if (s.includes('deliver')) {
      return { bg: '#EBF5F0', color: '#00B566', progress: '100%', step: 4 };
    }
    if (s.includes('dispatch') || s.includes('out for delivery') || s.includes('shipping') || s.includes('shipped')) {
      return { bg: '#E0F2FE', color: '#0284C7', progress: '75%', step: 3 };
    }
    if (s.includes('process') || s.includes('pack')) {
      return { bg: '#FEF3C7', color: '#D97706', progress: '50%', step: 2 };
    }
    if (s.includes('cancel')) {
      return { bg: '#FEE2E2', color: '#DC2626', progress: '0%', step: 0 };
    }
    // Default Pending / Confirmed
    return { bg: '#F1F5F9', color: '#475569', progress: '25%', step: 1 };
  };

  const loadOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const userPhone = user?.phone_number || '';
      const userEmail = user?.email || '';
      const liveOrders = await fetchUserOrders({ phone: userPhone, email: userEmail });

      if (liveOrders && liveOrders.length > 0) {
        // Map database orders to display schema
        const mapped = liveOrders.map(ord => {
          const stStyles = getStatusStyles(ord.status_display || ord.status || 'Pending');
          return {
            id: ord.order_number || ord.order_id || ord.id,
            date: ord.formatted_date || ord.created_at || 'Recent Order',
            status: ord.status_display || ord.status || 'Order Placed',
            statusColor: stStyles.color,
            statusBg: stStyles.bg,
            progress: stStyles.progress,
            stepIndex: stStyles.step,
            expectedDelivery: ord.expected_delivery || 'Within 2-3 Business Days',
            total: ord.total_amount || ord.total || 0,
            deliveryAddress: ord.delivery_address || ord.shipping_address || 'Delivery Address on File',
            paymentMethod: ord.payment_method || 'Online Payment',
            items: (ord.items && ord.items.length > 0) ? ord.items.map(it => ({
              id: it.id,
              name: it.product_name || it.name || 'Nursery Plant',
              price: it.price || it.unit_price || 0,
              quantity: it.quantity || 1,
              image: it.image || it.product_image || '/images/plants/monstera.png',
              pot: it.pot || it.pot_option || ''
            })) : []
          };
        });
        setOrders(mapped);
        return;
      }
    } catch (err) {
      console.warn('Failed to load database orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    // Database is single source of truth - zero fake orders
    setOrders([]);
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, user]);

  // Auto-refresh when admin changes order status
  useEffect(() => {
    if (!isOpen) return;
    const handleSync = () => loadOrders(true);
    window.addEventListener('ehaat_data_changed', handleSync);
    return () => window.removeEventListener('ehaat_data_changed', handleSync);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  // If not logged in, enforce authentication barrier
  if (!user) {
    return (
      <div className="ehaat-modal-overlay" onClick={handleClose}>
        <div 
          className="modal-card orders-gate-card" 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button className="ehaat-modal-close" onClick={handleClose} type="button">
            <X size={20} />
          </button>

          <div className="orders-locked-content">
            <div className="orders-locked-icon-wrap">
              <Lock size={32} />
            </div>
            <h3 className="orders-locked-title">Login to View Your Orders</h3>
            <p className="orders-locked-desc">
              Your orders and real-time plant delivery tracking are protected. Please sign in or register with your mobile number to view them.
            </p>
            <button
              className="ehaat-primary-btn"
              onClick={() => {
                handleClose();
                onOpenAuth();
              }}
              style={{ marginTop: '16px' }}
            >
              <span>Login with Mobile Number</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ehaat-modal-overlay" onClick={handleClose}>
      <div 
        className="modal-card orders-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Close */}
        <button 
          className="ehaat-modal-close" 
          onClick={handleClose} 
          type="button"
          aria-label="Close orders"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="orders-modal-header">
          <div className="orders-header-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="orders-header-icon-wrap">
                <Package size={22} />
              </div>
              <div>
                <h2 className="orders-modal-title">My Orders &amp; Plant Tracking</h2>
                <p className="orders-modal-subtitle">
                  Customer: <strong>{user.first_name || user.username || 'Valued Customer'}</strong> • Phone: <strong>+91 {user.phone_number || 'Verified'}</strong>
                </p>
              </div>
            </div>

            {/* Live Refresh Button */}
            <button
              type="button"
              className="btn-outline"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              title="Refresh live order tracking status"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'rotating' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <RefreshCw size={28} className="rotating" style={{ margin: '0 auto 12px auto', color: '#0A4C36' }} />
              <p>Fetching real-time order history from nursery database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <Package size={48} style={{ color: '#CBD5E1', marginBottom: '12px' }} />
              <h4>No orders placed yet</h4>
              <p>Explore our campus nursery plants and place your first order!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, idx) => {
                const stStyles = getStatusStyles(order.status);
                return (
                  <div key={order.id || idx} className="order-card">
                    {/* Order Card Top Bar */}
                    <div className="order-card-header">
                      <div>
                        <div className="order-id-badge">
                          <span>Order #{order.id}</span>
                        </div>
                        <span className="order-date-text">Placed: {order.date}</span>
                      </div>

                      <div 
                        className="order-status-badge"
                        style={{
                          backgroundColor: stStyles.bg,
                          color: stStyles.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontWeight: '700',
                          fontSize: '0.82rem'
                        }}
                      >
                        <Truck size={14} />
                        <span>{order.status}</span>
                      </div>
                    </div>

                    {/* Delivery Timeline / Tracking status */}
                    <div className="order-tracker-box">
                      <div className="tracker-header">
                        <div className="tracker-eta">
                          <Clock size={14} style={{ color: '#0A4C36' }} />
                          <span>Status: <strong>{order.status}</strong> • Expected: <strong>{order.expectedDelivery}</strong></span>
                        </div>
                        <span className="tracker-live-tag">● Live Admin Tracking</span>
                      </div>

                      <div className="tracker-progress-track">
                        <div 
                          className="tracker-progress-fill" 
                          style={{ 
                            width: stStyles.progress,
                            backgroundColor: stStyles.color 
                          }} 
                        />
                      </div>

                      <div className="tracker-steps">
                        <span className={`step-point ${stStyles.step >= 1 ? 'completed' : ''}`}>Ordered</span>
                        <span className={`step-point ${stStyles.step >= 2 ? 'completed' : ''}`}>Packed</span>
                        <span className={`step-point ${stStyles.step >= 3 ? 'completed' : ''}`}>Dispatched</span>
                        <span className={`step-point ${stStyles.step >= 4 ? 'completed' : ''}`}>Delivered</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items-list">
                      {order.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="order-item-row">
                          <img 
                            src={item.image || '/images/plants/monstera.png'} 
                            alt={item.name}
                            className="order-item-thumb"
                            onError={(e) => {
                              e.currentTarget.src = '/images/plants/monstera.png';
                            }}
                          />
                          <div className="order-item-details">
                            <div className="order-item-name">{item.name}</div>
                            {item.pot && (
                              <div className="order-item-spec">Planter: {item.pot}</div>
                            )}
                            <div className="order-item-qty">Qty: {item.quantity || 1}</div>
                          </div>
                          <div className="order-item-price">
                            ₹{(item.price || 499) * (item.quantity || 1)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="order-card-footer">
                      <div className="order-address-snippet">
                        <MapPin size={14} style={{ color: '#64748B', flexShrink: 0 }} />
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="order-total-snippet">
                        <span>Total Paid:</span>
                        <strong>₹{order.total}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
