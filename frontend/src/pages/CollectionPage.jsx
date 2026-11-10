import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { 
  ChevronRight, 
  Home, 
  Sprout, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { categoryToSlug, getCategoryMeta } from '../utils/categoryUtils';

export default function CollectionPage({
  categorySlug = 'all',
  products = [],
  categories = [],
  onNavigate,
  onQuickView,
  onAddToCart,
  wishlistItems = [],
  onToggleWishlist,
  user,
  onOpenAuth
}) {
  const [sortBy, setSortBy] = useState('popular');
  const [subFilter, setSubFilter] = useState('all');

  // 1. Resolve Category Metadata first
  const categoryMeta = useMemo(() => {
    return getCategoryMeta(categorySlug, categories);
  }, [categorySlug, categories]);

  // 2. Automatically reset sub-filter and canonicalize legacy/alias URLs (e.g. /collections/flowers -> /collections/flowering-plants)
  useEffect(() => {
    setSubFilter('all');
    if (categorySlug === 'flowers' || (categoryMeta && categoryMeta.slug && categorySlug !== categoryMeta.slug)) {
      window.history.replaceState(null, '', /collections/);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categorySlug, categoryMeta?.slug]);

  // 2. Prepare Navigation Categories Tabs dynamically from database categories
  const navTabs = useMemo(() => {
    const list = [{ id: 'all', name: 'All Products', slug: 'all' }];
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        const cName = typeof c === 'string' ? c : (c.name || c.id || '');
        if (!cName) return;
        const slug = categoryToSlug(cName);
        if (slug === 'all') return;
        if (!list.some(item => item.slug === slug)) {
          list.push({
            id: typeof c === 'object' && c.id ? c.id : cName,
            name: cName,
            slug
          });
        }
      });
    }
    return list;
  }, [categories]);

  // 3. Filter products matching this category and any active sub-filters
  const filteredProducts = useMemo(() => {
    // Primary category filter
    let items = products.filter(p => categoryMeta.filterFn(p));

    // Secondary sub-filter (chips)
    if (subFilter !== 'all') {
      items = items.filter(p => {
        if (subFilter === 'bestseller') return p.tag === 'Bestseller' || (p.rating && p.rating >= 4.8);
        if (subFilter === 'air-purifying') return Boolean(p.airPurifying);
        if (subFilter === 'pet-friendly') return Boolean(p.petFriendly);
        if (subFilter === 'low-light') return p.light && p.light.toLowerCase().includes('low');
        if (subFilter === 'easy-care') {
          return (
            (p.maintenance && /easy|low|zero/i.test(p.maintenance)) ||
            p.category === 'Pots & Planters'
          );
        }
        return true;
      });
    }

    // Sort order
    return [...items].sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
    });
  }, [products, categoryMeta, subFilter, sortBy]);

  const SUB_FILTERS = [
    { id: 'all', label: 'All Items' },
    { id: 'bestseller', label: '★ Bestsellers' },
    { id: 'air-purifying', label: '🍃 Air Purifying' },
    { id: 'low-light', label: '🌙 Low Light' },
    { id: 'pet-friendly', label: '🐾 Pet Friendly' },
    { id: 'easy-care', label: '🪴 Easy Care' }
  ];

  return (
    <div className="collection-page-wrapper">
      {/* 1. Breadcrumbs */}
      <div className="collection-breadcrumbs-bar">
        <div className="container">
          <nav className="collection-breadcrumbs" aria-label="Breadcrumb">
            <button 
              type="button" 
              className="breadcrumb-item-btn" 
              onClick={() => onNavigate('/')}
            >
              <Home size={14} style={{ marginRight: '4px' }} />
              Home
            </button>
            <ChevronRight size={14} className="breadcrumb-chevron" />
            
            <button 
              type="button" 
              className="breadcrumb-item-btn"
              onClick={() => onNavigate('/collections/all')}
            >
              Collections
            </button>
            <ChevronRight size={14} className="breadcrumb-chevron" />

            <span className="breadcrumb-current-item" aria-current="page">
              {categoryMeta.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Collection Banner */}
      <section className="collection-banner-section">
        <div className="container">
          <div className="collection-banner-card">
            <div className="collection-banner-text">
              <span className="collection-badge-pill">{categoryMeta.badge}</span>
              <h1 className="collection-main-title">{categoryMeta.title}</h1>
              <p className="collection-main-desc">{categoryMeta.subtitle}</p>

              {/* Trust Indicators */}
              <div className="collection-banner-highlights">
                <div className="banner-highlight-chip">
                  <Sprout size={16} className="highlight-icon" />
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Variety' : 'Varieties'} Available</span>
                </div>
                <div className="banner-highlight-chip">
                  <ShieldCheck size={16} className="highlight-icon" />
                  <span>7-Day Plant Guarantee</span>
                </div>
                <div className="banner-highlight-chip">
                  <Truck size={16} className="highlight-icon" />
                  <span>Pan-India Safe Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Switcher Tabs */}
      <section className="collection-categories-nav-section">
        <div className="container">
          <div className="collection-categories-scroll">
            {navTabs.map(tab => {
              const isActive = categoryMeta.slug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  className={`collection-cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate(`/collections/${tab.slug}`)}
                >
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Filter & Sort Toolbar */}
      <section className="collection-toolbar-section">
        <div className="container">
          <div className="collection-toolbar-container">
            {/* Sub-filter chips */}
            <div className="collection-subfilters">
              <span className="subfilters-label">
                <SlidersHorizontal size={14} />
                <span>Filter:</span>
              </span>
              <div className="subfilter-chips-list">
                {SUB_FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`subfilter-chip ${subFilter === f.id ? 'active' : ''}`}
                    onClick={() => setSubFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="collection-sort-wrapper">
              <span className="sort-label">
                <ArrowUpDown size={14} />
                <span>Sort by:</span>
              </span>
              <select
                className="collection-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated ★</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Products Grid Showcase */}
      <section className="collection-products-section">
        <div className="container">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlistItems.some(i => i.id === product.id)}
                  onToggleWishlist={onToggleWishlist}
                  user={user}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          ) : (
            <div className="collection-empty-state">
              <div className="empty-state-icon">
                <Sprout size={48} />
              </div>
              <h3 className="empty-state-title">No plants currently matching this filter</h3>
              <p className="empty-state-desc">
                We couldn't find any varieties in <strong>{categoryMeta.name}</strong> matching your selected filter.
                Try choosing another filter or browse our complete nursery catalog.
              </p>
              <div className="empty-state-actions">
                {subFilter !== 'all' && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setSubFilter('all')}
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onNavigate('/collections/all')}
                >
                  Browse All Collections
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Ugaoo-Inspired Botanical Trust Section */}
      <section className="collection-trust-section">
        <div className="container">
          <div className="collection-trust-grid">
            <div className="collection-trust-card">
              <div className="trust-icon-box">🌿</div>
              <h4>100% Farm Fresh Plants</h4>
              <p>Nurtured by agricultural specialists at ITM University and packed directly from our nursery greenhouse.</p>
            </div>
            <div className="collection-trust-card">
              <div className="trust-icon-box">📦</div>
              <h4>5-Layer Secure Packaging</h4>
              <p>Special ventilated pots and shock-absorbing corrugated boxes ensure plants arrive pristine and undamaged.</p>
            </div>
            <div className="collection-trust-card">
              <div className="trust-icon-box">🔄</div>
              <h4>7-Day Free Replacement</h4>
              <p>Arrived transit-stressed? Just send a photo on WhatsApp and get a free instant nursery replacement.</p>
            </div>
            <div className="collection-trust-card">
              <div className="trust-icon-box">🚚</div>
              <h4>Free Pan-India Delivery</h4>
              <p>Free tracked courier shipping on all orders above ₹499 across 20,000+ Indian pincodes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

