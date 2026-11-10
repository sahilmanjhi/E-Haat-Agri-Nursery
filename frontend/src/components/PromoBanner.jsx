import React from 'react';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';

export default function PromoBanner({ onExploreCategory }) {
  return (
    <section className="ugaoo-promo-section">
      <div className="container">
        <div className="ugaoo-promo-grid">
          
          {/* Promo Card 1: Green Your Home Combo */}
          <div className="ugaoo-promo-card promo-card-1">
            <div className="ugaoo-promo-content">
              <span className="ugaoo-promo-tag">
                <Tag size={13} />
                <span>LIMITED TIME OFFER</span>
              </span>
              <h3 className="ugaoo-promo-title">Buy Any 3 Plants, Get 1 FREE</h3>
              <p className="ugaoo-promo-desc">
                Mix and match air purifiers, flowering plants, and desk greens. Use code: <strong className="promo-code">PLANTLOVE</strong>
              </p>
              <button 
                className="ugaoo-promo-btn"
                onClick={() => onExploreCategory('Indoor Plants')}
              >
                <span>Shop the Offer</span>
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="ugaoo-promo-img-wrapper">
              <img 
                src="/images/categories/indoor_plants.jpg" 
                alt="Plant combos offer"
                className="ugaoo-promo-img"
              />
            </div>
          </div>

          {/* Promo Card 2: Self-Watering Planters & Soil */}
          <div className="ugaoo-promo-card promo-card-2">
            <div className="ugaoo-promo-content">
              <span className="ugaoo-promo-tag accent">
                <Sparkles size={13} />
                <span>AGRI-NURSERY EXCLUSIVE</span>
              </span>
              <h3 className="ugaoo-promo-title">Up to 35% OFF Planters & Soil</h3>
              <p className="ugaoo-promo-desc">
                Bio-enriched organic potting mix and handcrafted self-watering ceramic planters.
              </p>
              <button 
                className="ugaoo-promo-btn accent"
                onClick={() => onExploreCategory('Pots & Planters')}
              >
                <span>Explore Planters</span>
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="ugaoo-promo-img-wrapper">
              <img 
                src="/images/categories/planters.jpg" 
                alt="Pots & Planters Sale"
                className="ugaoo-promo-img"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
