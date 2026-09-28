import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Sun, Droplets, ShieldAlert } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onQuickView, 
  onAddToCart, 
  isWishlisted, 
  onToggleWishlist 
}) {
  return (
    <div className="product-card">
      {/* Badges & Wishlist */}
      {product.tag && <div className="card-badge">{product.tag}</div>}

      <button 
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        title="Add to Wishlist"
      >
        <Heart size={18} fill={isWishlisted ? '#E11D48' : 'none'} />
      </button>

      {/* Image Container */}
      <div className="card-image-container" onClick={() => onQuickView(product)} style={{ cursor: 'pointer' }}>
        <img 
          className="card-product-img" 
          src={product.image} 
          alt={product.name} 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/categories/fertilizers.jpg";
          }}
        />
        
        <button 
          className="quick-view-overlay-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
        >
          <Eye size={16} />
          <span>Quick View</span>
        </button>
      </div>

      {/* Content */}
      <div className="card-content">
        <div className="card-category">{product.category}</div>
        <div 
          className="card-title" 
          onClick={() => onQuickView(product)} 
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </div>
        <div className="card-botanical">{product.botanicalName}</div>

        {/* Quick Plant Care Specs */}
        <div className="card-care-specs">
          <div className="care-spec-item" title="Sunlight Requirement">
            <Sun size={13} style={{ color: '#EAB308' }} />
            <span>{product.light && product.light !== 'N/A' ? product.light.split(' ')[0] : 'Balcony'}</span>
          </div>
          <div style={{ color: '#CADFD4' }}>|</div>
          <div className="care-spec-item" title="Water Frequency">
            <Droplets size={13} style={{ color: '#0284C7' }} />
            <span>{product.water && product.water !== 'N/A' ? product.water.split(' ')[0] : 'Soil'}</span>
          </div>
          {product.petFriendly && (
            <>
              <div style={{ color: '#CADFD4' }}>|</div>
              <div className="care-spec-item" style={{ color: '#00B566' }} title="Pet Friendly">
                <span>🐾 Pet Safe</span>
              </div>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="card-rating">
          <div className="stars">
            <Star size={14} fill="#FED02F" stroke="#FED02F" />
            <span style={{ marginLeft: '4px', color: '#1C1C1C', fontWeight: '700' }}>{product.rating}</span>
          </div>
          <span className="reviews">({product.reviewsCount} reviews)</span>
        </div>

        {/* Pot Swatches Preview */}
        {product.potOptions && product.potOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>Planter:</span>
            {product.potOptions.map(pot => (
              <span 
                key={pot.id}
                title={pot.name}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: pot.hex,
                  border: '1px solid #CBD5E1',
                  display: 'inline-block'
                }}
              />
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="card-bottom">
          <div className="price-group">
            <div className="price-current">₹{product.price}</div>
            {product.originalPrice && (
              <div className="price-original">₹{product.originalPrice}</div>
            )}
          </div>

          <button 
            className="add-cart-btn"
            onClick={() => onAddToCart(product, product.potOptions ? product.potOptions[0] : null)}
          >
            <ShoppingBag size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
