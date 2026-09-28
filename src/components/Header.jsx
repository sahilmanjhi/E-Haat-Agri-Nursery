import React, { useState } from 'react';
import {
  Search, Heart, ShoppingBag, MapPin, Sparkles,
  ChevronDown, Phone, X
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import AnnouncementBar from './AnnouncementBar';

export default function Header({
  activeCategory,
  setActiveCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenQuiz,
  onSelectProduct
}) {
  const [pincode, setPincode] = useState('474001');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [inputPincode, setInputPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(inputPincode)) {
      setPincode(inputPincode);
      setPincodeStatus({ success: true, text: "Express Delivery (24-48 Hours) Available!" });
      setTimeout(() => setShowPincodeModal(false), 1200);
    } else {
      setPincodeStatus({ success: false, text: "Please enter a valid 6-digit Pincode" });
    }
  };

  const filteredSearchResults = searchQuery.trim()
    ? PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.botanicalName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <>
      <div className="sticky-header-wrapper">
        {/* 1. Sticky Floating Announcement Bar */}
        <AnnouncementBar />

        {/* 2. Main Header */}
        <header className="site-header">
          <div className="container">
            <div className="header-top">

              {/* Logo & Co-Branding Header */}
              <div
                className="brand-logo-wrapper"
                onClick={() => setActiveCategory('all')}
              >
                {/* ITM University Official Logo */}
                <img
                  src="/images/itm_logo.png"
                  alt="ITM University Logo"
                  className="header-itm-logo"
                />

                {/* Vertical Divider */}
                <div className="header-logo-divider" />

                {/* ITMU e-Haat Agri Nursery Logo */}
                <img
                  src="/images/itmu_ehaat_logo.png"
                  alt="ITMU e-Haat Agri Nursery"
                  className="header-ehaat-logo"
                />
              </div>

              {/* Header Middle Controls: Pincode & Actions */}
              <div className="header-mid-controls">
                {/* Pincode Selector */}
                <button className="pincode-btn" onClick={() => setShowPincodeModal(true)}>
                  <MapPin size={14} style={{ color: '#00B566', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.6rem', color: '#64748B', lineHeight: '1' }}>Deliver to</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {pincode} <span className="pincode-express-tag">- Express</span>
                    </div>
                  </div>
                  <ChevronDown size={12} style={{ flexShrink: 0 }} />
                </button>

                {/* Actions: Quiz, Wishlist, Cart */}
                <div className="header-actions">
                  <button className="quiz-pill-btn" onClick={onOpenQuiz}>
                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                    <span className="quiz-btn-text">Plant Finder</span>
                  </button>

                  <button className="action-icon-btn" onClick={onOpenWishlist} title="Wishlist">
                    <Heart size={18} style={{ flexShrink: 0 }} />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                  </button>

                  <button className="action-icon-btn" onClick={onOpenCart} title="Cart">
                    <ShoppingBag size={18} style={{ flexShrink: 0 }} />
                    <span>Cart</span>
                    {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                  </button>
                </div>
              </div>

              {/* Live Search Bar */}
              <div className="header-search">
                <div className="search-input-wrapper">
                  <Search size={18} style={{ color: '#64748B', marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search plants, seeds, pots, organic fertilizers..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                  />
                  {searchQuery && (
                    <X
                      size={16}
                      style={{ cursor: 'pointer', color: '#64748B', flexShrink: 0 }}
                      onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    />
                  )}
                </div>

                {/* Search Dropdown Popup */}
                {isSearchOpen && searchQuery.trim() !== '' && (
                  <div className="search-dropdown">
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginBottom: '8px' }}>
                      SEARCH RESULTS ({filteredSearchResults.length})
                    </div>
                    {filteredSearchResults.length > 0 ? (
                      filteredSearchResults.map(product => (
                        <div
                          key={product.id}
                          className="search-item"
                          onClick={() => {
                            onSelectProduct(product);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <img src={product.image} alt={product.name} />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0A4C36' }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{product.category} • ₹{product.price}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                        No plants found for "{searchQuery}". Try searching "Snake Plant" or "Seeds".
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. Category Links Navbar */}
          <nav className="category-nav">
            <div className="container">
              <ul className="nav-links">
                {CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button
                      className={`nav-item-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>
    </div>

      {/* Pincode Modal */}
      {showPincodeModal && (
        <div className="modal-overlay" onClick={() => setShowPincodeModal(false)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPincodeModal(false)}>
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <MapPin size={36} style={{ color: '#0A4C36', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1.4rem' }}>Check Delivery Pincode</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Enter your pincode to check ITMU e-haat plant delivery availability and speed.
              </p>
            </div>
            <form onSubmit={handlePincodeSubmit}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="e.g. 474001"
                  value={inputPincode}
                  onChange={e => setInputPincode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 20px', borderRadius: '8px' }}
                >
                  Verify
                </button>
              </div>
            </form>
            {pincodeStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: pincodeStatus.success ? '#EBF5F0' : '#FFE4E6',
                color: pincodeStatus.success ? '#0A4C36' : '#E11D48',
                textAlign: 'center'
              }}>
                {pincodeStatus.text}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
