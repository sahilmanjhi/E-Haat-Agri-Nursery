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

  // Filter & Sort Logic
  const filteredProducts = PRODUCTS.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) {
      // Special shortcuts
      if (activeCategory === 'low-light' && !p.light.toLowerCase().includes('low')) return false;
      if (activeCategory === 'pet-friendly' && !p.petFriendly) return false;
      if (activeCategory !== 'low-light' && activeCategory !== 'pet-friendly') return false;
    }
    if (selectedRoom !== 'all' && p.room !== selectedRoom) return false;
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
                {activeCategory === 'all' ? 'All Bestselling Nursery Collection' : activeCategory}
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
