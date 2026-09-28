import React, { useState, useEffect } from 'react';
import { X, Star, Sun, Droplets, ShieldCheck, Heart, ShoppingBag, Truck, Award, Check } from 'lucide-react';

export default function ProductQuickViewModal({ 
  product, 
  onClose, 
  onAddToCart, 
  isWishlisted, 
  onToggleWishlist 
}) {
  if (!product) return null;

  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product.image, product.imageHover].filter(Boolean);

  const [selectedPot, setSelectedPot] = useState(
    product.potOptions ? product.potOptions[0] : null
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizeOptions ? product.sizeOptions[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || product.image);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (product) {
      const imgs = (product.gallery && product.gallery.length > 0)
        ? product.gallery
        : [product.image, product.imageHover].filter(Boolean);
      setSelectedImage(imgs[0] || product.image);
      setIsFading(false);
    }
  }, [product]);

  const handleSelectThumbnail = (imgUrl) => {
    if (imgUrl === selectedImage) return;
    setIsFading(true);
    setTimeout(() => {
      setSelectedImage(imgUrl);
      setIsFading(false);
    }, 200);
  };

  const totalPrice = (product.price + (selectedPot ? selectedPot.extraPrice : 0)) * quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '860px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-grid-container">
          
          {/* Left Column: Product Image Gallery */}
          <div>
            <div className="product-gallery-layout">
              
              {/* Vertical Thumbnails Column (Horizontal on Mobile) */}
              <div className="product-thumbnails-column">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumbnail-item ${selectedImage === imgUrl ? 'active' : ''}`}
                    onClick={() => handleSelectThumbnail(imgUrl)}
                    title={`View thumbnail ${idx + 1}`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = product.image;
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Large Main Product Preview Image */}
              <div className="product-main-preview-box">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className={isFading ? 'fading' : ''}
                  onError={(e) => {
                    e.target.src = product.image;
                  }}
                />
              </div>

            </div>

            {/* Guarantees */}
            <div style={{
              marginTop: '20px',
              background: '#EBF5F0',
              padding: '14px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#0A4C36',
              fontWeight: '600'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} />
                <span>100% Healthy Plant Guarantee (7-Day Free Replacement)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} />
                <span>Safe 5-Layer Ventilated Eco Packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Pot Options */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#00B566', textTransform: 'uppercase', marginBottom: '4px' }}>
              {product.category}
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#0A4C36', marginBottom: '4px' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: '0.85rem', italic: 'true', color: '#64748B', marginBottom: '12px' }}>
              {product.botanicalName}
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', color: '#FED02F' }}>
                <Star size={16} fill="#FED02F" stroke="#FED02F" />
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{product.rating}</span>
              <span style={{ color: '#64748B', fontSize: '0.85rem' }}>({product.reviewsCount} verified reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0A4C36' }}>
                ₹{totalPrice}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#64748B' }}>
                  ₹{(product.originalPrice + (selectedPot ? selectedPot.extraPrice : 0)) * quantity}
                </span>
              )}
              {product.discount && (
                <span style={{ background: '#FED02F', color: '#000', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Pot Options */}
            {product.potOptions && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#1C1C1C' }}>
                  Select Planter Option: <span style={{ color: '#0A4C36' }}>{selectedPot?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.potOptions.map(pot => (
                    <button
                      key={pot.id}
                      onClick={() => setSelectedPot(pot)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: selectedPot?.id === pot.id ? '2px solid #0A4C36' : '1px solid #CBD5E1',
                        background: selectedPot?.id === pot.id ? '#EBF5F0' : '#FFF',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: pot.hex,
                        border: '1px solid #94A3B8'
                      }} />
                      <span>{pot.name}</span>
                      {pot.extraPrice > 0 && <span style={{ color: '#0A4C36' }}>+(₹{pot.extraPrice})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.sizeOptions && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>
                  Select Plant Size:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.sizeOptions.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: selectedSize === sz ? '2px solid #0A4C36' : '1px solid #CBD5E1',
                        background: selectedSize === sz ? '#EBF5F0' : '#FFF',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0 8px'
              }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px', fontSize: '1.1rem', fontWeight: '700' }}
                >
                  -
                </button>
                <span style={{ width: '30px', textAlign: 'center', fontWeight: '700' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '8px', fontSize: '1.1rem', fontWeight: '700' }}
                >
                  +
                </button>
              </div>

              <button 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  onAddToCart(product, selectedPot, selectedSize, quantity);
                  onClose();
                }}
              >
                <ShoppingBag size={18} />
                <span>Add {quantity} to Cart • ₹{totalPrice}</span>
              </button>

              <button 
                className="wishlist-btn" 
                style={{ position: 'static', width: '48px', height: '48px' }}
                onClick={() => onToggleWishlist(product)}
              >
                <Heart size={20} fill={isWishlisted ? '#E11D48' : 'none'} />
              </button>
            </div>

            {/* Plant Care Details Breakdown */}
            {product.careSpecs && (
              <div style={{
                borderTop: '1px solid #E2E8F0',
                paddingTop: '16px'
              }}>
                <h4 style={{ fontSize: '0.95rem', color: '#0A4C36', marginBottom: '10px' }}>
                  🌿 Plant Care & Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#F8FAF8', padding: '8px', borderRadius: '6px' }}>
                    <strong style={{ color: '#0A4C36' }}>☀️ Light:</strong> {product.careSpecs.sunlight}
                  </div>
                  <div style={{ background: '#F8FAF8', padding: '8px', borderRadius: '6px' }}>
                    <strong style={{ color: '#0A4C36' }}>💧 Water:</strong> {product.careSpecs.watering}
                  </div>
                  <div style={{ background: '#F8FAF8', padding: '8px', borderRadius: '6px' }}>
                    <strong style={{ color: '#0A4C36' }}>🌡️ Humidity:</strong> {product.careSpecs.humidity}
                  </div>
                  <div style={{ background: '#F8FAF8', padding: '8px', borderRadius: '6px' }}>
                    <strong style={{ color: '#0A4C36' }}>🧪 Fertilizer:</strong> {product.careSpecs.fertilizer}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
