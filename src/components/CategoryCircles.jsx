import React from 'react';
import { CATEGORY_CIRCLES } from '../data/products';

export default function CategoryCircles({ onSelectCategory }) {
  const fallbackImg = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=400";

  return (
    <section className="category-circles-section">
      <div className="container">
        <div className="category-circles-grid">
          {CATEGORY_CIRCLES.map((cat) => (
            <div 
              key={cat.id} 
              className="category-circle-card"
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="circle-img-box">
                <img 
                  src={cat.img} 
                  alt={cat.label} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                />
              </div>
              <div className="circle-label">{cat.label}</div>
              <div className="circle-badge">{cat.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
