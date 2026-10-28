import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const SHOP_CATEGORIES = [
  {
    id: "Indoor Plants",
    name: "Indoor Plants",
    subtitle: "Low maintenance air purifiers",
    badge: "Bestseller",
    img: "/images/categories/indoor_plants.jpg"
  },
  {
    id: "Outdoor Plants",
    name: "Outdoor Plants",
    subtitle: "Sun-loving palms & garden flora",
    badge: "Trending",
    img: "/images/plants/areca_palm.jpg"
  },
  {
    id: "Flowering Plants",
    name: "Flowering Plants",
    subtitle: "Year-round blossoms & elegance",
    badge: "Pure Elegance",
    img: "/images/plants/peace_lily.jpg"
  },
  {
    id: "Seeds",
    name: "Seeds & Microgreens",
    subtitle: "100% Non-GMO organic heirloom",
    badge: "High Yield",
    img: "/images/categories/seeds.jpg"
  },
  {
    id: "Pots & Planters",
    name: "Pots & Planters",
    subtitle: "Ceramic & self-watering designs",
    badge: "New Styles",
    img: "/images/categories/planters.jpg"
  },
  {
    id: "Plant Care",
    name: "Plant Care & Soil",
    subtitle: "Organic potting mixes & fertilizers",
    badge: "Essential",
    img: "/images/categories/fertilizers.jpg"
  }
];

export default function CategoryCircles({ onSelectCategory }) {
  const fallbackImg = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600";

  const handleCardClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    const productsEl = document.getElementById('products');
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="ugaoo-category-section" id="categories-section">
      <div className="container">
        <div className="ugaoo-section-header">
          <div>
            <span className="ugaoo-section-sub">Shop by Category</span>
            <h2 className="ugaoo-section-title">Pick from Our Nursery-Grown Selection</h2>
          </div>
          <p className="ugaoo-section-desc">
            Hand-curated botanical categories designed for every home, balcony, and garden space.
          </p>
        </div>

        <div className="ugaoo-category-grid">
          {SHOP_CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="ugaoo-category-card"
              onClick={() => handleCardClick(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(cat.id)}
            >
              <div className="ugaoo-category-img-box">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                  className="ugaoo-category-img"
                />
                <span className="ugaoo-cat-badge">{cat.badge}</span>
                <div className="ugaoo-cat-overlay">
                  <span className="ugaoo-cat-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>

              <div className="ugaoo-category-info">
                <h3 className="ugaoo-cat-name">{cat.name}</h3>
                <p className="ugaoo-cat-sub">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
