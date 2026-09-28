import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          zIndex: 999,
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with ITMUE-HAAT Plant Doctor"
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={32} />
      </button>

      {/* Interactive Chat Popup */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '340px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: '#075E54',
            color: '#FFFFFF',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}>
                <img src="/images/itm_logo.png" alt="ITM Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>ITMUE-HAAT Plant Doctor</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Agri Nursery • Online</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#FFFFFF' }}>
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div style={{ padding: '16px', background: '#ECE5DD', minHeight: '180px' }}>
            <div style={{
              background: '#FFFFFF',
              padding: '12px 14px',
              borderRadius: '0 12px 12px 12px',
              fontSize: '0.85rem',
              color: '#1C1C1C',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              maxWidth: '85%',
              marginBottom: '10px'
            }}>
              Hi there! 👋 Welcome to ITMUE-HAAT Agri Nursery. Grow Better. Shop Smarter! How can we help you today?
            </div>

            <div style={{
              background: '#DCF8C6',
              padding: '10px 14px',
              borderRadius: '12px 0 12px 12px',
              fontSize: '0.85rem',
              color: '#1C1C1C',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              marginLeft: 'auto',
              maxWidth: '80%'
            }}>
              Need expert plant advice 🌿
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ padding: '12px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.9rem',
                padding: '12px',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <Send size={16} />
              <span>Start Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
