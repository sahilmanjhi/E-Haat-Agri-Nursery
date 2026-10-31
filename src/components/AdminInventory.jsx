import React, { useEffect, useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Package,
  Edit3,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  X,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchInventorySummary,
  updateInventoryStock,
  batchRestockInventory
} from '../services/api';

export default function AdminInventory({ onLogout, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Core inventory data
  const [metrics, setMetrics] = useState({
    total_products: 0,
    total_units: 0,
    in_stock_count: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    health_percentage: 100.0
  });
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'instock' | 'lowstock' | 'outofstock'
  const [sortBy, setSortBy] = useState('units-asc'); // 'units-asc' | 'units-desc' | 'name-asc' | 'price-desc'

  // Multi-select for Batch Restock
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchUnitsToAdd, setBatchUnitsToAdd] = useState(25);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // Urgent Restock Alerts Modal
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Inline editing state: { [productId]: { quantity: number, reorderLevel: number, saving: boolean } }
  const [inlineEdits, setInlineEdits] = useState({});

  // Set browser document title
  useEffect(() => {
    document.title = 'Inventory Management | ITMU E-Haat Admin';
  }, []);

  // Show auto-dismissing toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Load inventory summary from Django API
  const loadInventory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchInventorySummary();
      if (data && data.status === 'success') {
        setMetrics(data.metrics || {});
        setCategoryDistribution(data.category_distribution || []);
        setProducts(data.products || []);
        setLowStockAlerts(data.low_stock_alerts || []);
        if (isRefresh) {
          showToast('Inventory telemetry updated from live database!', 'success');
        }
      } else {
        setError(data?.message || 'Unable to load inventory data from server.');
      }
    } catch (err) {
      setError('Network communication failed with backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Quick adjust single product stock (e.g. +1, -1, +5, +25, or exact quantity)
  const handleQuickAdjust = async (product, delta = 0, newQuantity = null) => {
    const currentQty = inlineEdits[product.id]?.quantity ?? product.stockQuantity;
    const targetQty = newQuantity !== null ? Math.max(0, parseInt(newQuantity) || 0) : Math.max(0, currentQty + delta);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === product.id) {
          const inStock = targetQty > 0;
          const stockStatus = !inStock || targetQty <= 0 ? 'Out of Stock' : (targetQty <= p.reorderLevel ? 'Low Stock' : 'In Stock');
          return {
            ...p,
            stockQuantity: targetQty,
            inStock,
            stockStatus
          };
        }
        return p;
      })
    );

    try {
      const payload = newQuantity !== null ? { quantity: targetQty } : { delta };
      const res = await updateInventoryStock(product.rawId || product.id, payload);
      if (res && res.status === 'success') {
        showToast(`Updated "${product.name}" to ${targetQty} units.`, 'success');
        // Refresh metrics to keep telemetry cards fully synchronized
        const summary = await fetchInventorySummary();
        if (summary && summary.status === 'success') {
          setMetrics(summary.metrics || {});
          setCategoryDistribution(summary.category_distribution || []);
          setLowStockAlerts(summary.low_stock_alerts || []);
        }
      } else {
        showToast(res?.message || 'Failed to update stock quantity.', 'error');
        loadInventory();
      }
    } catch (err) {
      showToast('Network error while saving stock update.', 'error');
      loadInventory();
    }
  };

  // Inline edit input change
  const handleInlineChange = (productId, field, value) => {
    setInlineEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // Save inline edits (quantity and/or reorder level)
  const handleSaveInline = async (product) => {
    const edit = inlineEdits[product.id];
    if (!edit) return;

    const payload = {};
    if (edit.quantity !== undefined) payload.quantity = Math.max(0, parseInt(edit.quantity) || 0);
    if (edit.reorderLevel !== undefined) payload.reorder_level = Math.max(0, parseInt(edit.reorderLevel) || 0);

    try {
      const res = await updateInventoryStock(product.rawId || product.id, payload);
      if (res && res.status === 'success') {
        showToast(`Saved inventory settings for "${product.name}".`, 'success');
        setInlineEdits((prev) => {
          const copy = { ...prev };
          delete copy[product.id];
          return copy;
        });
        loadInventory();
      } else {
        showToast(res?.message || 'Failed to save changes.', 'error');
      }
    } catch (err) {
      showToast('Network error while saving inline edits.', 'error');
    }
  };

  // Batch replenishment for selected products
  const handleBatchRestock = async () => {
    if (selectedProductIds.length === 0) return;
    setBatchActionLoading(true);

    const idsToRestock = selectedProductIds.map((id) => {
      const prod = products.find((p) => p.id === id);
      return prod?.rawId || parseInt(id);
    });

    try {
      const res = await batchRestockInventory({
        ids: idsToRestock,
        add_units: parseInt(batchUnitsToAdd) || 25
      });

      if (res && res.status === 'success') {
        showToast(`Successfully added +${batchUnitsToAdd} units to ${idsToRestock.length} products!`, 'success');
        setSelectedProductIds([]);
        setBatchModalOpen(false);
        loadInventory();
      } else {
        showToast(res?.message || 'Failed to complete batch restock.', 'error');
      }
    } catch (err) {
      showToast('Network error during batch restock.', 'error');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Batch replenish all urgent low stock / out of stock items
  const handleRestockAllAlerts = async () => {
    if (lowStockAlerts.length === 0) return;
    setBatchActionLoading(true);

    const ids = lowStockAlerts.map((item) => item.rawId || parseInt(item.id));

    try {
      const res = await batchRestockInventory({
        ids,
        add_units: 25
      });

      if (res && res.status === 'success') {
        showToast(`Replenished +25 units for all ${ids.length} low-stock products!`, 'success');
        setAlertModalOpen(false);
        loadInventory();
      } else {
        showToast(res?.message || 'Failed to replenish alerted products.', 'error');
      }
    } catch (err) {
      showToast('Network error while replenishing alerts.', 'error');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Select all or deselect all
  const handleSelectAllToggle = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered & sorted product list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (p.name || '').toLowerCase().includes(q);
          const matchesBotanical = (p.botanicalName || '').toLowerCase().includes(q);
          const matchesCategory = (p.category || '').toLowerCase().includes(q);
          const matchesId = String(p.id).includes(q);
          if (!matchesName && !matchesBotanical && !matchesCategory && !matchesId) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Stock status filter
        if (stockStatusFilter === 'instock') {
          if (!p.inStock || p.stockQuantity <= p.reorderLevel) return false;
        } else if (stockStatusFilter === 'lowstock') {
          if (!p.inStock || p.stockQuantity <= 0 || p.stockQuantity > p.reorderLevel) return false;
        } else if (stockStatusFilter === 'outofstock') {
          if (p.inStock && p.stockQuantity > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'units-asc') return (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0);
        if (sortBy === 'units-desc') return (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0);
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockStatusFilter, sortBy]);

  // Thumbnail fallback resolver
  const getThumbnail = (img, name) => {
    if (img && img.startsWith('/images/')) return img;
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

  return (
    <AdminLayout
      activeNav="inventory"
      onLogout={onLogout}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      headerActions={
        <div className="itmu-inventory-top-actions">
          <button
            type="button"
            className="itmu-btn itmu-btn-outline"
            onClick={() => loadInventory(true)}
            disabled={refreshing}
            title="Refresh database inventory telemetry"
          >
            <RefreshCw size={16} className={refreshing ? 'itmu-spin-animation' : ''} />
            <span>{refreshing ? 'Updating...' : 'Sync Live'}</span>
          </button>

          {lowStockAlerts.length > 0 && (
            <button
              type="button"
              className="itmu-btn itmu-btn-warning"
              onClick={() => setAlertModalOpen(true)}
            >
              <AlertTriangle size={16} />
              <span>Restock Alerts ({lowStockAlerts.length})</span>
            </button>
          )}

          <button
            type="button"
            className="itmu-btn itmu-btn-primary"
            onClick={() => {
              if (selectedProductIds.length > 0) {
                setBatchModalOpen(true);
              } else {
                setBatchUnitsToAdd(25);
                setBatchModalOpen(true);
              }
            }}
          >
            <Boxes size={16} />
            <span>Batch Restock {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ''}</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`itmu-toast itmu-toast--${toast.type} itmu-toast-animate`}>
          <div className="itmu-toast-icon">
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <span className="itmu-toast-text">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="itmu-toast-close">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Breadcrumb Header */}
      <div className="itmu-breadcrumb-row">
        <span className="itmu-bc-link" onClick={() => onNavigate ? onNavigate('/admin/dashboard') : null}>
          Dashboard
        </span>
        <span className="itmu-bc-slash">&gt;</span>
        <span className="itmu-bc-active">Inventory Management</span>
      </div>

      <div className="itmu-page-header-banner">
        <div>
          <h1 className="itmu-page-title">
            Nursery Inventory & Stock Management
            <span className="itmu-leaf-pill">
              <Boxes size={16} color="#146B3A" />
            </span>
          </h1>
          <p className="itmu-page-subtitle">
            Monitor real-time live greenhouse stock quantities, automate reorder triggers, and replenish multi-department inventories.
          </p>
        </div>

        <div className="itmu-inventory-header-stats">
          <div className="itmu-inv-badge-stat">
            <span className="itmu-badge-stat-label">Health Index</span>
            <span className="itmu-badge-stat-value">{metrics.health_percentage}%</span>
          </div>
          <div className="itmu-inv-badge-stat">
            <span className="itmu-badge-stat-label">Total Units</span>
            <span className="itmu-badge-stat-value">{metrics.total_units}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. TELEMETRY KPI METRICS GRID
         ========================================================================= */}
      <section className="itmu-cards-grid itmu-inventory-kpis">
        {/* KPI 1: Total Nursery Units */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Warehouse size={22} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{metrics.total_units}</span>
            <span className="itmu-stat-title">Total Units In Stock</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>● Across {metrics.total_products} Plant Varieties</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Healthy Stock Varieties */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <ShieldCheck size={22} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{metrics.in_stock_count}</span>
            <span className="itmu-stat-title">Optimal Stock Varieties</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>✓ {metrics.health_percentage}% Catalog Availability</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Low-Stock Reorder Alerts */}
        <div
          className="itmu-stat-card"
          onClick={() => {
            setStockStatusFilter('lowstock');
          }}
          role="button"
          tabIndex={0}
          title="Filter to low stock items"
        >
          <div className={`itmu-stat-icon-circle ${metrics.low_stock_count > 0 ? 'itmu-stat-icon-circle--amber' : 'itmu-stat-icon-circle--green'}`}>
            <AlertTriangle size={22} color={metrics.low_stock_count > 0 ? '#D97706' : '#146B3A'} />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{metrics.low_stock_count}</span>
            <span className="itmu-stat-title">Low Stock Alerts</span>
            <div className={`itmu-stat-trend ${metrics.low_stock_count > 0 ? 'itmu-stat-trend--amber' : 'itmu-stat-trend--green'}`}>
              <span>{metrics.low_stock_count > 0 ? '⚠ Below Reorder Threshold' : '✓ Normal Stock Levels'}</span>
              <ChevronRight size={14} className="itmu-trend-arrow" />
            </div>
          </div>
        </div>

        {/* KPI 4: Depleted / Out of Stock */}
        <div
          className="itmu-stat-card"
          onClick={() => {
            setStockStatusFilter('outofstock');
          }}
          role="button"
          tabIndex={0}
          title="Filter to out of stock items"
        >
          <div className={`itmu-stat-icon-circle ${metrics.out_of_stock_count > 0 ? 'itmu-stat-icon-circle--red' : 'itmu-stat-icon-circle--green'}`}>
            <AlertCircle size={22} color={metrics.out_of_stock_count > 0 ? '#DC2626' : '#146B3A'} />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{metrics.out_of_stock_count}</span>
            <span className="itmu-stat-title">Depleted Varieties</span>
            <div className={`itmu-stat-trend ${metrics.out_of_stock_count > 0 ? 'itmu-stat-trend--red' : 'itmu-stat-trend--green'}`}>
              <span>{metrics.out_of_stock_count > 0 ? '✖ Replenishment Urgently Needed' : '✓ 0 Depleted Items'}</span>
              <ChevronRight size={14} className="itmu-trend-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DEPARTMENT DISTRIBUTION BREAKDOWN (4 CATEGORIES)
         ========================================================================= */}
      <section className="itmu-inventory-cat-section">
        <div className="itmu-section-heading-row">
          <div>
            <h3 className="itmu-section-title">Greenhouse Department Breakdown</h3>
            <p className="itmu-section-sub">
              Stock distribution across the 4 core nursery departments. Click any department to filter table.
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              className="itmu-clear-filter-btn"
              onClick={() => setSelectedCategory('all')}
            >
              <X size={14} />
              <span>Show All Departments</span>
            </button>
          )}
        </div>

        <div className="itmu-inventory-dept-grid">
          {categoryDistribution.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const healthScore = cat.total_varieties > 0 ? Math.round((cat.in_stock / cat.total_varieties) * 100) : 100;

            return (
              <div
                key={cat.id || cat.name}
                className={`itmu-dept-card ${isSelected ? 'itmu-dept-card--active' : ''}`}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                role="button"
                tabIndex={0}
              >
                <div className="itmu-dept-header">
                  <div className="itmu-dept-icon-pill">
                    <Layers size={16} color="#146B3A" />
                  </div>
                  <h4 className="itmu-dept-name">{cat.name}</h4>
                  <span className="itmu-dept-units-badge">{cat.total_units} Units</span>
                </div>

                <div className="itmu-dept-metrics">
                  <div className="itmu-dept-submetric">
                    <span className="itmu-submetric-val">{cat.total_varieties}</span>
                    <span className="itmu-submetric-lbl">Varieties</span>
                  </div>
                  <div className="itmu-dept-submetric">
                    <span className="itmu-submetric-val itmu-val--green">{cat.in_stock}</span>
                    <span className="itmu-submetric-lbl">Healthy</span>
                  </div>
                  <div className="itmu-dept-submetric">
                    <span className="itmu-submetric-val itmu-val--amber">{cat.low_stock}</span>
                    <span className="itmu-submetric-lbl">Low</span>
                  </div>
                  <div className="itmu-dept-submetric">
                    <span className="itmu-submetric-val itmu-val--red">{cat.out_of_stock}</span>
                    <span className="itmu-submetric-lbl">Out</span>
                  </div>
                </div>

                <div className="itmu-dept-progress-wrap">
                  <div className="itmu-progress-track">
                    <div
                      className={`itmu-progress-bar ${healthScore < 50 ? 'itmu-progress-bar--red' : healthScore < 80 ? 'itmu-progress-bar--amber' : 'itmu-progress-bar--green'}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <div className="itmu-dept-progress-labels">
                    <span>Stock Health</span>
                    <span>{healthScore}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. CONTROLS, SEARCH, AND FILTERS BAR
         ========================================================================= */}
      <div className="itmu-inventory-controls-panel">
        <div className="itmu-controls-left">
          {/* Search bar */}
          <div className="itmu-search-box-pill">
            <Search size={16} className="itmu-search-icon" />
            <input
              type="text"
              placeholder="Search by plant name, botanical name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="itmu-search-input-pill"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="itmu-clear-search-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department Filter Pills */}
          <div className="itmu-filter-pills-row">
            <button
              type="button"
              className={`itmu-pill-filter ${selectedCategory === 'all' ? 'itmu-pill-filter--active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Departments ({products.length})
            </button>
            {categoryDistribution.map((cat) => (
              <button
                key={cat.id || cat.name}
                type="button"
                className={`itmu-pill-filter ${selectedCategory === cat.name ? 'itmu-pill-filter--active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name} ({cat.total_varieties})
              </button>
            ))}
          </div>
        </div>

        <div className="itmu-controls-right">
          {/* Status Filter */}
          <div className="itmu-select-wrap">
            <Filter size={14} className="itmu-select-icon" />
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="itmu-custom-select"
            >
              <option value="all">All Stock Statuses</option>
              <option value="instock">In Stock Only</option>
              <option value="lowstock">Low Stock (At/Below Reorder)</option>
              <option value="outofstock">Out of Stock (0 Units)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="itmu-select-wrap">
            <ArrowUpDown size={14} className="itmu-select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="itmu-custom-select"
            >
              <option value="units-asc">Stock: Low to High (Replenish First)</option>
              <option value="units-desc">Stock: High to Low</option>
              <option value="name-asc">Plant Name (A-Z)</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. INVENTORY DATA TABLE
         ========================================================================= */}
      <div className="itmu-table-container itmu-inventory-table-wrap">
        {loading ? (
          <div className="itmu-table-loading-state">
            <div className="itmu-admin-spinner" />
            <p>Loading real-time greenhouse inventory...</p>
          </div>
        ) : error ? (
          <div className="itmu-table-error-state">
            <AlertCircle size={32} color="#DC2626" />
            <h4>Failed to Load Inventory</h4>
            <p>{error}</p>
            <button
              type="button"
              className="itmu-btn itmu-btn-outline"
              onClick={() => loadInventory()}
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="itmu-table-empty-state">
            <Boxes size={48} color="#A3C2B3" />
            <h3>No inventory items match your filter</h3>
            <p>Try resetting the search terms or department filters to view catalog items.</p>
            <button
              type="button"
              className="itmu-btn itmu-btn-outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table className="itmu-admin-table itmu-inventory-table">
            <thead>
              <tr>
                <th className="itmu-th-checkbox" style={{ width: '48px', minWidth: '48px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={handleSelectAllToggle}
                    aria-label="Select all products for batch operations"
                  />
                </th>
                <th style={{ minWidth: '300px', width: '30%' }}>Product &amp; Department</th>
                <th style={{ minWidth: '130px', width: '12%' }}>Stock Status</th>
                <th style={{ minWidth: '240px', width: '22%' }}>Current Quantity</th>
                <th style={{ minWidth: '150px', width: '12%' }}>Reorder Threshold</th>
                <th style={{ minWidth: '130px', width: '10%' }}>Retail Price</th>
                <th style={{ minWidth: '160px', width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const edit = inlineEdits[product.id];
                const currentQty = edit?.quantity !== undefined ? edit.quantity : product.stockQuantity;
                const reorderLvl = edit?.reorderLevel !== undefined ? edit.reorderLevel : product.reorderLevel;

                const isOutOfStock = !product.inStock || currentQty <= 0;
                const isLowStock = !isOutOfStock && currentQty <= reorderLvl;

                return (
                  <tr
                    key={product.id}
                    className={`itmu-table-row ${isSelected ? 'itmu-row--selected' : ''} ${isOutOfStock ? 'itmu-row--outofstock' : isLowStock ? 'itmu-row--lowstock' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="itmu-td-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </td>

                    {/* Product & Department */}
                    <td className="itmu-td-product-info">
                      <div className="itmu-product-cell">
                        <img
                          src={getThumbnail(product.image, product.name)}
                          alt={product.name}
                          className="itmu-product-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/plants/snake_plant.png';
                          }}
                        />
                        <div className="itmu-product-meta">
                          <span className="itmu-product-name">{product.name}</span>
                          {product.botanicalName && (
                            <span className="itmu-product-botanical">{product.botanicalName}</span>
                          )}
                          <div className="itmu-product-badges">
                            <span className="itmu-dept-pill">{product.category}</span>
                            {product.tag && (
                              <span className="itmu-tag-pill">{product.tag}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="itmu-td-status">
                      {isOutOfStock ? (
                        <span className="itmu-badge itmu-badge--danger">
                          <AlertCircle size={13} />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="itmu-badge itmu-badge--warning">
                          <AlertTriangle size={13} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="itmu-badge itmu-badge--success">
                          <CheckCircle2 size={13} />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Current Quantity with Inline Stepper */}
                    <td className="itmu-td-quantity">
                      <div className="itmu-qty-stepper-wrap">
                        <div className="itmu-qty-input-group">
                          <button
                            type="button"
                            className="itmu-step-btn"
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={currentQty <= 0}
                            title="Decrease by 1 unit"
                          >
                            <Minus size={13} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentQty}
                            onChange={(e) => handleInlineChange(product.id, 'quantity', e.target.value)}
                            onBlur={() => {
                              if (edit && edit.quantity !== undefined && edit.quantity !== product.stockQuantity) {
                                handleSaveInline(product);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInline(product);
                            }}
                            className={`itmu-qty-input ${isOutOfStock ? 'itmu-qty-input--danger' : isLowStock ? 'itmu-qty-input--warning' : ''}`}
                          />

                          <button
                            type="button"
                            className="itmu-step-btn"
                            onClick={() => handleQuickAdjust(product, 1)}
                            title="Increase by 1 unit"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Quick increment pills */}
                        <div className="itmu-quick-pills">
                          <button
                            type="button"
                            className="itmu-inc-pill"
                            onClick={() => handleQuickAdjust(product, 5)}
                            title="Add +5 units"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            className="itmu-inc-pill"
                            onClick={() => handleQuickAdjust(product, 10)}
                            title="Add +10 units"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            className="itmu-inc-pill itmu-inc-pill--highlight"
                            onClick={() => handleQuickAdjust(product, 25)}
                            title="Restock +25 units"
                          >
                            +25
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Reorder Threshold */}
                    <td className="itmu-td-reorder">
                      <div className="itmu-reorder-wrap">
                        <input
                          type="number"
                          min="1"
                          value={reorderLvl}
                          onChange={(e) => handleInlineChange(product.id, 'reorderLevel', e.target.value)}
                          onBlur={() => {
                            if (edit && edit.reorderLevel !== undefined && edit.reorderLevel !== product.reorderLevel) {
                              handleSaveInline(product);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInline(product);
                          }}
                          className="itmu-reorder-input"
                          title="Trigger low-stock alert when quantity falls below this number"
                        />
                        <span className="itmu-reorder-unit">units min</span>
                      </div>
                    </td>

                    {/* Retail Price */}
                    <td className="itmu-td-price">
                      <div className="itmu-price-box">
                        <span className="itmu-price-val">₹{product.price}</span>
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="itmu-price-orig">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="itmu-td-actions" style={{ textAlign: 'right' }}>
                      <div className="itmu-row-actions">
                        <button
                          type="button"
                          className="itmu-btn itmu-btn-xs itmu-btn-primary"
                          onClick={() => handleQuickAdjust(product, 25)}
                          title="Quick Restock +25 units"
                        >
                          <Plus size={13} />
                          <span>Restock 25</span>
                        </button>

                        <button
                          type="button"
                          className="itmu-action-icon-btn"
                          onClick={() => {
                            if (onNavigate) onNavigate(`/admin/products/edit/${product.rawId || product.id}`);
                            else {
                              window.history.pushState({}, '', `/admin/products/edit/${product.rawId || product.id}`);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }
                          }}
                          title="Edit full product details"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================================================================
          5. FLOATING BOTTOM BATCH ACTIONS BAR
         ========================================================================= */}
      {selectedProductIds.length > 0 && (
        <div className="itmu-floating-batch-bar itmu-floating-batch-bar--animate">
          <div className="itmu-batch-info">
            <span className="itmu-batch-count-badge">{selectedProductIds.length}</span>
            <span className="itmu-batch-text">items selected for greenhouse replenishment</span>
          </div>

          <div className="itmu-batch-buttons">
            <button
              type="button"
              className="itmu-btn itmu-btn-sm itmu-btn-outline"
              onClick={() => {
                setBatchUnitsToAdd(10);
                setBatchModalOpen(true);
              }}
            >
              +10 Units
            </button>
            <button
              type="button"
              className="itmu-btn itmu-btn-sm itmu-btn-outline"
              onClick={() => {
                setBatchUnitsToAdd(25);
                setBatchModalOpen(true);
              }}
            >
              +25 Units
            </button>
            <button
              type="button"
              className="itmu-btn itmu-btn-sm itmu-btn-outline"
              onClick={() => {
                setBatchUnitsToAdd(50);
                setBatchModalOpen(true);
              }}
            >
              +50 Units
            </button>
            <button
              type="button"
              className="itmu-btn itmu-btn-sm itmu-btn-primary"
              onClick={() => setBatchModalOpen(true)}
            >
              <Boxes size={15} />
              <span>Configure Batch Restock</span>
            </button>
            <button
              type="button"
              className="itmu-btn itmu-btn-sm itmu-btn-ghost"
              onClick={() => setSelectedProductIds([])}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. BATCH RESTOCK MODAL
         ========================================================================= */}
      {batchModalOpen && (
        <div className="itmu-modal-backdrop" onClick={() => setBatchModalOpen(false)}>
          <div
            className="itmu-modal-card itmu-modal-batch"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="itmu-modal-header">
              <div className="itmu-modal-title-wrap">
                <div className="itmu-modal-icon-circle">
                  <Boxes size={20} color="#146B3A" />
                </div>
                <div>
                  <h3 className="itmu-modal-title">Batch Greenhouse Replenishment</h3>
                  <p className="itmu-modal-desc">
                    {selectedProductIds.length > 0
                      ? `Replenish ${selectedProductIds.length} selected varieties simultaneously.`
                      : `Batch restock selected products in catalog.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="itmu-modal-close-btn"
                onClick={() => setBatchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="itmu-modal-body">
              <div className="itmu-form-group">
                <label className="itmu-form-label">Units to Add per Product</label>
                <div className="itmu-batch-stepper-row">
                  {[10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`itmu-preset-btn ${batchUnitsToAdd === preset ? 'itmu-preset-btn--active' : ''}`}
                      onClick={() => setBatchUnitsToAdd(preset)}
                    >
                      +{preset} Units
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    value={batchUnitsToAdd}
                    onChange={(e) => setBatchUnitsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="itmu-input"
                    placeholder="Custom units"
                  />
                </div>
              </div>

              <div className="itmu-batch-preview-list">
                <span className="itmu-preview-title">
                  Products to be updated ({selectedProductIds.length}):
                </span>
                <div className="itmu-preview-scroll">
                  {selectedProductIds.map((id) => {
                    const prod = products.find((p) => p.id === id);
                    if (!prod) return null;
                    return (
                      <div key={id} className="itmu-preview-row">
                        <img
                          src={getThumbnail(prod.image, prod.name)}
                          alt={prod.name}
                          className="itmu-preview-thumb"
                        />
                        <span className="itmu-preview-name">{prod.name}</span>
                        <span className="itmu-preview-current">{prod.stockQuantity} units</span>
                        <ChevronRight size={14} className="itmu-preview-arrow" />
                        <span className="itmu-preview-new">
                          {prod.stockQuantity + (parseInt(batchUnitsToAdd) || 0)} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="itmu-modal-footer">
              <button
                type="button"
                className="itmu-btn itmu-btn-outline"
                onClick={() => setBatchModalOpen(false)}
                disabled={batchActionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="itmu-btn itmu-btn-primary"
                onClick={handleBatchRestock}
                disabled={batchActionLoading || selectedProductIds.length === 0}
              >
                {batchActionLoading ? (
                  <>
                    <RefreshCw size={15} className="itmu-spin-animation" />
                    <span>Applying Restock...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Confirm & Restock ({selectedProductIds.length} items)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. URGENT LOW STOCK ALERTS MODAL
         ========================================================================= */}
      {alertModalOpen && (
        <div className="itmu-modal-backdrop" onClick={() => setAlertModalOpen(false)}>
          <div
            className="itmu-modal-card itmu-modal-alerts"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="itmu-modal-header">
              <div className="itmu-modal-title-wrap">
                <div className="itmu-modal-icon-circle itmu-icon-circle--amber">
                  <AlertTriangle size={20} color="#D97706" />
                </div>
                <div>
                  <h3 className="itmu-modal-title">Low Stock Replenishment Alerts</h3>
                  <p className="itmu-modal-desc">
                    {lowStockAlerts.length} nursery catalog items have fallen at or below their reorder thresholds.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="itmu-modal-close-btn"
                onClick={() => setAlertModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="itmu-modal-body">
              <div className="itmu-alert-list-scroll">
                {lowStockAlerts.map((item) => (
                  <div key={item.id} className="itmu-alert-item-card">
                    <img
                      src={getThumbnail(item.image, item.name)}
                      alt={item.name}
                      className="itmu-alert-thumb"
                    />
                    <div className="itmu-alert-meta">
                      <span className="itmu-alert-title">{item.name}</span>
                      <span className="itmu-alert-cat">{item.category}</span>
                      <div className="itmu-alert-qty-info">
                        <span className="itmu-alert-qty-badge">
                          Current: {item.stockQuantity ?? 0} units
                        </span>
                        <span className="itmu-alert-thresh">
                          Reorder Level: {item.reorderLevel ?? 5} units
                        </span>
                      </div>
                    </div>
                    <div className="itmu-alert-action">
                      <button
                        type="button"
                        className="itmu-btn itmu-btn-xs itmu-btn-primary"
                        onClick={() => handleQuickAdjust(item, 25)}
                      >
                        <Plus size={13} />
                        <span>Add +25</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="itmu-modal-footer">
              <button
                type="button"
                className="itmu-btn itmu-btn-outline"
                onClick={() => setAlertModalOpen(false)}
                disabled={batchActionLoading}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="itmu-btn itmu-btn-warning"
                onClick={handleRestockAllAlerts}
                disabled={batchActionLoading || lowStockAlerts.length === 0}
              >
                {batchActionLoading ? (
                  <>
                    <RefreshCw size={15} className="itmu-spin-animation" />
                    <span>Restocking All...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Restock All {lowStockAlerts.length} Items (+25 Units Each)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
