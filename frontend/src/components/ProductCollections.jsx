import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, TrendingUp, Flame, Sprout, ArrowRight } from 'lucide-react';

export default function ProductCollections({
  products,
  onQuickView,
  onAddToCart,
  wishlistItems,
  onToggleWishlist,
  onViewAll,
  user,
  onOpenAuth
}) {
  const [activeTab, setActiveTab] = useState('bestsellers');

  // 1. Best Sellers (rating >= 4.9 or Bestseller tag)
  const bestSellers = products.filter(
    p => p.tag === 'Bestseller' || p.rating >= 4.9 || p.reviewsCount >= 1000
  );

  // 2. New Arrivals (Good Fortune, Air Purifier, Flowering Plants)
  const newArrivals = products.filter(
    p => p.tag === 'Good Fortune' || p.tag === 'Air Purifier' || p.category === 'Flowering Plants'
  );

  // 3. Trending Plants (Trending tag, Low Maintenance)
  const trendingPlants = products.filter(
    p => p.tag === 'Trending' || p.tag === 'Low Maintenance' || (p.category === 'Indoor Plants' && p.tag !== 'Bestseller')
  );

  // 4. Seeds & Gardening Essentials (Seeds, Plant Care, Pots & Planters)
  const essentials = products.filter(
    p => p.category === 'Seeds' || p.category === 'Plant Care' || p.category === 'Pots & Planters'
  );

  const collections = [
    {
      id: 'bestsellers',
      label: 'Best Sellers',
      icon: <Sparkles size={16} />,
      badge: 'Customer Favorites',
      title: 'Our All-Time Best Sellers',
      subtitle: 'Top-rated indoor & outdoor plants loved by over 15,000 plant parents across India.',
      items: bestSellers,
      viewAllCategory: 'bestsellers'
    },
    {
      id: 'trending',
      label: 'Trending Plants',
      icon: <Flame size={16} />,
      badge: 'Most Popular',
      title: 'Trending Botanical Stars',
      subtitle: 'Statement foliage plants that bring natural drama and elegance into modern interiors.',
      items: trendingPlants,
      viewAllCategory: 'Indoor Plants'
    },
    {
      id: 'new',
      label: 'New Arrivals',
      icon: <TrendingUp size={16} />,
      badge: 'Freshly Harvested',
      title: 'New Nursery Arrivals',
      subtitle: 'Freshly potted arrivals ready to brighten your desks, balconies, and bedrooms.',
      items: newArrivals,
      viewAllCategory: 'Flowering Plants'
    },
    {
      id: 'essentials',
      label: 'Seeds & Essentials',
      icon: <Sprout size={16} />,
      badge: 'Garden Care',
      title: 'Seeds & Gardening Essentials',
      subtitle: 'Non-GMO heirloom seeds, bio-enriched organic soil, and self-watering planters.',
      items: essentials,
      viewAllCategory: 'Plant Care'
    }
  ];

  const currentCollection = collections.find(c => c.id === activeTab) || collections[0];

  return (
    <section className="ugaoo-collections-section">
      <div className="container">
        {/* Section Header */}
        <div className="ugaoo-collections-header">
          <div className="ugaoo-collections-header-text">
            <span className="ugaoo-badge-pill">{currentCollection.badge}</span>
            <h2 className="ugaoo-collections-title">{currentCollection.title}</h2>
            <p className="ugaoo-collections-sub">{currentCollection.subtitle}</p>
          </div>

          {/* Collection Tab Switcher */}
          <div className="ugaoo-tab-pills" role="tablist">
            {collections.map(col => (
              <button
                key={col.id}
                role="tab"
                aria-selected={activeTab === col.id}
                className={`ugaoo-tab-pill ${activeTab === col.id ? 'active' : ''}`}
                onClick={() => setActiveTab(col.id)}
              >
                {col.icon}
                <span>{col.label}</span>
                <span className="ugaoo-tab-count">{col.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="ugaoo-products-grid">
          {currentCollection.items.map(product => (
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

        {/* View All Collection Button */}
        <div className="ugaoo-collection-footer">
          <button
            className="ugaoo-view-all-btn"
            onClick={() => onViewAll(currentCollection.viewAllCategory)}
          >
            <span>View All {currentCollection.label}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
