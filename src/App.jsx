import React, { useState } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryCircles from './components/CategoryCircles';
import ProductCard from './components/ProductCard';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PlantQuizModal from './components/PlantQuizModal';
import WishlistDrawer from './components/WishlistDrawer';
import WhyChooseUs from './components/WhyChooseUs';
import CustomerReviews from './components/CustomerReviews';
import PlantDoctorFAQ from './components/PlantDoctorFAQ';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// 5 Main Landing Sections from Ugaoo Layout
import FarmToHome from './components/FarmToHome';
import TransformHome from './components/TransformHome';
import GreenGifting from './components/GreenGifting';
import OurStory from './components/OurStory';
import PlantCareSimplified from './components/PlantCareSimplified';

import { PRODUCTS, CATEGORIES } from './data/products';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedRoom, setSelectedRoom] = useState('all');

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState(null);

  // Cart operations
  const handleAddToCart = (product, pot = null, size = null, qty = 1) => {
    const existingIdx = cartItems.findIndex(
      item => item.id === product.id && item.selectedPot?.id === pot?.id && item.selectedSize === size
    );

    if (existingIdx > -1) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += qty;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          selectedPot: pot || (product.potOptions ? product.potOptions[0] : null),
          selectedSize: size || (product.sizeOptions ? product.sizeOptions[0] : null),
          quantity: qty
        }
      ]);
    }

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (item, newQty) => {
    if (newQty <= 0) {
      setCartItems(cartItems.filter(i => i !== item));
    } else {
      setCartItems(cartItems.map(i => i === item ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveCartItem = (item) => {
    setCartItems(cartItems.filter(i => i !== item));
  };

  // Wishlist toggle
  const handleToggleWishlist = (product) => {
    const exists = wishlistItems.some(i => i.id === product.id);
    if (exists) {
      setWishlistItems(wishlistItems.filter(i => i.id !== product.id));
    } else {
      setWishlistItems([...wishlistItems, product]);
    }
  };

  // Helper for human readable category section titles
  const getCategoryTitle = (catKey) => {
    if (!catKey || catKey === 'all') return 'All Bestselling Nursery Collection';
    if (catKey === 'bestsellers') return 'Bestselling Nursery Collection';
    if (catKey === 'air-purifying') return 'Air Purifying Plants Collection';
    if (catKey === 'pet-friendly') return '100% Pet-Safe Houseplants';
    if (catKey === 'low-light') return 'Low-Light Tolerant Plants';
    if (catKey.includes(':')) {
      const [cat, sub] = catKey.split(':');
      const subLabels = {
        'air-purifying': 'Air Purifying',
        'low-light': 'Low Light',
        'pet-friendly': 'Pet Safe',
        'bestseller': 'Bestsellers',
        'trending': 'Trending & Top Rated',
        'easy-care': 'Easy Care & Low Maintenance',
        'Bedroom': 'Bedroom Plants',
        'Living Room': 'Living Room Plants',
        'Balcony': 'Balcony & Terrace',
        'Workspace': 'Office & Desk Plants',
        'Desk': 'Desk Plants',
        'Essential': 'Potting Mix & Essentials'
      };
      return `${cat} — ${subLabels[sub] || sub}`;
    }
    return catKey;
  };

  // Filter & Sort Logic
  const filteredProducts = PRODUCTS.filter(p => {
    if (!activeCategory || activeCategory === 'all') return true;

    if (activeCategory === 'bestsellers') return p.tag === 'Bestseller' || p.rating >= 4.8;
    if (activeCategory === 'air-purifying') return p.airPurifying;
    if (activeCategory === 'pet-friendly') return p.petFriendly;
    if (activeCategory === 'low-light') return p.light?.toLowerCase().includes('low');

    if (activeCategory.includes(':')) {
      const [cat, sub] = activeCategory.split(':');
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

    if (p.category !== activeCategory) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount; // popular
  });

  return (
    <div className="app-container">
      {/* 1. Main Header Navigation */}
      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* 2. Hero Slideshow Carousel */}
      <HeroBanner onExploreCategory={(cat) => setActiveCategory(cat)} />

      {/* 3. Circular Visual Category Bar */}
      <CategoryCircles onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* 4. Section: From Our Farm to Your Home */}
      <FarmToHome />

      {/* 5. Products Showcase */}
      <section className="products-section" id="products">
        <div className="container">

          <div className="section-header">
            <div className="section-title-group">
              <h2>
                {getCategoryTitle(activeCategory)}
              </h2>
              <p>Showing {filteredProducts.length} healthy plants, seeds & planters ready to ship</p>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #CADFD4',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#0A4C36',
                  background: '#FFFFFF'
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated ★</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="filter-bar">
            <div className="filter-chips">
              <button
                className={`chip-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Plants
              </button>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button
                  key={c.id}
                  className={`chip-btn ${activeCategory === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
              <button
                className={`chip-btn ${activeCategory === 'pet-friendly' ? 'active' : ''}`}
                onClick={() => setActiveCategory('pet-friendly')}
              >
                🐾 100% Pet Safe
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                onAddToCart={(p, pot) => handleAddToCart(p, pot)}
                isWishlisted={wishlistItems.some(i => i.id === product.id)}
                onToggleWishlist={(p) => handleToggleWishlist(p)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 6. Section: Transform Your Home (Shop by Room) */}
      <TransformHome onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* 7. Section: Green Gifting, Made Easy */}
      <GreenGifting onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* 8. Section: Our Story (Brand Vision) */}
      <OurStory />

      {/* 9. Section: Plant Care, Simplified (Blog & Guides) */}
      <PlantCareSimplified />

      {/* 10. Why Choose AgriMart Advantage */}
      <WhyChooseUs />

      {/* 11. Customer Photo Reviews */}
      <CustomerReviews />

      {/* 12. FAQ & Plant Doctor Hotline */}
      <PlantDoctorFAQ />

      {/* 13. Footer */}
      <Footer onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* 14. Floating WhatsApp Chat Widget */}
      <FloatingWhatsApp />

      {/* Modals & Slide-out Drawers */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlistItems.some(i => i.id === quickViewProduct.id)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(summary) => {
          setCheckoutSummary(summary);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveWishlist={(item) => setWishlistItems(wishlistItems.filter(i => i.id !== item.id))}
        onMoveToCart={(item) => handleAddToCart(item)}
      />

      <PlantQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onAddToCart={handleAddToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        summary={checkoutSummary}
        onOrderSuccess={() => setCartItems([])}
      />
    </div>
  );
}
