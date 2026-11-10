import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryCircles from './components/CategoryCircles';
import ProductCard from './components/ProductCard';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PlantQuizModal from './components/PlantQuizModal';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import OrdersModal from './components/OrdersModal';
import WhyChooseUs from './components/WhyChooseUs';
import CustomerReviews from './components/CustomerReviews';
import PlantDoctorFAQ from './components/PlantDoctorFAQ';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsList from './pages/AdminProductsList';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategoriesList from './pages/AdminCategoriesList';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';


// 5 Main Landing Sections 
import FarmToHome from './components/FarmToHome';
import TransformHome from './components/TransformHome';
import GreenGifting from './components/GreenGifting';
import OurStory from './components/OurStory';
import PlantCareSimplified from './components/PlantCareSimplified';
import PromoBanner from './components/PromoBanner';
import ProductCollections from './components/ProductCollections';
import CollectionPage from './pages/CollectionPage';
import { categoryToSlug } from './utils/categoryUtils';

import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from './data/products';
import { fetchProducts, fetchCategories, checkBackendHealth, fetchCurrentUser, logoutUser, fetchCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from './services/api';

export default function App() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [backendStatus, setBackendStatus] = useState({ connected: false, message: 'Connecting to Django...' });
  const [isLoading, setIsLoading] = useState(true);

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

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Path-based routing for Admin portal
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  const handleOpenOrders = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsOrdersOpen(true);
    }
  };

  // Fetch live products & categories from Django backend with auto-sync
  const loadData = async () => {
    try {
      const health = await checkBackendHealth();
      setBackendStatus(health);

      const [cats, prods, cart] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchCart()
      ]);
      if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      if (Array.isArray(prods)) setProducts(prods);
      if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
        setCartItems(cart.items.map(item => ({
          ...item,
          cartItemId: item.id,
          id: item.product_id || item.product,
        })));
      }
    } catch (err) {
      console.warn('Backend load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial catalog load on mount (no redundant re-fetching on route navigation)
  useEffect(() => {
    loadData();
  }, []);

  // Real-time synchronization listeners:
  // 1. Same-window admin actions (ehaat_data_changed event)
  // 2. Cross-tab BroadcastChannel instant sync (ehaat_sync channel)
  // 3. Cross-tab localStorage fallback (storage event)
  // 4. Tab focus when window regains visibility
  // 5. Active heartbeat polling (every 4 seconds when tab is active)
  useEffect(() => {
    let debounceTimer = null;
    const triggerSync = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadData();
      }, 150);
    };

    const handleVisibilitySync = () => {
      if (!document.hidden) {
        triggerSync();
      }
    };

    // BroadcastChannel for instant zero-latency cross-tab sync
    let channel = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('ehaat_sync');
        channel.onmessage = (msg) => {
          if (msg && msg.data && msg.data.type === 'DATA_CHANGED') {
            triggerSync();
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (!e.key || e.key === 'ehaat_data_sync_timestamp') {
        triggerSync();
      }
    };

    window.addEventListener('ehaat_data_changed', triggerSync);
    window.addEventListener('focus', handleVisibilitySync);
    window.addEventListener('storage', handleStorageChange);

    // 4-second active heartbeat polling when window is focused
    const syncInterval = setInterval(() => {
      if (!document.hidden) {
        triggerSync();
      }
    }, 4000);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        try { channel.close(); } catch (e) {}
      }
      window.removeEventListener('ehaat_data_changed', triggerSync);
      window.removeEventListener('focus', handleVisibilitySync);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  // Check if user is already logged in (session cookie)
  useEffect(() => {
    fetchCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // Cart operations
  const handleAddToCart = async (product, pot = null, size = null, qty = 1) => {
    const prodId = product.rawId || product.id;
    if (prodId) {
      try {
        const res = await addToCart(prodId, qty);
        if (res && res.status === 'error') {
          alert(res.message || 'Cannot add item to cart: insufficient stock.');
          return;
        }
      } catch (e) {}
    }

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
    if (item.cartItemId) {
      updateCartItemQuantity(item.cartItemId, newQty).catch(() => {});
    }
    if (newQty <= 0) {
      setCartItems(cartItems.filter(i => i !== item));
    } else {
      setCartItems(cartItems.map(i => i === item ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveCartItem = (item) => {
    if (item.cartItemId) {
      removeCartItem(item.cartItemId).catch(() => {});
    }
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
  const filteredProducts = products.filter(p => {
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

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated route for Admin Login Page
  if (currentPath === '/admin/login' || currentPath === '/admin/login/') {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          navigate('/admin/dashboard');
        }}
      />
    );
  }

  // Route for Admin Dashboard Overview
  if (currentPath === '/admin/dashboard' || currentPath === '/admin/dashboard/') {
    return (
      <AdminDashboard
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Product Management List (/admin/products)
  if (currentPath === '/admin/products' || currentPath === '/admin/products/') {
    return (
      <AdminProductsList
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Category Management (/admin/categories)
  if (currentPath.startsWith('/admin/categories')) {
    return (
      <AdminCategoriesList
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Inventory Management (/admin/inventory)
  if (currentPath === '/admin/inventory' || currentPath.startsWith('/admin/inventory')) {
    return (
      <AdminInventory
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Order Management (/admin/orders)
  if (currentPath === '/admin/orders' || currentPath.startsWith('/admin/orders')) {
    return (
      <AdminOrders
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Customer Management (/admin/customers)
  if (currentPath === '/admin/customers' || currentPath.startsWith('/admin/customers')) {
    return (
      <AdminCustomers
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }



  // Route for Add New Product (/admin/products/create)
  if (currentPath === '/admin/products/create' || currentPath === '/admin/products/create/') {
    return (
      <AdminProductForm
        productId={null}
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route for Edit Product (/admin/products/edit/:id or /admin/products/:id/edit)
  const editMatch = currentPath.match(/^\/admin\/products\/(?:edit\/(\d+)|(\d+)\/edit)\/?$/);
  if (editMatch) {
    const editId = editMatch[1] || editMatch[2];
    return (
      <AdminProductForm
        productId={editId}
        onNavigate={navigate}
        onLogout={() => {
          navigate('/admin/login');
        }}
      />
    );
  }

  // Route detection for dedicated Category Collections (/collections or /collections/:slug)
  const collectionMatch = currentPath.match(/^\/collections(?:\/([^\/?#]+))?\/?$/);
  const isCollectionRoute = Boolean(collectionMatch);
  const collectionSlug = collectionMatch ? (collectionMatch[1] || 'all') : null;

  return (
    <div className="app-container">

      {/* 1. Main Header Navigation */}
      <Header
        activeCategory={isCollectionRoute ? collectionSlug : activeCategory}
        setActiveCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenOrders={handleOpenOrders}
        onNavigate={navigate}
        currentPath={currentPath}
        categories={categories}
      />

      {isCollectionRoute ? (
        <CollectionPage
          categorySlug={collectionSlug}
          products={products}
          categories={categories}
          onNavigate={navigate}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <>
          {/* 2. Ugaoo-Inspired Hero Section */}
      <HeroBanner onExploreCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} />

      {/* 3. Shop by Category (6 photo cards) */}
      <CategoryCircles categories={categories} onSelectCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} />

      {/* 4. Promotional Banners */}
      <PromoBanner onExploreCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} />

      {/* 5. Product Collections (Best Sellers, Trending Plants, New Arrivals, Seeds & Essentials) */}
      <ProductCollections
        products={products}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        wishlistItems={wishlistItems}
        onToggleWishlist={handleToggleWishlist}
        onViewAll={(cat) => navigate('/collections/' + categoryToSlug(cat))}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 6. Section: From Our Farm to Your Home */}
      <FarmToHome />

      {/* 7. Filterable Products Showcase - Only displayed when a category is actively filtered */}
      {activeCategory && activeCategory !== 'all' && (
        <section className="products-section" id="products">
          <div className="container">

            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  {getCategoryTitle(activeCategory)}
                </h2>
                <p>Showing {filteredProducts.length} healthy {filteredProducts.length === 1 ? 'variety' : 'varieties'} in this category</p>
              </div>

              {/* Sort Dropdown & Clear Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CADFD4',
                    background: '#EBF5F0',
                    color: '#0A4C36',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Clear Filter
                </button>

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
            </div>

            {/* Filter Chips Bar */}
            <div className="filter-bar">
              <div className="filter-chips">
                <button
                  className="chip-btn"
                  onClick={() => setActiveCategory('all')}
                >
                  ✕ Back to Home
                </button>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <button
                    key={c.id}
                    className={`chip-btn ${activeCategory === c.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(c.id)}
                  >
                    {c.icon || '🌿'} {c.name}
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
                  user={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 6. Section: Transform Your Home (Shop by Room) */}
      <TransformHome onSelectCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} />

      {/* 7. Section: Green Gifting, Made Easy */}
      <GreenGifting onSelectCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} />

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

        </>
      )}

      {/* 13. Footer */}
      <Footer onSelectCategory={(cat) => navigate('/collections/' + categoryToSlug(cat))} onOpenOrders={handleOpenOrders} />

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
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onProceedToCheckout={(summary) => {
          setCheckoutSummary(summary);
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveWishlist={(item) => setWishlistItems(wishlistItems.filter(i => i.id !== item.id))}
        onMoveToCart={(item) => handleAddToCart(item)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <PlantQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onAddToCart={handleAddToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutSummary(null);
        }}
        cartItems={cartItems}
        summary={checkoutSummary}
        onOrderSuccess={() => {
          setCartItems([]);
          setCheckoutSummary(null);
          clearCart().catch(() => {});
        }}
        user={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // If the user had initiated checkout before logging in, resume directly to checkout
          if (checkoutSummary) {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Order Tracking & History Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
