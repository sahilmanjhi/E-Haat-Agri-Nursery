import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Phone, MapPin, Check } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">

        {/* Newsletter Header */}
        <div className="footer-newsletter-grid">
          <div>
            <div style={{ color: '#FED02F', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              JOIN THE ITMU e-haat PLANT CLUB
            </div>
            <h3 style={{ color: '#FFFFFF', fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', marginTop: '4px' }}>
              Get ₹100 Off Your First Order + Weekly Care Tips
            </h3>
            <div style={{ color: '#00B566', fontSize: '0.85rem', fontWeight: '700', marginTop: '2px' }}>
              Freshness at Your Doorstep.
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="footer-newsletter-form">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                outline: 'none',
                fontSize: '0.9rem',
                minWidth: 0
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 20px', borderRadius: '8px', flexShrink: 0 }}>
              {subscribed ? <Check size={18} /> : <span>Subscribe</span>}
            </button>
          </form>
          {subscribed && (
            <div style={{ color: '#FED02F', fontSize: '0.8rem', gridColumn: '1 / -1', fontWeight: '700' }}>
              ✓ You are subscribed! Check your email for code: <strong>WELCOME100</strong>
            </div>
          )}
        </div>

        {/* Links Grid */}
        <div className="footer-grid">

          <div className="footer-col">
            <div className="brand-logo" style={{ color: '#FFFFFF', marginBottom: '16px', gap: '12px' }}>
              <img
                src="/images/itmu_ehaat_logo_bg.png"
                alt="ITMU e-haat Logo"
                style={{
                  height: '48px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '6px'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.5rem', color: '#FFF', fontWeight: '800' }}>ITMU e-haat</span>
                  <span className="tag" style={{ background: '#FED02F', color: '#000' }}>AGRI NURSERY</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#FED02F', fontWeight: '700' }}>
                  Freshness at Your Doorstep.
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6', marginBottom: '20px' }}>
              ITMU e-haat Agri Nursery is your trusted online plant destination bringing healthy air-purifying indoor plants, organic seeds, self-watering ceramic planters, and bio-enriched potting mix straight to your home.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#FED02F', fontWeight: '700' }}>
              📞 Customer Care: +91-9876543210
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop Plants</h4>
            <ul>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Indoor Plants')}>Indoor Plants</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Outdoor Plants')}>Outdoor Plants</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Flowering Plants')}>Flowering Plants</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Seeds')}>Vegetable & Herb Seeds</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Pots & Planters')}>Self-Watering Pots</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Plant Care')}>Organic Potting Soil</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Support</h4>
            <ul>
              <li>Track Your Order</li>
              <li>7-Day Plant Guarantee</li>
              <li>Shipping & Delivery Policy</li>
              <li>Return & Refund Policy</li>
              <li>Plant Doctor WhatsApp Hotline</li>
              <li>Corporate Gifting Inquiries</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>ITM Agri Hubs</h4>
            <ul>
              <li>🌿 ITM Gwalior Campus Hub</li>
              <li>🌿 MP Agri Innovation Zone</li>
              <li>🌿 Delhi NCR Dispatch Center</li>
              <li>🌿 Central India Nursery</li>
            </ul>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>
                🔒 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} ITMU e-haat Agri Nursery. All Rights Reserved. Freshness at Your Doorstep.
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
