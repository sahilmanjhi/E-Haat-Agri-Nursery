import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemoveWishlist, 
  onMoveToCart 
}) {
  return (
    <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} fill="#FFF" />
            <h3>Your Saved Wishlist ({wishlistItems.length})</h3>
          </div>
          <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {wishlistItems.length > 0 ? (
            wishlistItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-pot">{item.category}</div>
                  <div style={{ fontWeight: '800', color: '#0A4C36', marginTop: '4px' }}>
                    ₹{item.price}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button 
                      className="add-cart-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => {
                        onMoveToCart(item);
                        onRemoveWishlist(item);
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>Move to Cart</span>
                    </button>

                    <button 
                      onClick={() => onRemoveWishlist(item)}
                      style={{ color: '#E11D48', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <Heart size={48} style={{ color: '#CADFD4', marginBottom: '16px' }} />
              <h4>No Saved Plants Yet</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Tap the heart icon on any plant card to save it for later!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
