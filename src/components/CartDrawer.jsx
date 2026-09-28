import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onProceedToCheckout 
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => {
    const potExtra = item.selectedPot ? item.selectedPot.extraPrice : 0;
    return acc + (item.price + potExtra) * item.quantity;
  }, 0);

  const freeShippingThreshold = 499;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  let discountAmount = 0;
  if (appliedCoupon === 'AGRI10') {
    discountAmount = Math.round(subtotal * 0.10);
  }

  const shippingCost = (subtotal >= freeShippingThreshold || appliedCoupon === 'GREENFREE') ? 0 : 79;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'AGRI10') {
      setAppliedCoupon('AGRI10');
      setCouponError('');
    } else if (code === 'GREENFREE') {
      setAppliedCoupon('GREENFREE');
      setCouponError('');
    } else {
      setCouponError('Invalid Coupon! Try "AGRI10" for 10% OFF');
    }
  };

  return (
    <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        
        {/* Cart Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} />
            <h3>Your Shopping Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)})</h3>
          </div>
          <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="free-ship-bar">
          <div className="free-ship-text">
            <span>
              {amountForFreeShipping === 0 
                ? "🎉 Congratulations! You unlocked FREE Delivery!" 
                : `Add ₹${amountForFreeShipping} more for FREE Delivery`}
            </span>
            <span>{Math.round(freeShipPercent)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${freeShipPercent}%` }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-body">
          {cartItems.length > 0 ? (
            cartItems.map((item, idx) => {
              const potExtra = item.selectedPot ? item.selectedPot.extraPrice : 0;
              const itemPrice = item.price + potExtra;
              return (
                <div key={`${item.id}-${idx}`} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.name}</div>
                    {item.selectedPot && (
                      <div className="cart-item-pot">
                        Planter: {item.selectedPot.name}
                      </div>
                    )}
                    {item.selectedSize && (
                      <div className="cart-item-pot">Size: {item.selectedSize}</div>
                    )}
                    <div style={{ fontWeight: '800', color: '#0A4C36', marginTop: '4px' }}>
                      ₹{itemPrice * item.quantity}
                    </div>

                    <div className="cart-qty-ctrl">
                      <button className="qty-btn" onClick={() => onUpdateQty(item, item.quantity - 1)}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => onUpdateQty(item, item.quantity + 1)}>+</button>
                      
                      <button 
                        onClick={() => onRemoveItem(item)}
                        style={{ marginLeft: 'auto', color: '#E11D48', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <ShoppingBag size={48} style={{ color: '#CADFD4', marginBottom: '16px' }} />
              <h4>Your Cart is Empty</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Explore our lush indoor plants and organic seeds!
              </p>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Coupon Code Engine */}
            <form onSubmit={handleApplyCoupon} className="coupon-box">
              <input 
                type="text" 
                placeholder="Promo code (e.g. AGRI10)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button type="submit">Apply</button>
            </form>

            {appliedCoupon && (
              <div style={{ fontSize: '0.8rem', color: '#00B566', fontWeight: '700', marginBottom: '8px' }}>
                ✓ Coupon '{appliedCoupon}' Applied Successfully!
              </div>
            )}
            {couponError && (
              <div style={{ fontSize: '0.8rem', color: '#E11D48', fontWeight: '600', marginBottom: '8px' }}>
                {couponError}
              </div>
            )}

            {/* Price Calculations */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: '#00B566', fontWeight: '700' }}>
                <span>Discount (AGRI10)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{shippingCost === 0 ? <strong style={{ color: '#00B566' }}>FREE</strong> : `₹${shippingCost}`}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={() => {
                onProceedToCheckout({ subtotal, discountAmount, shippingCost, grandTotal, appliedCoupon });
                onClose();
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#64748B',
              marginTop: '12px'
            }}>
              <ShieldCheck size={14} style={{ color: '#0A4C36' }} />
              <span>100% Secure Checkout • Ugaoo Quality Guarantee</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
