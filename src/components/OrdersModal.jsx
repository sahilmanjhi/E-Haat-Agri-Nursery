import React from 'react';
import { X, Package, Truck, Clock, CheckCircle2, ChevronRight, Lock, ShoppingBag, MapPin } from 'lucide-react';

export default function OrdersModal({ isOpen, onClose, user, onOpenAuth }) {
  if (!isOpen) return null;

  // Retrieve user orders from localStorage or default seed for realistic demo
  const userKey = user?.phone_number || user?.username || 'guest';
  const storedOrders = (() => {
    try {
      const raw = localStorage.getItem(`ehaat_orders_${userKey}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Default demo order for logged in user so they have a realistic order to inspect
    return [
      {
        id: 'EHAAT-849201',
        date: 'Today, 28 Oct 2026',
        status: 'Out for Delivery',
        statusColor: '#00B566',
        statusBg: '#EBF5F0',
        expectedDelivery: 'Tomorrow by 4:00 PM',
        trackingPill: 'Live Express Delivery',
        total: 1298,
        items: [
          {
            id: 1,
            name: 'Monstera Deliciosa (Swiss Cheese Plant)',
            price: 699,
            quantity: 1,
            image: '/images/plants/monstera.png',
            pot: 'Matte White Ceramic Planter'
          },
          {
            id: 2,
            name: 'ZZ Plant (Zamioculcas Zamiifolia)',
            price: 599,
            quantity: 1,
            image: '/images/plants/zz_plant.png',
            pot: 'Self-Watering Emerald Pot'
          }
        ],
        deliveryAddress: 'Campus Agri-Hub, ITM University Gwalior, MP - 474001',
        paymentMethod: 'UPI Verified'
      }
    ];
  })();

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
          <div className="orders-header-title-row">
            <div className="orders-header-icon-wrap">
              <Package size={22} />
            </div>
            <div>
              <h2 className="orders-modal-title">My Orders &amp; Plant Tracking</h2>
              <p className="orders-modal-subtitle">
                Registered Phone: <strong>+91 {user.phone_number || 'Verified Mobile'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-modal-body">
          {storedOrders.length === 0 ? (
            <div className="orders-empty-state">
              <Package size={48} style={{ color: '#CBD5E1', marginBottom: '12px' }} />
              <h4>No orders placed yet</h4>
              <p>Explore our campus nursery plants and place your first order!</p>
            </div>
          ) : (
            <div className="orders-list">
              {storedOrders.map((order, idx) => (
                <div key={order.id || idx} className="order-card">
                  {/* Order Card Top Bar */}
                  <div className="order-card-header">
                    <div>
                      <div className="order-id-badge">
                        <span>Order #{order.id}</span>
                      </div>
                      <span className="order-date-text">Placed on {order.date}</span>
                    </div>

                    <div 
                      className="order-status-badge"
                      style={{
                        backgroundColor: order.statusBg || '#EBF5F0',
                        color: order.statusColor || '#00B566'
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
                        <span>Estimated Delivery: <strong>{order.expectedDelivery || 'Within 2-3 Days'}</strong></span>
                      </div>
                      <span className="tracker-live-tag">● Live GPS Tracking</span>
                    </div>

                    <div className="tracker-progress-track">
                      <div className="tracker-progress-fill" style={{ width: '75%' }} />
                    </div>

                    <div className="tracker-steps">
                      <span className="step-point completed">Ordered</span>
                      <span className="step-point completed">Packed in 5-Layer Box</span>
                      <span className="step-point completed current">Dispatched</span>
                      <span className="step-point">Delivered</span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
