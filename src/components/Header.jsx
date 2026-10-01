import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Heart, ShoppingBag, MapPin, Sparkles,
  ChevronDown, ChevronRight, X
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import AnnouncementBar from './AnnouncementBar';

const NAV_DROPDOWNS = {
  "all": {
    title: "All Products",
    columns: [
      {
        header: "Product Categories",
        items: [
          { label: "All Products & Nursery", filter: "all", subtitle: "Explore our complete collection" },
          { label: "Indoor Plants", filter: "Indoor Plants", subtitle: "Air purifiers, low light & more" },
          { label: "Outdoor Plants", filter: "Outdoor Plants", subtitle: "Balcony, palms & sun lovers" },
          { label: "Flowering Plants", filter: "Flowering Plants", subtitle: "Colorful indoor & outdoor blooms" },
          { label: "Seeds & Microgreens", filter: "Seeds", subtitle: "Organic heirloom & vegetable seeds" },
          { label: "Pots & Planters", filter: "Pots & Planters", subtitle: "Self-watering & ceramic glazed" },
          { label: "Plant Care & Soil", filter: "Plant Care", subtitle: "Bio potting mix & fertilizers" },
          { label: "Gifting & Combos", filter: "Gifting & Combos", subtitle: "Curated gift sets & hampers" }
        ]
      },
      {
        header: "Quick Collections",
        items: [
          { label: "🌟 Bestsellers", filter: "bestsellers", subtitle: "Top customer favorites" },
          { label: "🍃 Air Purifying Plants", filter: "air-purifying", subtitle: "NASA recommended clean air" },
          { label: "🐾 Pet Friendly Safe", filter: "pet-friendly", subtitle: "100% safe for dogs & cats" },
          { label: "🌙 Low Light Tolerant", filter: "low-light", subtitle: "Thrives in dark corners" }
        ]
      }
    ]
  },
  "Indoor Plants": {
    title: "Indoor Plants",
    columns: [
      {
        header: "By Special Feature",
        items: [
          { label: "All Indoor Plants", filter: "Indoor Plants", subtitle: "View all indoor nursery plants" },
          { label: "🍃 Air Purifying Plants", filter: "Indoor Plants:air-purifying", subtitle: "Remove toxins & formaldehyde" },
          { label: "🌙 Low Light Plants", filter: "Indoor Plants:low-light", subtitle: "Great for dark rooms & bedrooms" },
          { label: "🐾 Pet Safe Indoor Plants", filter: "Indoor Plants:pet-friendly", subtitle: "Non-toxic for pets" },
          { label: "⚡ Easy Care / Beginner", filter: "Indoor Plants:easy-care", subtitle: "Hard to kill, low effort" }
        ]
      },
      {
        header: "By Space & Room",
        items: [
          { label: "🛏️ Bedroom Plants", filter: "Indoor Plants:Bedroom", subtitle: "Sleep enhancing oxygen producers" },
          { label: "🛋️ Living Room Plants", filter: "Indoor Plants:Living Room", subtitle: "Statement foliage & monsteras" },
          { label: "💼 Office & Desk Plants", filter: "Indoor Plants:Workspace", subtitle: "Compact desktop succulents & ZZ" }
        ]
      }
    ]
  },
  "Outdoor Plants": {
    title: "Outdoor Plants",
    columns: [
      {
        header: "Outdoor Categories",
        items: [
          { label: "All Outdoor Plants", filter: "Outdoor Plants", subtitle: "View all outdoor nursery plants" },
          { label: "🪴 Balcony & Terrace Plants", filter: "Outdoor Plants:Balcony", subtitle: "Perfect for high-rise balconies" },
          { label: "🌴 Palms & Tropical Foliage", filter: "Outdoor Plants:bestseller", subtitle: "Lush fronds & air purifiers" },
          { label: "☀️ Sun Loving Hardy Plants", filter: "Outdoor Plants:easy-care", subtitle: "Tolerates direct afternoon sun" }
        ]
      }
    ]
  },
  "Flowering Plants": {
    title: "Flowering Plants",
    columns: [
      {
        header: "Flowering Varieties",
        items: [
          { label: "All Flowering Plants", filter: "Flowering Plants", subtitle: "View all blooming plants" },
          { label: "🌸 Indoor Flowering", filter: "Flowering Plants:Bedroom", subtitle: "Peace lily & indoor spathe blooms" },
          { label: "🍃 Air Purifying Bloomers", filter: "Flowering Plants:air-purifying", subtitle: "Fragrant air filtering flowers" },
          { label: "✨ Popular Blooming Plants", filter: "Flowering Plants:bestseller", subtitle: "Customer top picks" }
        ]
      }
    ]
  },
  "Seeds": {
    title: "Seeds & Microgreens",
    columns: [
      {
        header: "Seed Collections",
        items: [
          { label: "All Seeds & Microgreens", filter: "Seeds", subtitle: "Browse complete seed range" },
          { label: "🍅 Heirloom Vegetable Seeds", filter: "Seeds:bestseller", subtitle: "100% Non-GMO vegetable seeds" },
          { label: "🌿 Organic Herbs & Greens", filter: "Seeds:Balcony", subtitle: "Balcony kitchen garden seeds" },
          { label: "⭐ Top Rated Seed Packs", filter: "Seeds:trending", subtitle: "High germination rate guarantee" }
        ]
      }
    ]
  },
  "Pots & Planters": {
    title: "Pots & Planters",
    columns: [
      {
        header: "Planter Collections",
        items: [
          { label: "All Pots & Planters", filter: "Pots & Planters", subtitle: "Explore planters & containers" },
          { label: "💧 Self-Watering Pots", filter: "Pots & Planters:easy-care", subtitle: "Wick system automatic watering" },
          { label: "🏺 Ribbed Ceramic Pots", filter: "Pots & Planters:Living Room", subtitle: "Modern glazed home decor pots" },
          { label: "✨ New Arrival Planters", filter: "Pots & Planters:bestseller", subtitle: "Stylish planter sets" }
        ]
      }
    ]
  },
  "Plant Care": {
    title: "Plant Care & Soil",
    columns: [
      {
        header: "Soil & Nourishment",
        items: [
          { label: "All Plant Care & Soil", filter: "Plant Care", subtitle: "Fertilizers, potting mix & tools" },
          { label: "🪴 Bio-Enriched Potting Mix", filter: "Plant Care:Essential", subtitle: "Enriched with vermicompost & neem" },
          { label: "🌿 Organic Fertilizers", filter: "Plant Care:Balcony", subtitle: "Pest control & growth boosters" }
        ]
      }
    ]
  },
  "Gifting & Combos": {
    title: "Gifting & Combos",
    columns: [
      {
        header: "Gift Sets & Value Packs",
        items: [
          { label: "All Gifting & Combos", filter: "Gifting & Combos", subtitle: "Shop green gift sets" },
          { label: "🍃 Air Purifier Trios", filter: "Gifting & Combos:air-purifying", subtitle: "3-plant air purifier set" },
          { label: "🏡 Housewarming Gifts", filter: "Gifting & Combos:Living Room", subtitle: "Potted plant hampers" },
          { label: "💰 Super Saver Combos", filter: "Gifting & Combos:bestseller", subtitle: "Up to 40% OFF combo packs" }
        ]
      }
    ]
  }
};

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

  const [openDropdown, setOpenDropdown] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

  const getProductCount = (filter) => {
    if (!filter || filter === 'all') return PRODUCTS.length;
    return PRODUCTS.filter(p => {
      if (filter === 'bestsellers') return p.tag === 'Bestseller' || p.rating >= 4.8;
      if (filter === 'air-purifying') return p.airPurifying;
      if (filter === 'pet-friendly') return p.petFriendly;
      if (filter === 'low-light') return p.light?.toLowerCase().includes('low');

      if (filter.includes(':')) {
        const [cat, sub] = filter.split(':');
        if (cat !== 'all' && p.category !== cat) return false;
        if (sub === 'air-purifying') return p.airPurifying;
        if (sub === 'low-light') return p.light?.toLowerCase().includes('low');
        if (sub === 'pet-friendly') return p.petFriendly;
        if (sub === 'bestseller' || sub === 'bestsellers') return p.tag === 'Bestseller' || p.rating >= 4.8;
        if (sub === 'trending') return p.tag === 'Trending' || p.tag === 'Top Rated';
        if (sub === 'easy-care') return p.maintenance?.toLowerCase().includes('easy') || p.maintenance?.toLowerCase().includes('low') || p.maintenance?.toLowerCase().includes('zero') || p.category === 'Pots & Planters';
        if (['Bedroom', 'Living Room', 'Balcony', 'Workspace', 'Desk'].includes(sub)) return p.room === sub;
        if (p.tag === sub) return true;
        return true;
      }
      return p.category === filter;
    }).length;
  };

  const scrollToProducts = () => {
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) {
        const headerOffset = 130;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  const handleCategorySelect = (filterKey) => {
    setActiveCategory(filterKey);
    setOpenDropdown(null);
    scrollToProducts();
  };

  const handleMouseEnter = (catId) => {
    if (window.innerWidth > 992) {
      clearTimeout(hoverTimeoutRef.current);
      setOpenDropdown(catId);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 992) {
      hoverTimeoutRef.current = setTimeout(() => {
        setOpenDropdown(null);
      }, 150);
    }
  };

  const handleNavClick = (e, catId) => {
    if (window.innerWidth <= 992) {
      // Toggle dropdown on mobile
      e.preventDefault();
      setOpenDropdown(prev => prev === catId ? null : catId);
    } else {
      // Direct category click on desktop
      handleCategorySelect(catId);
    }
  };

  const isCatActive = (catId) => {
    if (catId === 'all') return activeCategory === 'all';
    return activeCategory === catId || (activeCategory.includes(':') && activeCategory.startsWith(catId));
  };

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
                onClick={() => handleCategorySelect('all')}
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

              {/* Live Search Bar (Center) */}
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

              {/* Header Right Controls: Pincode & Actions */}
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

            </div>
          </div>

          {/* 3. Category Links Navbar with Dropdowns */}
          <nav className="category-nav" ref={navRef}>
            <div className="container nav-container">
              <ul className="nav-links">
                {CATEGORIES.map(cat => {
                  const hasDropdown = Boolean(NAV_DROPDOWNS[cat.id]);
                  const isOpen = openDropdown === cat.id;

                  return (
                    <li
                      key={cat.id}
                      className="nav-item-li"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className={`nav-item-btn ${isCatActive(cat.id) ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                        onClick={(e) => handleNavClick(e, cat.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="nav-text">{cat.name}</span>
                        {hasDropdown && (
                          <ChevronDown
                            size={14}
                            className={`nav-chevron ${isOpen ? 'rotated' : ''}`}
                          />
                        )}
                      </button>

                      {/* Dropdown Menu Panel */}
                      {hasDropdown && isOpen && (
                        <div
                          className={`nav-dropdown-menu ${cat.id === 'all' || cat.id === 'Indoor Plants' ? 'mega-wide' : ''}`}
                          onMouseEnter={() => handleMouseEnter(cat.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="dropdown-inner">
                            <div className="dropdown-columns">
                              {NAV_DROPDOWNS[cat.id].columns.map((col, cIdx) => (
                                <div key={cIdx} className="dropdown-column">
                                  <h4 className="dropdown-col-title">{col.header}</h4>
                                  <ul className="dropdown-items-list">
                                    {col.items.map((item, iIdx) => {
                                      const count = getProductCount(item.filter);
                                      const isSelected = activeCategory === item.filter;

                                      return (
                                        <li key={iIdx}>
                                          <button
                                            type="button"
                                            className={`dropdown-link-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(item.filter)}
                                          >
                                            <div className="link-content">
                                              <span className="link-label">{item.label}</span>
                                              {item.subtitle && (
                                                <span className="link-subtitle">{item.subtitle}</span>
                                              )}
                                            </div>
                                            {count > 0 && (
                                              <span className="link-badge-count">{count}</span>
                                            )}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {/* Dropdown Footer */}
                            <div className="dropdown-footer">
                              <button
                                type="button"
                                className="dropdown-view-all-btn"
                                onClick={() => handleCategorySelect(cat.id)}
                              >
                                <span>Explore All {cat.name}</span>
                                <ChevronRight size={14} />
                              </button>
                              <span className="dropdown-delivery-note">
                                🌱 Express Delivery Available • 100% Guaranteed Fresh
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
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
