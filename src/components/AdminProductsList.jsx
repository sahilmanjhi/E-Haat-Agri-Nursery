import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  Layers,
  Sprout,
  ArrowUpDown,
  Tag,
  Sun,
  Droplets,
  Home,
  Check,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchAdminProducts,
  fetchCategories,
  deleteProduct,
  toggleProductStock
} from '../services/api';

export default function AdminProductsList({ onNavigate, onLogout }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'rating' | 'name'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Selection & Batch actions
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Modals & Popups
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Stock toggle loading tracking (product ID -> boolean)
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  useEffect(() => {
    document.title = 'Product Management | ITMU E-Haat Admin';
  }, []);

  // Load products & categories from database
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetchCategories(),
        fetchAdminProducts({
          category: selectedCategory,
          inStock: selectedStock,
          tag: selectedTag,
          search: searchQuery,
          sort: sortBy
        })
      ]);

      if (catsRes && Array.isArray(catsRes)) {
        setCategories(catsRes);
      }

      if (prodsRes && prodsRes.status === 'success') {
        setProducts(prodsRes.products || []);
      } else if (Array.isArray(prodsRes)) {
        setProducts(prodsRes);
      } else {
        setError(prodsRes?.message || 'Failed to load catalog products.');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Network connection error while communicating with backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch when server-side filter params change
  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStock, selectedTag, sortBy]);

  // Derived filter for client-side search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.name && p.name.toLowerCase().includes(q);
      const botMatch = p.botanicalName && p.botanicalName.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().includes(q);
      const descMatch = p.description && p.description.toLowerCase().includes(q);
      return nameMatch || botMatch || catMatch || descMatch;
    });
  }, [products, searchQuery]);

  // Telemetry KPIs from live products
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = total - inStock;
    const categoriesCount = new Set(products.map((p) => p.category)).size;
    return { total, inStock, outOfStock, categoriesCount };
  }, [products]);

  // 1-Click Stock Toggle Handler
  const handleToggleStock = async (product, e) => {
    if (e) e.stopPropagation();
    const prodId = product.rawId || product.id;
    const nextStock = !product.inStock;

    // Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: nextStock } : p))
    );
    setStockUpdatingId(prodId);

    try {
      const res = await toggleProductStock(prodId, nextStock);
      if (res && res.status === 'success') {
        showToast(
          `"${product.name}" marked as ${nextStock ? 'In Stock' : 'Out of Stock'}.`,
          'success'
        );
      } else {
        // Rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: !nextStock } : p))
        );
        showToast(res.message || 'Failed to update stock status.', 'error');
      }
    } catch {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: !nextStock } : p))
      );
      showToast('Error connecting to server.', 'error');
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Delete product handler
  const confirmDeleteProduct = async () => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);
    const prodId = deleteModalProduct.rawId || deleteModalProduct.id;
    const prodName = deleteModalProduct.name;

    try {
      const res = await deleteProduct(prodId);
      if (res && res.status === 'success') {
        setProducts((prev) => prev.filter((p) => p.id !== deleteModalProduct.id));
        setSelectedProductIds((prev) => prev.filter((id) => id !== deleteModalProduct.id));
        showToast(`Product "${prodName}" was permanently deleted.`, 'success');
      } else {
        showToast(res.message || 'Failed to delete product.', 'error');
      }
    } catch {
      showToast('Network error while deleting product.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalProduct(null);
    }
  };

  // Multi-select helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch toggle stock
  const handleBatchStockToggle = async (markInStock) => {
    if (selectedProductIds.length === 0) return;
    const count = selectedProductIds.length;
    showToast(`Updating stock for ${count} items...`, 'info');

    let successCount = 0;
    for (const id of selectedProductIds) {
      try {
        const res = await toggleProductStock(id, markInStock);
        if (res && res.status === 'success') successCount++;
      } catch (e) {
        console.error(e);
      }
    }

    setProducts((prev) =>
      prev.map((p) =>
        selectedProductIds.includes(p.id) ? { ...p, inStock: markInStock } : p
      )
    );
    setSelectedProductIds([]);
    showToast(`Updated ${successCount} products to ${markInStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStock('all');
    setSelectedTag('all');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedStock !== 'all' ||
    selectedTag !== 'all' ||
    sortBy !== 'newest';

  // Plant image fallback resolver
  const getProductImage = (img, name) => {
    if (img && (img.startsWith('http') || img.startsWith('/images/'))) return img;
    const lower = (name || '').toLowerCase();
    if (lower.includes('snake')) return '/images/plants/snake_plant.png';
    if (lower.includes('monstera')) return '/images/plants/monstera.png';
    if (lower.includes('zz')) return '/images/plants/zz_plant.png';
    if (lower.includes('lily')) return '/images/plants/peace_lily.png';
    if (lower.includes('palm') || lower.includes('areca')) return '/images/plants/areca_palm.jpg';
    if (lower.includes('jade') || lower.includes('money')) return '/images/plants/jade_plant.jpg';
    if (lower.includes('seed')) return '/images/plants/heirloom_seeds.jpg';
    return '/images/plants/snake_plant.png';
  };

  // Tag styling helper
  const getTagBadgeClass = (tag) => {
    if (!tag) return '';
    const lower = tag.toLowerCase();
    if (lower.includes('bestseller')) return 'itmu-badge-bestseller';
    if (lower.includes('trending')) return 'itmu-badge-trending';
    if (lower.includes('top rated')) return 'itmu-badge-toprated';
    if (lower.includes('new')) return 'itmu-badge-new';
    if (lower.includes('sale')) return 'itmu-badge-sale';
    return 'itmu-badge-generic';
  };

  return (
    <AdminLayout
      activeNav="products"
      onNavigate={onNavigate}
      onLogout={onLogout}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      headerActions={
        <button
          type="button"
          className="itmu-header-action-btn"
          onClick={() => onNavigate('/admin/products/create')}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      }
    >
      {/* Toast Alert */}
      {toast && (
        <div className={`itmu-toast itmu-toast--${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="itmu-breadcrumb-row">
        <button
          type="button"
          className="itmu-bc-link"
          onClick={() => onNavigate('/admin/dashboard')}
        >
          Dashboard
        </button>
        <span className="itmu-bc-slash">&gt;</span>
        <span className="itmu-bc-active">Product Management</span>
      </div>

      {/* Page Heading & Actions Banner */}
      <section className="itmu-products-header-card">
        <div className="itmu-products-header-info">
          <div className="itmu-products-title-group">
            <h1 className="itmu-page-title">Product Management</h1>
            <span className="itmu-products-count-pill">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Variety' : 'Varieties'}
            </span>
          </div>
          <p className="itmu-page-subtitle">
            Manage your nursery catalog, update botanical varieties, modify pricing, and configure live stock availability.
          </p>
        </div>

        <div className="itmu-products-header-buttons">
          <button
            type="button"
            className="itmu-btn-outline"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh database catalog"
          >
            <RefreshCw size={16} className={refreshing ? 'itmu-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="itmu-btn-primary"
            onClick={() => onNavigate('/admin/products/create')}
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </section>

      {/* KPI Telemetry Cards */}
      <section className="itmu-cards-grid" style={{ marginBottom: 24 }}>
        {/* 1. Total Catalog */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Package size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{stats.total}</span>
            <span className="itmu-stat-title">Total Products</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>● Synced with Database</span>
            </div>
          </div>
        </div>

        {/* 2. In Stock */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <CheckCircle2 size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{stats.inStock}</span>
            <span className="itmu-stat-title">In Stock</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>
                {stats.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 100}% Ready to Ship
              </span>
            </div>
          </div>
        </div>

        {/* 3. Out of Stock / Low Stock */}
        <div className="itmu-stat-card">
          <div
            className={`itmu-stat-icon-circle ${
              stats.outOfStock > 0
                ? 'itmu-stat-icon-circle--red'
                : 'itmu-stat-icon-circle--green'
            }`}
          >
            <AlertTriangle
              size={20}
              color={stats.outOfStock > 0 ? '#DC2626' : '#146B3A'}
            />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{stats.outOfStock}</span>
            <span className="itmu-stat-title">Out of Stock</span>
            <div
              className={`itmu-stat-trend ${
                stats.outOfStock > 0 ? 'itmu-stat-trend--red' : 'itmu-stat-trend--green'
              }`}
            >
              <span>{stats.outOfStock > 0 ? '⚠ Needs Replenishment' : '✓ All Items Available'}</span>
            </div>
          </div>
        </div>

        {/* 4. Active Categories */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Layers size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">
              {categories.length > 0 ? categories.length : stats.categoriesCount}
            </span>
            <span className="itmu-stat-title">Active Categories</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>● Nursery Departments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Control Toolbar */}
      <section className="itmu-panel itmu-filter-panel" style={{ marginBottom: 20 }}>
        <div className="itmu-filter-toolbar">
          {/* Search Input Box */}
          <div className="itmu-filter-search-box">
            <Search size={18} className="itmu-filter-search-icon" />
            <input
              type="text"
              placeholder="Search by name, botanical name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="itmu-filter-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="itmu-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="itmu-select-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="itmu-select-input"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <ChevronDown size={14} className="itmu-select-chevron" />
          </div>

          {/* Stock Status Dropdown */}
          <div className="itmu-select-wrap">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="itmu-select-input"
            >
              <option value="all">Stock: All</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock Only</option>
            </select>
            <ChevronDown size={14} className="itmu-select-chevron" />
          </div>

          {/* Badge Tag Dropdown */}
          <div className="itmu-select-wrap">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="itmu-select-input"
            >
              <option value="all">Tags: All</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Trending">Trending</option>
              <option value="Top Rated">Top Rated</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Sale">Sale</option>
            </select>
            <ChevronDown size={14} className="itmu-select-chevron" />
          </div>

          {/* Sort By Dropdown */}
          <div className="itmu-select-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="itmu-select-input"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: Highest First</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name: A to Z</option>
            </select>
            <ChevronDown size={14} className="itmu-select-chevron" />
          </div>

          {/* View Mode Toggle */}
          <div className="itmu-view-mode-toggle">
            <button
              type="button"
              className={`itmu-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListIcon size={18} />
            </button>
            <button
              type="button"
              className={`itmu-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="itmu-btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Batch Actions Bar (visible when items selected) */}
        {selectedProductIds.length > 0 && (
          <div className="itmu-batch-bar">
            <div className="itmu-batch-info">
              <span className="itmu-batch-badge">{selectedProductIds.length}</span>
              <span>products selected</span>
            </div>
            <div className="itmu-batch-actions">
              <button
                type="button"
                className="itmu-btn-batch"
                onClick={() => handleBatchStockToggle(true)}
              >
                <CheckCircle2 size={16} />
                <span>Mark In Stock</span>
              </button>
              <button
                type="button"
                className="itmu-btn-batch"
                onClick={() => handleBatchStockToggle(false)}
              >
                <AlertTriangle size={16} />
                <span>Mark Out of Stock</span>
              </button>
              <button
                type="button"
                className="itmu-btn-batch-clear"
                onClick={() => setSelectedProductIds([])}
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Loading Screen */}
      {loading ? (
        <div className="itmu-panel itmu-loading-box">
          <div className="itmu-admin-spinner" style={{ width: 36, height: 36 }} />
          <p style={{ marginTop: 14, color: '#146B3A', fontWeight: 600 }}>
            Fetching catalog products from database...
          </p>
        </div>
      ) : error ? (
        <div className="itmu-panel itmu-error-box">
          <AlertTriangle size={36} color="#DC2626" />
          <h3 style={{ margin: '12px 0 6px', color: '#991B1B' }}>Failed to Load Catalog</h3>
          <p style={{ color: '#64748B', maxWidth: 480, margin: '0 auto 16px' }}>{error}</p>
          <button type="button" className="itmu-btn-primary" onClick={() => loadData()}>
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="itmu-panel itmu-empty-box">
          <div className="itmu-empty-icon-circle">
            <Sprout size={36} color="#146B3A" />
          </div>
          <h3 style={{ margin: '14px 0 6px', color: '#172B24' }}>No Products Found</h3>
          <p style={{ color: '#64748B', maxWidth: 460, margin: '0 auto 18px' }}>
            {hasActiveFilters
              ? 'No products matched your active search and filter criteria. Try adjusting or resetting filters.'
              : 'Your nursery product catalog is currently empty. Click "Add New Product" to populate your inventory.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {hasActiveFilters && (
              <button
                type="button"
                className="itmu-btn-outline"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            )}
            <button
              type="button"
              className="itmu-btn-primary"
              onClick={() => onNavigate('/admin/products/create')}
            >
              <Plus size={16} />
              <span>Add First Product</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= TABLE LIST VIEW ================= */
        <div className="itmu-panel itmu-table-panel">
          <div className="itmu-table-responsive">
            <table className="itmu-data-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="itmu-checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price & MRP</th>
                  <th>Stock Availability</th>
                  <th>Rating</th>
                  <th>Care / Room</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isUpdatingStock = stockUpdatingId === (p.rawId || p.id);
                  const imgUrl = getProductImage(p.image, p.name);

                  return (
                    <tr
                      key={p.id}
                      className={isSelected ? 'itmu-row-selected' : ''}
                      onClick={() => onNavigate(`/admin/products/edit/${p.rawId || p.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Checkbox */}
                      <td
                        style={{ textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="itmu-checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(p.id, e)}
                        />
                      </td>

                      {/* Product Info */}
                      <td>
                        <div className="itmu-table-product-cell">
                          <div className="itmu-table-product-thumb-wrap">
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="itmu-table-product-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/plants/snake_plant.png';
                              }}
                            />
                          </div>
                          <div className="itmu-table-product-meta">
                            <div className="itmu-table-product-title-row">
                              <span className="itmu-table-product-name">{p.name}</span>
                              {p.tag && (
                                <span className={`itmu-badge ${getTagBadgeClass(p.tag)}`}>
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            {p.botanicalName ? (
                              <span className="itmu-table-product-botanical">
                                <em>{p.botanicalName}</em>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="itmu-category-chip">{p.category || 'Indoor Plants'}</span>
                      </td>

                      {/* Price & MRP */}
                      <td>
                        <div className="itmu-price-cell">
                          <strong className="itmu-price-current">
                            ₹ {Number(p.price).toLocaleString('en-IN')}
                          </strong>
                          {p.originalPrice && Number(p.originalPrice) > Number(p.price) ? (
                            <div className="itmu-price-orig-wrap">
                              <span className="itmu-price-original">
                                ₹ {Number(p.originalPrice).toLocaleString('en-IN')}
                              </span>
                              {p.discount ? (
                                <span className="itmu-discount-tag">
                                  {p.discount}% OFF
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Stock Toggle */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="itmu-stock-toggle-cell">
                          <button
                            type="button"
                            className={`itmu-stock-switch ${p.inStock ? 'itmu-stock-switch--on' : 'itmu-stock-switch--off'}`}
                            onClick={(e) => handleToggleStock(p, e)}
                            disabled={isUpdatingStock}
                            title={`Click to mark ${p.inStock ? 'Out of Stock' : 'In Stock'}`}
                          >
                            <span className="itmu-stock-switch-knob">
                              {isUpdatingStock ? (
                                <span className="itmu-micro-spinner" />
                              ) : p.inStock ? (
                                <Check size={12} color="#064E35" strokeWidth={3} />
                              ) : (
                                <X size={12} color="#DC2626" strokeWidth={3} />
                              )}
                            </span>
                          </button>
                          <span
                            className={`itmu-stock-status-label ${p.inStock ? 'itmu-text-green' : 'itmu-text-red'}`}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td>
                        <div className="itmu-rating-cell">
                          <span className="itmu-star-icon">★</span>
                          <strong>{p.rating ? Number(p.rating).toFixed(1) : '5.0'}</strong>
                          <span className="itmu-reviews-count">
                            ({p.reviewsCount || 0})
                          </span>
                        </div>
                      </td>

                      {/* Care & Placement */}
                      <td>
                        <div className="itmu-care-tags">
                          {p.light && (
                            <span className="itmu-mini-pill" title={`Sunlight: ${p.light}`}>
                              <Sun size={12} />
                              <span className="itmu-mini-pill-text">{p.light.split(' ')[0]}</span>
                            </span>
                          )}
                          {p.room && (
                            <span className="itmu-mini-pill" title={`Room: ${p.room}`}>
                              <Home size={12} />
                              <span className="itmu-mini-pill-text">{p.room}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="itmu-row-actions">
                          {/* Quick Preview */}
                          <button
                            type="button"
                            className="itmu-action-btn-circle"
                            onClick={() => setPreviewProduct(p)}
                            title="Quick Storefront Preview"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            className="itmu-action-btn-circle itmu-action-btn-circle--edit"
                            onClick={() => onNavigate(`/admin/products/edit/${p.rawId || p.id}`)}
                            title="Edit Product Details"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="itmu-action-btn-circle itmu-action-btn-circle--delete"
                            onClick={() => setDeleteModalProduct(p)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="itmu-table-footer">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <div className="itmu-table-footer-legend">
              <span className="itmu-legend-dot itmu-legend-dot--darkgreen" />
              <span>Interactive 1-Click Stock Toggle Enabled</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= GRID CARDS VIEW ================= */
        <div className="itmu-products-grid-view">
          {filteredProducts.map((p) => {
            const imgUrl = getProductImage(p.image, p.name);
            const isUpdatingStock = stockUpdatingId === (p.rawId || p.id);

            return (
              <div key={p.id} className="itmu-product-grid-card">
                <div className="itmu-grid-card-media">
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="itmu-grid-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/plants/snake_plant.png';
                    }}
                  />
                  {p.tag && (
                    <span className={`itmu-grid-badge ${getTagBadgeClass(p.tag)}`}>
                      {p.tag}
                    </span>
                  )}
                  <span
                    className={`itmu-grid-stock-pill ${p.inStock ? 'itmu-grid-stock-pill--in' : 'itmu-grid-stock-pill--out'}`}
                  >
                    {p.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="itmu-grid-card-body">
                  <div className="itmu-grid-card-cat">{p.category || 'Indoor Plants'}</div>
                  <h4 className="itmu-grid-card-title">{p.name}</h4>
                  {p.botanicalName ? (
                    <p className="itmu-grid-card-botanical">
                      <em>{p.botanicalName}</em>
                    </p>
                  ) : null}

                  <div className="itmu-grid-card-price-row">
                    <strong className="itmu-grid-price">
                      ₹ {Number(p.price).toLocaleString('en-IN')}
                    </strong>
                    {p.originalPrice && Number(p.originalPrice) > Number(p.price) ? (
                      <span className="itmu-grid-orig-price">
                        ₹ {Number(p.originalPrice).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                    {p.discount ? (
                      <span className="itmu-discount-tag">{p.discount}% OFF</span>
                    ) : null}
                  </div>

                  <div className="itmu-grid-card-specs">
                    {p.light && <span>☀️ {p.light.split(' ')[0]}</span>}
                    {p.water && <span>💧 {p.water.split(' ')[0]}</span>}
                    {p.room && <span>🏠 {p.room}</span>}
                  </div>

                  <div className="itmu-grid-card-footer">
                    <button
                      type="button"
                      className={`itmu-btn-toggle-stock ${p.inStock ? 'in' : 'out'}`}
                      onClick={(e) => handleToggleStock(p, e)}
                      disabled={isUpdatingStock}
                    >
                      {isUpdatingStock ? 'Updating...' : p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>

                    <div className="itmu-grid-actions-right">
                      <button
                        type="button"
                        className="itmu-action-btn-circle itmu-action-btn-circle--edit"
                        onClick={() => onNavigate(`/admin/products/edit/${p.rawId || p.id}`)}
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="itmu-action-btn-circle itmu-action-btn-circle--delete"
                        onClick={() => setDeleteModalProduct(p)}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteModalProduct && (
        <div className="itmu-modal-backdrop" onClick={() => setDeleteModalProduct(null)}>
          <div className="itmu-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="itmu-confirm-modal-icon">
              <Trash2 size={28} color="#DC2626" />
            </div>

            <h3 className="itmu-confirm-modal-title">Delete Product</h3>
            <p className="itmu-confirm-modal-desc">
              Are you sure you want to permanently delete{' '}
              <strong>"{deleteModalProduct.name}"</strong>? This will remove the botanical record and visual assets from your store catalog.
            </p>

            <div className="itmu-confirm-modal-preview">
              <img
                src={getProductImage(deleteModalProduct.image, deleteModalProduct.name)}
                alt={deleteModalProduct.name}
                className="itmu-confirm-thumb"
              />
              <div>
                <strong>{deleteModalProduct.name}</strong>
                <p>₹ {Number(deleteModalProduct.price).toLocaleString('en-IN')} • {deleteModalProduct.category}</p>
              </div>
            </div>

            <div className="itmu-confirm-modal-buttons">
              <button
                type="button"
                className="itmu-btn-outline"
                onClick={() => setDeleteModalProduct(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="itmu-btn-danger"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= QUICK PREVIEW MODAL ================= */}
      {previewProduct && (
        <div className="itmu-modal-backdrop" onClick={() => setPreviewProduct(null)}>
          <div className="itmu-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="itmu-preview-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sprout size={20} color="#146B3A" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172B24' }}>
                  Live Storefront Preview
                </h3>
              </div>
              <button
                type="button"
                className="itmu-modal-close-btn"
                onClick={() => setPreviewProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="itmu-preview-modal-body">
              <div className="itmu-preview-card-replica">
                <div className="itmu-preview-replica-imgbox">
                  <img
                    src={getProductImage(previewProduct.image, previewProduct.name)}
                    alt={previewProduct.name}
                    className="itmu-preview-replica-img"
                  />
                  {previewProduct.tag && (
                    <span className={`itmu-preview-replica-tag ${getTagBadgeClass(previewProduct.tag)}`}>
                      {previewProduct.tag}
                    </span>
                  )}
                  <span
                    className={`itmu-preview-stock-pill ${previewProduct.inStock ? 'in' : 'out'}`}
                  >
                    {previewProduct.inStock ? '● In Stock (Ships Today)' : '● Currently Out of Stock'}
                  </span>
                </div>

                <div className="itmu-preview-replica-content">
                  <span className="itmu-preview-cat-badge">{previewProduct.category}</span>
                  <h3 className="itmu-preview-title">{previewProduct.name}</h3>
                  {previewProduct.botanicalName ? (
                    <p className="itmu-preview-botanical">
                      <em>{previewProduct.botanicalName}</em>
                    </p>
                  ) : null}

                  <div className="itmu-preview-price-row">
                    <span className="itmu-preview-price">
                      ₹ {Number(previewProduct.price).toLocaleString('en-IN')}
                    </span>
                    {previewProduct.originalPrice && Number(previewProduct.originalPrice) > Number(previewProduct.price) ? (
                      <span className="itmu-preview-orig">
                        ₹ {Number(previewProduct.originalPrice).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                    {previewProduct.discount ? (
                      <span className="itmu-discount-tag">{previewProduct.discount}% OFF</span>
                    ) : null}
                  </div>

                  <div className="itmu-preview-rating-row">
                    <span style={{ color: '#F59E0B' }}>★★★★★</span>
                    <span>{previewProduct.rating || 5.0} ({previewProduct.reviewsCount || 0} reviews)</span>
                  </div>

                  {previewProduct.description && (
                    <p className="itmu-preview-desc">{previewProduct.description}</p>
                  )}

                  <div className="itmu-preview-care-grid">
                    <div>
                      <Sun size={14} color="#146B3A" />
                      <span>{previewProduct.light || 'Bright Indirect'}</span>
                    </div>
                    <div>
                      <Droplets size={14} color="#146B3A" />
                      <span>{previewProduct.water || 'Once a week'}</span>
                    </div>
                    <div>
                      <Home size={14} color="#146B3A" />
                      <span>{previewProduct.room || 'Living Room'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="itmu-preview-modal-foot">
              <button
                type="button"
                className="itmu-btn-outline"
                onClick={() => setPreviewProduct(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="itmu-btn-primary"
                onClick={() => {
                  const id = previewProduct.rawId || previewProduct.id;
                  setPreviewProduct(null);
                  onNavigate(`/admin/products/edit/${id}`);
                }}
              >
                <Edit2 size={16} />
                <span>Edit This Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
