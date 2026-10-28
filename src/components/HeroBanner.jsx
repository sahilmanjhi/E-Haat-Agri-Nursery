import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, Star } from 'lucide-react';

export default function HeroBanner({ onExploreCategory }) {
  const scrollToProducts = (category = 'all') => {
    if (onExploreCategory) {
      onExploreCategory(category);
    }
    const target = document.getElementById('products') || document.getElementById('categories-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="ugaoo-hero-section">
      <div className="container">
        <div className="ugaoo-hero-grid">
          
          {/* Left Column: Text & Actions */}
          <div className="ugaoo-hero-content">
            <div className="ugaoo-hero-badge">
              <Sparkles size={14} style={{ color: '#0A4C36' }} />
              <span>India's Premium Campus Agri-Nursery</span>
            </div>

            <h1 className="ugaoo-hero-title">
              Bring Nature <span className="ugaoo-highlight">Home.</span>
            </h1>

            <p className="ugaoo-hero-desc">
              Discover lush, air-purifying indoor & outdoor plants, farm-fresh heirloom seeds, 
              handcrafted self-watering planters, and organic plant care essentials — nurtured with 
              love and delivered safely to your doorstep.
            </p>

            {/* Action Buttons */}
            <div className="ugaoo-hero-actions">
              <button 
                className="ugaoo-btn-primary"
                onClick={() => scrollToProducts('all')}
                id="hero-shop-plants-btn"
              >
                <span>Shop Plants</span>
                <ArrowRight size={18} />
              </button>

              <button 
                className="ugaoo-btn-secondary"
                onClick={() => scrollToProducts('bestsellers')}
                id="hero-explore-bestsellers-btn"
              >
                <span>Explore Best Sellers</span>
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="ugaoo-hero-trust-strip">
              <div className="trust-pill">
                <Truck size={15} style={{ color: '#0A4C36' }} />
                <span>Pan-India Safe Delivery</span>
              </div>
              <div className="trust-pill">
                <ShieldCheck size={15} style={{ color: '#00B566' }} />
                <span>7-Day Plant Guarantee</span>
              </div>
              <div className="trust-pill">
                <MessageCircle size={15} style={{ color: '#25D366' }} />
                <span>WhatsApp Plant Doctor</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Botanical Photography Composition */}
          <div className="ugaoo-hero-visual">
            <div className="ugaoo-hero-image-wrapper">
              <img 
                src="/images/hero/bring_nature_indoors.jpg" 
                alt="Lush Botanical Greenery for Modern Homes"
                className="ugaoo-hero-main-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=1200";
                }}
              />

              {/* Floating Social Proof Card */}
              <div className="ugaoo-floating-card top-right">
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#FED02F" stroke="#FED02F" />
                  ))}
                </div>
                <div className="floating-card-title">4.9 / 5 Rating</div>
                <div className="floating-card-sub">15,000+ Happy Plant Parents</div>
              </div>

              {/* Floating Nursery Guarantee Card */}
              <div className="ugaoo-floating-card bottom-left">
                <div className="floating-badge-icon">🌿</div>
                <div>
                  <div className="floating-card-title">100% Nursery Grown</div>
                  <div className="floating-card-sub">Acclimatized & Pest-Free Stock</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
