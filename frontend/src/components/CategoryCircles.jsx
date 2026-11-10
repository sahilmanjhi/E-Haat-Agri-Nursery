import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { categoryToSlug } from '../utils/categoryUtils';

const CATEGORY_PRESETS = {
  'indoor-plants': {
    subtitle: 'Low maintenance air purifiers',
    badge: 'Bestseller',
    img: '/images/categories/indoor_plants.jpg'
  },
  'flowering-plants': {
    subtitle: 'Year-round blossoms & elegance',
    badge: 'Fresh Blooms',
    img: '/images/plants/peace_lily.png'
  },
  'fruits-plants': {
    subtitle: 'Terrace garden & fruit trees',
    badge: 'High Yield',
    img: '/images/plants/areca_palm.jpg'
  },
  'vegetables-crops': {
    subtitle: '100% Non-GMO organic heirloom seeds',
    badge: 'Kitchen Garden',
    img: '/images/plants/heirloom_seeds.jpg'
  },
  'plant-care': {
    subtitle: 'Organic potting mixes & fertilizers',
    badge: 'Essential',
    img: '/images/categories/fertilizers.jpg'
  },
  'planters': {
    subtitle: 'Ceramic & self-watering designs',
    badge: 'New Styles',
    img: '/images/categories/planters.jpg'
  },
  'gifting-combos': {
    subtitle: 'Curated plant sets & hampers',
    badge: 'Green Gifts',
    img: '/images/hero/bring_nature_indoors.jpg'
  }
};

const DEFAULT_SHOP_CATEGORIES = [
  { id: 'Indoor Plants', name: 'Indoor Plants', slug: 'indoor-plants' },
  { id: 'Flowering Plants', name: 'Flowering Plants', slug: 'flowering-plants' },
  { id: 'Fruits Plants', name: 'Fruits Plants', slug: 'fruits-plants' },
  { id: 'Vegetables Crops', name: 'Vegetables Crops', slug: 'vegetables-crops' },
  { id: 'Plant Care', name: 'Plant Care', slug: 'plant-care' }
];

export default function CategoryCircles({ categories = [], onSelectCategory }) {
  const fallbackImg = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600";

  // Filter out 'all' from categories prop, or fallback to default categories
  const rawList = categories && categories.length > 0
    ? categories.filter(c => {
        const idVal = typeof c === 'string' ? c : (c.id || c.name || '');
        return String(idVal).toLowerCase() !== 'all';
      })
    : DEFAULT_SHOP_CATEGORIES;

  const displayCategories = (rawList.length > 0 ? rawList : DEFAULT_SHOP_CATEGORIES).map(cat => {
    const catName = typeof cat === 'string' ? cat : (cat.name || cat.id);
    const slug = categoryToSlug(catName);
    const preset = CATEGORY_PRESETS[slug] || {};

    return {
      id: catName,
      name: catName,
      slug,
      subtitle: (typeof cat === 'object' && cat.description) || preset.subtitle || 'Hand-curated nursery selection',
      badge: preset.badge || 'Nursery Fresh',
      img: (typeof cat === 'object' && cat.image) || preset.img || fallbackImg
    };
  });

  const handleCardClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
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
          {displayCategories.map((cat) => (
            <div 
              key={cat.id || cat.slug} 
              className="ugaoo-category-card"
              onClick={() => handleCardClick(cat.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(cat.name)}
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
