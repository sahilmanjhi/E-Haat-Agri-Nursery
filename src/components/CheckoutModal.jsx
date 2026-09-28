import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, CreditCard, Smartphone, Banknote, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  summary, 
  onOrderSuccess 
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success Confirmation
  const [formData, setFormData] = useState({
    name: 'Sahil Sharma',
    phone: '9876543210',
    email: 'sahil@example.com',
    pincode: '400001',
    address: 'Flat 402, Green Meadows, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    paymentMethod: 'upi'
  });

  const [orderId, setOrderId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const generatedId = 'AGRI-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);
    setStep(3);

    // Trigger confetti celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onOrderSuccess();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '680px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0A4C36',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>1</div>
              <h3 style={{ fontSize: '1.3rem' }}>Shipping Address & Contact</h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required
                    value={formData.name} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    required
                    value={formData.phone} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  value={formData.email} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Delivery Address</label>
                <input 
                  type="text" 
                  name="address" 
                  required
                  value={formData.address} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    required
                    value={formData.city} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    required
                    value={formData.state} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    required
                    value={formData.pincode} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Continue to Payment • ₹{summary?.grandTotal}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0A4C36',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>2</div>
              <h3 style={{ fontSize: '1.3rem' }}>Select Payment Method</h3>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: formData.paymentMethod === 'upi' ? '2px solid #0A4C36' : '1px solid #CBD5E1',
                  background: formData.paymentMethod === 'upi' ? '#EBF5F0' : '#FFF',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                  />
                  <Smartphone size={20} style={{ color: '#0A4C36' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>UPI (Google Pay, PhonePe, Paytm, BHIM)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Instant zero-fee payment</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: formData.paymentMethod === 'card' ? '2px solid #0A4C36' : '1px solid #CBD5E1',
                  background: formData.paymentMethod === 'card' ? '#EBF5F0' : '#FFF',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <CreditCard size={20} style={{ color: '#0A4C36' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Visa, Mastercard, RuPay, Amex</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: formData.paymentMethod === 'cod' ? '2px solid #0A4C36' : '1px solid #CBD5E1',
                  background: formData.paymentMethod === 'cod' ? '#EBF5F0' : '#FFF',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <Banknote size={20} style={{ color: '#0A4C36' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Cash On Delivery (COD)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Pay cash upon plant delivery</div>
                  </div>
                </label>
              </div>

              {/* Order Summary Recap */}
              <div style={{ background: '#F8FAF8', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Total Items:</span>
                  <span>{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0A4C36', fontSize: '1.05rem', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                  <span>Amount Payable:</span>
                  <span>₹{summary?.grandTotal}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Place Order Now
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#EBF5F0',
              color: '#00B566',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={40} />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#0A4C36', marginBottom: '8px' }}>
              Order Placed Successfully! 🎉
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
              Thank you for shopping with <strong>ITMUE-HAAT Agri Nursery</strong>. Your live plants are being carefully packed in our 5-layer eco box.
            </p>

            <div style={{
              background: '#F8FAF8',
              border: '1.5px dashed #00B566',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '440px',
              margin: '0 auto 24px',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Order Number:</span>
                <strong style={{ color: '#0A4C36' }}>{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Delivery Address:</span>
                <span>{formData.address}, {formData.city} ({formData.pincode})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Estimated Delivery:</span>
                <strong style={{ color: '#00B566' }}>3-4 Business Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontWeight: '800', fontSize: '1rem', color: '#0A4C36' }}>
                <span>Paid Amount:</span>
                <span>₹{summary?.grandTotal}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={onClose} style={{ margin: '0 auto' }}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
