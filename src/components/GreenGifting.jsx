import React from 'react';
import { Gift, Package, Award, Sparkles } from 'lucide-react';

export default function GreenGifting({ onSelectCategory }) {
  return (
    <section className="green-gifting-section" style={{
      background: 'linear-gradient(90deg, #D89A9E 0%, #E8B4B4 50%, #F5C6C6 100%)',
      padding: '70px 0',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="green-gifting-grid">
          
          {/* Left Side Info */}
          <div>
            <h2 className="green-gifting-title" style={{
              fontFamily: 'serif',
              fontSize: '3rem',
              color: '#FFFFFF',
              fontWeight: '700',
              lineHeight: '1.15',
              marginBottom: '20px',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              Green gifting,<br />made easy.
            </h2>

            <p className="green-gifting-desc" style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '24px',
              maxWidth: '500px',
              lineHeight: '1.5'
            }}>
              Diwali gifting. Onboarding kits. Office refreshes. GST invoicing. Dedicated account manager.
            </p>

            <div className="green-gifting-brands" style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#063827',
              marginBottom: '32px'
            }}>
              Bajaj, Mercedes, Tata, Sun Pharma & 50+ more brands
            </div>

            <div className="green-gifting-actions">
              <button 
                style={{
                  background: '#063827',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '1rem',
                  padding: '14px 28px',
                  borderRadius: '99px',
                  boxShadow: '0 6px 20px rgba(6, 56, 39, 0.3)',
                  border: 'none'
                }}
                onClick={() => onSelectCategory('Gifting & Combos')}
              >
                Shop Hampers
              </button>
              
              <button 
                style={{
                  background: '#00B566',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '1rem',
                  padding: '14px 28px',
                  borderRadius: '99px',
                  boxShadow: '0 6px 20px rgba(0, 181, 102, 0.3)',
                  border: 'none'
                }}
                onClick={() => alert("For corporate & bulk inquiries, email us at bulk@agrimart.com or call +91-9876543210")}
              >
                Bulk Order
              </button>
            </div>
          </div>

          {/* Right Side Image */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <img 
              className="green-gifting-img"
              src="/images/green_gifting_hamper.jpg" 
              alt="AgriMart Green Gifting Hamper Box" 
              style={{
                width: '100%',
                maxWidth: '520px',
                height: '420px',
                objectFit: 'cover',
                borderRadius: '24px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
                border: '6px solid rgba(255, 255, 255, 0.5)'
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
