import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Sprout,
  FolderTree,
  ChevronRight,
  FolderPlus,
  Save
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/api';

export default function AdminCategoriesList({ onNavigate, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // Category object
  const [deletingCategory, setDeletingCategory] = useState(null); // Category object

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    document.title = 'Category Management | ITMU E-Haat Admin';
  }, []);

  // Fetch categories from database
  const loadCategories = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminCategories();
      if (res && res.categories && Array.isArray(res.categories)) {
        setCategories(res.categories.filter((c) => c.id !== 'all'));
      } else if (Array.isArray(res)) {
        setCategories(res.filter((c) => c.id !== 'all'));
      } else {
        setError(res?.message || 'Failed to load categories.');
      }
    } catch (err) {
      setError('Network connection error connecting to categories endpoint.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Search filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productsCount || 0), 0);
    const populated = categories.filter((c) => (c.productsCount || 0) > 0).length;
    let largest = null;
    if (categories.length > 0) {
      largest = [...categories].sort((a, b) => (b.productsCount || 0) - (a.productsCount || 0))[0];
    }
    return { total, totalProducts, populated, largest };
  }, [categories]);

  // Handle open Add Modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (cat, e) => {
    if (e) e.stopPropagation();
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormDesc(cat.description || '');
    setFormError(null);
  };

  // Submit Add Category
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const res = await createCategory({
        name: formName.trim(),
        description: formDesc.trim()
      });

      if (res && (res.category || res.status === 'success')) {
        showToast(`Category "${formName.trim()}" created successfully!`, 'success');
        setIsAddModalOpen(false);
        loadCategories();
      } else {
        setFormError(res?.message || 'Failed to create category.');
      }
    } catch {
      setFormError('Network error creating category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!formName.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }

    const catId = editingCategory.rawId || editingCategory.id;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await updateCategory(catId, {
        name: formName.trim(),
        description: formDesc.trim()
      });

      if (res && res.status === 'success') {
        showToast(`Category "${formName.trim()}" updated successfully!`, 'success');
        setEditingCategory(null);
        loadCategories();
      } else {
        setFormError(res?.message || 'Failed to update category.');
      }
    } catch {
      setFormError('Network error updating category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Delete Category
  const handleDeleteSubmit = async () => {
    if (!deletingCategory) return;
    const catId = deletingCategory.rawId || deletingCategory.id;
    const catName = deletingCategory.name;

    setFormSubmitting(true);
    try {
      const res = await deleteCategory(catId);
      if (res && res.status === 'success') {
        showToast(`Category "${catName}" was removed.`, 'success');
        setDeletingCategory(null);
        loadCategories();
      } else {
        showToast(res?.message || 'Failed to delete category.', 'error');
      }
    } catch {
      showToast('Network error deleting category.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Department icon/color resolver
  const getCatBadgeInfo = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('indoor')) {
      return { bg: '#E8F5E9', border: '#C4E7C7', color: '#146B3A', label: 'Indoor Foliage', emoji: '🪴' };
    }
    if (lower.includes('flower')) {
      return { bg: '#FDF2F8', border: '#FBCFE8', color: '#BE185D', label: 'Ornamental Blooms', emoji: '🌸' };
    }
    if (lower.includes('fruit')) {
      return { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309', label: 'Fruit Bearing', emoji: '🍋' };
    }
    if (lower.includes('vegetable')) {
      return { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', label: 'Kitchen Garden', emoji: '🥦' };
    }
    return { bg: '#F1F5F9', border: '#E2E8F0', color: '#475569', label: 'Nursery Department', emoji: '🌱' };
  };

  return (
    <AdminLayout
      activeNav="categories"
      onNavigate={onNavigate}
      onLogout={onLogout}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      headerActions={
        <button
          type="button"
          className="itmu-header-action-btn"
          onClick={handleOpenAdd}
        >
          <Plus size={18} />
          <span>Add Category</span>
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
        <span className="itmu-bc-active">Category Management</span>
      </div>

      {/* Header Banner */}
      <section className="itmu-products-header-card">
        <div className="itmu-products-header-info">
          <div className="itmu-products-title-group">
            <h1 className="itmu-page-title">Category Management</h1>
            <span className="itmu-products-count-pill">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>
          <p className="itmu-page-subtitle">
            Manage your nursery catalog taxonomy, configure plant departments, and organize botanical collections.
          </p>
        </div>

        <div className="itmu-products-header-buttons">
          <button
            type="button"
            className="itmu-btn-outline"
            onClick={() => loadCategories(true)}
            disabled={refreshing}
            title="Refresh categories from database"
          >
            <RefreshCw size={16} className={refreshing ? 'itmu-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="itmu-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={18} />
            <span>Add New Category</span>
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="itmu-cards-grid" style={{ marginBottom: 24 }}>
        {/* 1. Total Categories */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Layers size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{stats.total}</span>
            <span className="itmu-stat-title">Active Categories</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>● Nursery Departments</span>
            </div>
          </div>
        </div>

        {/* 2. Total Products Assigned */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Package size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">{stats.totalProducts}</span>
            <span className="itmu-stat-title">Assigned Products</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>● Catalog Varieties</span>
            </div>
          </div>
        </div>

        {/* 3. Populated Categories */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <CheckCircle2 size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number">
              {stats.populated} / {stats.total}
            </span>
            <span className="itmu-stat-title">Active Departments</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>{stats.populated === stats.total ? '✓ All Populated' : '● In Stock'}</span>
            </div>
          </div>
        </div>

        {/* 4. Largest Category */}
        <div className="itmu-stat-card">
          <div className="itmu-stat-icon-circle itmu-stat-icon-circle--green">
            <Sprout size={20} color="#146B3A" />
          </div>
          <div className="itmu-stat-details">
            <span className="itmu-stat-number" style={{ fontSize: '1.25rem' }}>
              {stats.largest ? stats.largest.name : 'None'}
            </span>
            <span className="itmu-stat-title">Top Collection</span>
            <div className="itmu-stat-trend itmu-stat-trend--green">
              <span>{stats.largest ? `${stats.largest.productsCount || 0} Products` : '—'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter / Search Bar */}
      <section className="itmu-panel itmu-filter-panel" style={{ marginBottom: 20 }}>
        <div className="itmu-filter-toolbar">
          <div className="itmu-filter-search-box" style={{ maxWidth: 420 }}>
            <Search size={18} className="itmu-filter-search-icon" />
            <input
              type="text"
              placeholder="Search category name or description..."
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

          {/* Core Categories Showcase Row */}
          <div className="itmu-core-categories-showcase">
            <span className="itmu-core-cat-label">
              <span className="itmu-core-cat-dot">●</span>
              Official Core Categories:
            </span>
            <div className="itmu-core-cat-badges">
              <span className="itmu-badge itmu-badge-bestseller">Indoor Plants</span>
              <span className="itmu-badge itmu-badge-trending">Flowers</span>
              <span className="itmu-badge itmu-badge-toprated">Fruits Plants</span>
              <span className="itmu-badge itmu-badge-new">Vegetables Crops</span>
            </div>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading ? (
        <div className="itmu-panel itmu-loading-box">
          <div className="itmu-admin-spinner" style={{ width: 36, height: 36 }} />
          <p style={{ marginTop: 14, color: '#146B3A', fontWeight: 600 }}>
            Loading categories from database...
          </p>
        </div>
      ) : error ? (
        <div className="itmu-panel itmu-error-box">
          <AlertTriangle size={36} color="#DC2626" />
          <h3 style={{ margin: '12px 0 6px', color: '#991B1B' }}>Failed to Load Categories</h3>
          <p style={{ color: '#64748B', maxWidth: 480, margin: '0 auto 16px' }}>{error}</p>
          <button type="button" className="itmu-btn-primary" onClick={() => loadCategories()}>
            Try Again
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="itmu-panel itmu-empty-box">
          <div className="itmu-empty-icon-circle">
            <Layers size={36} color="#146B3A" />
          </div>
          <h3 style={{ margin: '14px 0 6px', color: '#172B24' }}>No Categories Found</h3>
          <p style={{ color: '#64748B', maxWidth: 460, margin: '0 auto 18px' }}>
            {searchQuery
              ? 'No categories matched your search term.'
              : 'No categories exist in the database. Click "+ Add New Category" to create one.'}
          </p>
          <button type="button" className="itmu-btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        /* Data Table */
        <div className="itmu-panel itmu-table-panel">
          <div className="itmu-table-responsive">
            <table className="itmu-data-table" style={{ minWidth: 840 }}>
              <thead>
                <tr>
                  <th style={{ width: 60, minWidth: 60, textAlign: 'center', whiteSpace: 'nowrap' }}>Icon</th>
                  <th style={{ minWidth: 170, whiteSpace: 'nowrap' }}>Category Name</th>
                  <th style={{ minWidth: 260, whiteSpace: 'nowrap' }}>Department Scope / Description</th>
                  <th style={{ minWidth: 140, textAlign: 'center', whiteSpace: 'nowrap' }}>Products Count</th>
                  <th style={{ minWidth: 160, whiteSpace: 'nowrap' }}>Catalog Filter</th>
                  <th style={{ minWidth: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const badge = getCatBadgeInfo(cat.name);
                  const prodCount = cat.productsCount || 0;

                  return (
                    <tr key={cat.id || cat.rawId}>
                      {/* Emoji Icon */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                          }}
                        >
                          {badge.emoji}
                        </div>
                      </td>

                      {/* Name & Department tag */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <strong style={{ fontSize: '0.98rem', color: '#172B24' }}>
                            {cat.name}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: badge.color
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', maxWidth: 440, lineHeight: 1.4 }}>
                          {cat.description || 'General botanical nursery collection.'}
                        </p>
                      </td>

                      {/* Products Count */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`itmu-badge ${
                            prodCount > 0 ? 'itmu-badge-bestseller' : 'itmu-badge-generic'
                          }`}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          {prodCount} {prodCount === 1 ? 'Variety' : 'Varieties'}
                        </span>
                      </td>

                      {/* Direct Link to Products */}
                      <td>
                        <button
                          type="button"
                          className="itmu-btn-link-action"
                          onClick={() => onNavigate(`/admin/products?category=${encodeURIComponent(cat.name)}`)}
                          title={`View all products in ${cat.name}`}
                        >
                          <span>View {prodCount} Products</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="itmu-row-actions">
                          {/* Edit button */}
                          <button
                            type="button"
                            className="itmu-action-btn-circle itmu-action-btn-circle--edit"
                            onClick={(e) => handleOpenEdit(cat, e)}
                            title="Edit Category Name & Description"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            className="itmu-action-btn-circle itmu-action-btn-circle--delete"
                            onClick={() => setDeletingCategory(cat)}
                            title="Delete Category"
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

          <div className="itmu-table-footer">
            <span>
              Showing {filteredCategories.length} active nursery categories
            </span>
            <div className="itmu-table-footer-legend">
              <span className="itmu-legend-dot itmu-legend-dot--darkgreen" />
              <span>Synced with Database</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE CATEGORY MODAL ================= */}
      {isAddModalOpen && (
        <div className="itmu-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="itmu-confirm-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="itmu-confirm-modal-icon" style={{ backgroundColor: '#E8F5E9', color: '#146B3A' }}>
              <FolderPlus size={26} color="#146B3A" />
            </div>

            <h3 className="itmu-confirm-modal-title">Create New Category</h3>
            <p className="itmu-confirm-modal-desc">
              Add a new category collection to organize the ITMU E-Haat nursery catalog.
            </p>

            {formError && (
              <div className="itmu-form-error-banner" style={{ textAlign: 'left', marginBottom: 14 }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ textAlign: 'left', marginTop: 16 }}>
              <div className="itmu-field-group" style={{ marginBottom: 16 }}>
                <label className="itmu-label">
                  Category Name <span className="itmu-req">*</span>
                </label>
                <input
                  type="text"
                  className="itmu-input"
                  placeholder="e.g. Rare Succulents"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="itmu-field-group" style={{ marginBottom: 20 }}>
                <label className="itmu-label">Department Description</label>
                <textarea
                  rows={3}
                  className="itmu-input itmu-textarea"
                  placeholder="Describe the plant types, lighting preferences, or seasonal varieties in this category..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="itmu-confirm-modal-buttons">
                <button
                  type="button"
                  className="itmu-btn-outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="itmu-btn-primary"
                  disabled={formSubmitting || !formName.trim()}
                >
                  {formSubmitting ? (
                    <>
                      <span className="itmu-micro-spinner" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT CATEGORY MODAL ================= */}
      {editingCategory && (
        <div className="itmu-modal-backdrop" onClick={() => setEditingCategory(null)}>
          <div className="itmu-confirm-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="itmu-confirm-modal-icon" style={{ backgroundColor: '#E8F5E9', color: '#146B3A' }}>
              <Edit2 size={26} color="#146B3A" />
            </div>

            <h3 className="itmu-confirm-modal-title">Edit Category</h3>
            <p className="itmu-confirm-modal-desc">
              Update name and description for <strong>"{editingCategory.name}"</strong>.
            </p>

            {formError && (
              <div className="itmu-form-error-banner" style={{ textAlign: 'left', marginBottom: 14 }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ textAlign: 'left', marginTop: 16 }}>
              <div className="itmu-field-group" style={{ marginBottom: 16 }}>
                <label className="itmu-label">
                  Category Name <span className="itmu-req">*</span>
                </label>
                <input
                  type="text"
                  className="itmu-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="itmu-field-group" style={{ marginBottom: 20 }}>
                <label className="itmu-label">Department Description</label>
                <textarea
                  rows={3}
                  className="itmu-input itmu-textarea"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="itmu-confirm-modal-buttons">
                <button
                  type="button"
                  className="itmu-btn-outline"
                  onClick={() => setEditingCategory(null)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="itmu-btn-primary"
                  disabled={formSubmitting || !formName.trim()}
                >
                  {formSubmitting ? (
                    <>
                      <span className="itmu-micro-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CATEGORY CONFIRMATION MODAL ================= */}
      {deletingCategory && (
        <div className="itmu-modal-backdrop" onClick={() => setDeletingCategory(null)}>
          <div className="itmu-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="itmu-confirm-modal-icon">
              <Trash2 size={28} color="#DC2626" />
            </div>

            <h3 className="itmu-confirm-modal-title">Delete Category</h3>
            <p className="itmu-confirm-modal-desc">
              Are you sure you want to delete category <strong>"{deletingCategory.name}"</strong>?
            </p>

            {(deletingCategory.productsCount || 0) > 0 ? (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 20,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#991B1B', fontWeight: 700, marginBottom: 4 }}>
                  <AlertTriangle size={16} />
                  <span>Warning: {deletingCategory.productsCount} Products Attached</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#B91C1C', lineHeight: 1.4 }}>
                  Products currently assigned to this category will have their category field set to unassigned.
                </p>
              </div>
            ) : null}

            <div className="itmu-confirm-modal-buttons">
              <button
                type="button"
                className="itmu-btn-outline"
                onClick={() => setDeletingCategory(null)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="itmu-btn-danger"
                onClick={handleDeleteSubmit}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
