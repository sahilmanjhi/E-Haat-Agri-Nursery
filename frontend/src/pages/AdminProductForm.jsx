import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Sun,
  Droplets,
  Heart,
  Wind,
  Home,
  Tag,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Check,
  Eye,
  RotateCcw
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  fetchProductDetail,
  createProduct,
  updateProduct,
  fetchCategories,
  createCategory
} from '../services/api';

// Curated high quality nursery plant image presets available locally in ITMU E-Haat
const PRESET_PLANT_IMAGES = [
  { name: 'Snake Plant', path: '/images/plants/snake_plant.png', tag: 'Air Purifier' },
  { name: 'Monstera Deliciosa', path: '/images/plants/monstera.png', tag: 'Tropical' },
  { name: 'ZZ Plant', path: '/images/plants/zz_plant.png', tag: 'Low Light' },
  { name: 'Peace Lily', path: '/images/plants/peace_lily.png', tag: 'Flowering' },
  { name: 'Areca Palm', path: '/images/plants/areca_palm.jpg', tag: 'Living Room' },
  { name: 'Jade Plant', path: '/images/plants/jade_plant.jpg', tag: 'Good Luck' },
  { name: 'Heirloom Seeds', path: '/images/plants/heirloom_seeds.jpg', tag: 'Organic Seeds' },
];

export default function AdminProductForm({ productId, onNavigate, onLogout }) {
  const isEdit = Boolean(productId);

  // Categories list
  const [categories, setCategories] = useState([]);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    botanicalName: '',
    category: 'Indoor Plants',
    tag: '',
    price: '',
    originalPrice: '',
    discount: 0,
    stockQuantity: 25,
    inStock: true,
    light: 'Bright Indirect Sunlight',
    water: 'Once a week',
    petFriendly: false,
    airPurifying: true,
    maintenance: 'Easy / Low Maintenance',
    room: 'Living Room',
    description: '',
    image: '/images/plants/snake_plant.png',
    imageHover: '',
    rating: 5.0,
    reviewsCount: 0
  });

  // UI States
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // New Category inline modal
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    document.title = isEdit
      ? 'Edit Product | ITMU E-Haat Admin'
      : 'Add New Product | ITMU E-Haat Admin';
  }, [isEdit]);

  // Load categories and initial product data if edit mode
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const cats = await fetchCategories();
        if (isMounted && cats && Array.isArray(cats)) {
          const filtered = cats.filter((c) => c.id !== 'all');
          setCategories(filtered);
          if (!isEdit && filtered.length > 0) {
            setFormData((prev) => ({ ...prev, category: filtered[0].name }));
          }
        }

        if (isEdit) {
          setLoading(true);
          const res = await fetchProductDetail(productId);
          if (!isMounted) return;

          if (res && (res.product || res.id)) {
            const p = res.product || res;
            setFormData({
              name: p.name || '',
              botanicalName: p.botanicalName || '',
              category: p.category || 'Indoor Plants',
              tag: p.tag || '',
              price: p.price !== undefined ? String(p.price) : '',
              originalPrice: p.originalPrice !== undefined ? String(p.originalPrice) : '',
              discount: p.discount || 0,
              stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 25,
              inStock: p.inStock !== undefined ? p.inStock : true,
              light: p.light || 'Bright Indirect Sunlight',
              water: p.water || 'Once a week',
              petFriendly: Boolean(p.petFriendly),
              airPurifying: Boolean(p.airPurifying),
              maintenance: p.maintenance || 'Easy / Low Maintenance',
              room: p.room || 'Living Room',
              description: p.description || '',
              image: p.image || '/images/plants/snake_plant.png',
              imageHover: p.imageHover || '',
              rating: p.rating || 5.0,
              reviewsCount: p.reviewsCount || 0
            });
          } else {
            setError('Product not found in the database.');
          }
        }
      } catch (err) {
        if (isMounted) setError('Network error loading product data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, [productId, isEdit]);

  // Handle generic input change
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate discount when price or originalPrice changes
      if (field === 'price' || field === 'originalPrice') {
        const p = parseFloat(field === 'price' ? value : updated.price);
        const orig = parseFloat(field === 'originalPrice' ? value : updated.originalPrice);
        if (!isNaN(p) && !isNaN(orig) && orig > p && orig > 0) {
          updated.discount = Math.round(((orig - p) / orig) * 100);
        } else if (!isNaN(p) && !isNaN(orig) && orig <= p) {
          updated.discount = 0;
        }
      }

      return updated;
    });
  };

  // Create new category inline
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      if (res && (res.category || res.status === 'success')) {
        const createdCat = res.category || { name: newCatName.trim() };
        setCategories((prev) => [...prev, createdCat]);
        setFormData((prev) => ({ ...prev, category: createdCat.name }));
        setShowNewCatModal(false);
        setNewCatName('');
        setNewCatDesc('');
        showToast(`Category "${createdCat.name}" created and selected!`, 'success');
      } else {
        showToast(res.message || 'Failed to create category.', 'error');
      }
    } catch {
      showToast('Error creating category.', 'error');
    } finally {
      setCreatingCat(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide a product title/name.');
      return;
    }

    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid selling price.');
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      botanical_name: formData.botanicalName.trim(),
      category: formData.category,
      tag: formData.tag.trim(),
      price: numPrice,
      original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : numPrice,
      discount: parseInt(formData.discount, 10) || 0,
      stock_quantity: parseInt(formData.stockQuantity, 10) >= 0 ? parseInt(formData.stockQuantity, 10) : (formData.inStock ? 25 : 0),
      in_stock: formData.inStock,
      light: formData.light,
      water: formData.water,
      pet_friendly: formData.petFriendly,
      air_purifying: formData.airPurifying,
      maintenance: formData.maintenance,
      room: formData.room,
      description: formData.description.trim(),
      image: formData.image || '/images/plants/snake_plant.png',
      image_hover: formData.imageHover || formData.image || '/images/plants/snake_plant.png',
      rating: parseFloat(formData.rating) || 5.0,
      reviews_count: parseInt(formData.reviewsCount, 10) || 0
    };

    try {
      let res;
      if (isEdit) {
        res = await updateProduct(productId, payload);
      } else {
        res = await createProduct(payload);
      }

      if (res && res.status === 'success') {
        showToast(
          isEdit
            ? `Product "${formData.name}" updated successfully!`
            : `Product "${formData.name}" created successfully!`,
          'success'
        );
        // Short pause then redirect back to Product Management
        setTimeout(() => {
          onNavigate('/admin/products');
        }, 800);
      } else {
        setError(res?.message || 'Failed to save product. Please check input values.');
      }
    } catch (err) {
      setError('Network connection error while saving product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      activeNav="products"
      onNavigate={onNavigate}
      onLogout={onLogout}
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
        <button
          type="button"
          className="itmu-bc-link"
          onClick={() => onNavigate('/admin/products')}
        >
          Product Management
        </button>
        <span className="itmu-bc-slash">&gt;</span>
        <span className="itmu-bc-active">
          {isEdit ? `Edit: ${formData.name || 'Product #' + productId}` : 'Add New Product'}
        </span>
      </div>

      {/* Header bar with Back and Save buttons */}
      <section className="itmu-form-header-bar">
        <div className="itmu-form-header-left">
          <button
            type="button"
            className="itmu-btn-back"
            onClick={() => onNavigate('/admin/products')}
            title="Return to Product Management"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
          <div>
            <h1 className="itmu-page-title" style={{ fontSize: '1.6rem', margin: 0 }}>
              {isEdit ? `Edit Product: ${formData.name || productId}` : 'Create New Product'}
            </h1>
            <p className="itmu-page-subtitle" style={{ margin: '4px 0 0' }}>
              {isEdit
                ? 'Update pricing, care requirements, taxonomy, and inventory details.'
                : 'Add a new plant variety, seed pack, planter, or fertilizer to the nursery storefront.'}
            </p>
          </div>
        </div>

        <div className="itmu-form-header-actions">
          <button
            type="button"
            className="itmu-btn-outline"
            onClick={() => onNavigate('/admin/products')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="itmu-btn-primary"
            onClick={handleSubmit}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <span className="itmu-micro-spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="itmu-form-error-banner">
          <AlertTriangle size={20} color="#DC2626" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="itmu-panel itmu-loading-box">
          <div className="itmu-admin-spinner" style={{ width: 36, height: 36 }} />
          <p style={{ marginTop: 14, color: '#146B3A', fontWeight: 600 }}>
            Loading product data from database...
          </p>
        </div>
      ) : (
        /* ================= 2-COLUMN FORM LAYOUT ================= */
        <div className="itmu-product-form-layout">
          {/* LEFT: Multi-Card Form Fields */}
          <div className="itmu-form-main-col">
            <form onSubmit={handleSubmit}>
              {/* Card 1: Basic Information */}
              <div className="itmu-panel itmu-form-card">
                <div className="itmu-form-card-head">
                  <div className="itmu-form-card-icon">
                    <Package size={18} color="#146B3A" />
                  </div>
                  <div>
                    <h3>Basic Information</h3>
                    <p>Product name, taxonomy, department category, and badges</p>
                  </div>
                </div>

                <div className="itmu-form-grid-2">
                  {/* Product Title / Name */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">
                      Product Name <span className="itmu-req">*</span>
                    </label>
                    <input
                      type="text"
                      className="itmu-input"
                      placeholder="e.g. Snake Plant Golden"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                    <small className="itmu-field-hint">The commercial name displayed on product cards.</small>
                  </div>

                  {/* Botanical Name */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Botanical Latin Name</label>
                    <input
                      type="text"
                      className="itmu-input"
                      placeholder="e.g. Sansevieria trifasciata 'Laurentii'"
                      value={formData.botanicalName}
                      onChange={(e) => handleChange('botanicalName', e.target.value)}
                    />
                    <small className="itmu-field-hint">Scientific Latin botanical name (italicized).</small>
                  </div>
                </div>

                <div className="itmu-form-grid-2" style={{ marginTop: 16 }}>
                  {/* Category with Add New option */}
                  <div className="itmu-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="itmu-label" style={{ margin: 0 }}>
                        Category <span className="itmu-req">*</span>
                      </label>
                      <button
                        type="button"
                        className="itmu-btn-link-action"
                        onClick={() => setShowNewCatModal(true)}
                      >
                        <Plus size={13} />
                        <span>Add New Category</span>
                      </button>
                    </div>
                    <select
                      className="itmu-input"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badge / Tag */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Promotional Tag / Badge</label>
                    <select
                      className="itmu-input"
                      value={formData.tag}
                      onChange={(e) => handleChange('tag', e.target.value)}
                    >
                      <option value="">None (Standard)</option>
                      <option value="Bestseller">Bestseller (Green Badge)</option>
                      <option value="Trending">Trending (Purple Badge)</option>
                      <option value="Top Rated">Top Rated (Blue Badge)</option>
                      <option value="New Arrival">New Arrival (Mint Badge)</option>
                      <option value="Sale">Sale (Orange Badge)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="itmu-field-group" style={{ marginTop: 16 }}>
                  <label className="itmu-label">Product Description & Care Story</label>
                  <textarea
                    rows={4}
                    className="itmu-input itmu-textarea"
                    placeholder="Describe the plant's aesthetic, natural habitat, NASA air-purifying qualities, or care nuances..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                  <small className="itmu-field-hint">
                    {formData.description.length} characters entered.
                  </small>
                </div>
              </div>

              {/* Card 2: Pricing & Stock Inventory */}
              <div className="itmu-panel itmu-form-card" style={{ marginTop: 20 }}>
                <div className="itmu-form-card-head">
                  <div className="itmu-form-card-icon">
                    <IndianRupee size={18} color="#146B3A" />
                  </div>
                  <div>
                    <h3>Pricing & Stock Availability</h3>
                    <p>Set selling price, original MRP, discount percentages, and inventory status</p>
                  </div>
                </div>

                <div className="itmu-form-grid-3">
                  {/* Selling Price */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">
                      Selling Price (₹) <span className="itmu-req">*</span>
                    </label>
                    <div className="itmu-input-addon-wrap">
                      <span className="itmu-input-addon">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="itmu-input itmu-input-with-addon"
                        placeholder="399"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Original MRP */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Original Price / MRP (₹)</label>
                    <div className="itmu-input-addon-wrap">
                      <span className="itmu-input-addon">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="itmu-input itmu-input-with-addon"
                        placeholder="599"
                        value={formData.originalPrice}
                        onChange={(e) => handleChange('originalPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Discount % (auto-calculated) */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Discount %</label>
                    <div className="itmu-input-addon-wrap">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="itmu-input itmu-input-with-addon"
                        placeholder="33"
                        value={formData.discount}
                        onChange={(e) => handleChange('discount', e.target.value)}
                      />
                      <span className="itmu-input-addon" style={{ right: 0, left: 'auto', borderLeft: '1px solid #D1E7DD', borderRight: 'none' }}>
                        % OFF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="itmu-form-grid-3" style={{ marginTop: 18 }}>
                  {/* Stock Quantity */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Stock Quantity (Units) <span className="itmu-req">*</span></label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="itmu-input"
                      placeholder="20"
                      value={formData.stockQuantity !== undefined ? formData.stockQuantity : 25}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handleChange('stockQuantity', e.target.value);
                        if (!isNaN(val)) {
                          handleChange('inStock', val > 0);
                        }
                      }}
                    />
                    <small className="itmu-field-hint">Setting to 0 automatically marks item Out of Stock.</small>
                  </div>

                  {/* In Stock Toggle */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Stock Status</label>
                    <div
                      className={`itmu-stock-toggle-box ${formData.inStock ? 'itmu-stock-box--in' : 'itmu-stock-box--out'}`}
                      onClick={() => handleChange('inStock', !formData.inStock)}
                    >
                      <button
                        type="button"
                        className={`itmu-stock-switch ${formData.inStock ? 'itmu-stock-switch--on' : 'itmu-stock-switch--off'}`}
                      >
                        <span className="itmu-stock-switch-knob">
                          {formData.inStock ? (
                            <Check size={12} color="#064E35" strokeWidth={3} />
                          ) : (
                            <X size={12} color="#DC2626" strokeWidth={3} />
                          )}
                        </span>
                      </button>
                      <div>
                        <strong>{formData.inStock ? 'In Stock (Live on Store)' : 'Out of Stock (Hidden/Disabled)'}</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                          {formData.inStock
                            ? 'Customers can add this item to cart and proceed to checkout.'
                            : 'Marked as sold out; customers cannot place orders.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room Placement */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Ideal Room Placement</label>
                    <select
                      className="itmu-input"
                      value={formData.room}
                      onChange={(e) => handleChange('room', e.target.value)}
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Balcony">Balcony & Terrace</option>
                      <option value="Workspace">Workspace / Desk</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="Dining Room">Dining Room</option>
                      <option value="Garden">Outdoor Garden</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Care Requirements & Environmental Attributes */}
              <div className="itmu-panel itmu-form-card" style={{ marginTop: 20 }}>
                <div className="itmu-form-card-head">
                  <div className="itmu-form-card-icon">
                    <Sun size={18} color="#146B3A" />
                  </div>
                  <div>
                    <h3>Plant Care & Environmental Specs</h3>
                    <p>Light levels, watering cycles, maintenance difficulty, and NASA safety badges</p>
                  </div>
                </div>

                <div className="itmu-form-grid-3">
                  {/* Light Level */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Light Requirement</label>
                    <select
                      className="itmu-input"
                      value={formData.light}
                      onChange={(e) => handleChange('light', e.target.value)}
                    >
                      <option value="Bright Indirect Sunlight">Bright Indirect Sunlight</option>
                      <option value="Low Light to Bright Indirect">Low Light to Bright Indirect</option>
                      <option value="Low-Light Tolerant">Low-Light Tolerant</option>
                      <option value="Direct Sunlight">Direct Sunlight (4-6 hrs)</option>
                      <option value="Partial Shade">Partial Shade</option>
                    </select>
                  </div>

                  {/* Watering Schedule */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Watering Frequency</label>
                    <select
                      className="itmu-input"
                      value={formData.water}
                      onChange={(e) => handleChange('water', e.target.value)}
                    >
                      <option value="Once a week">Once a week</option>
                      <option value="Once every 2 weeks">Once every 2 weeks</option>
                      <option value="Keep soil moist">Keep soil evenly moist</option>
                      <option value="When top 2 inches dry">When top 2" dry</option>
                      <option value="Low water (Drought hardy)">Low water (Drought hardy)</option>
                    </select>
                  </div>

                  {/* Maintenance Level */}
                  <div className="itmu-field-group">
                    <label className="itmu-label">Maintenance Difficulty</label>
                    <select
                      className="itmu-input"
                      value={formData.maintenance}
                      onChange={(e) => handleChange('maintenance', e.target.value)}
                    >
                      <option value="Easy / Low Maintenance">Easy / Low Maintenance</option>
                      <option value="Moderate Care">Moderate Care</option>
                      <option value="Requires Attention">Requires Attention</option>
                      <option value="Zero Maintenance">Zero Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes: Pet Friendly & Air Purifying */}
                <div className="itmu-form-grid-2" style={{ marginTop: 18 }}>
                  <label className="itmu-checkbox-card">
                    <input
                      type="checkbox"
                      className="itmu-checkbox"
                      checked={formData.airPurifying}
                      onChange={(e) => handleChange('airPurifying', e.target.checked)}
                    />
                    <div style={{ marginLeft: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Wind size={16} color="#146B3A" />
                        <strong>Air Purifying Plant</strong>
                      </div>
                      <small style={{ color: '#64748B' }}>
                        Removes indoor VOCs (formaldehyde, xylene, benzene).
                      </small>
                    </div>
                  </label>

                  <label className="itmu-checkbox-card">
                    <input
                      type="checkbox"
                      className="itmu-checkbox"
                      checked={formData.petFriendly}
                      onChange={(e) => handleChange('petFriendly', e.target.checked)}
                    />
                    <div style={{ marginLeft: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Heart size={16} color="#146B3A" />
                        <strong>100% Pet Friendly</strong>
                      </div>
                      <small style={{ color: '#64748B' }}>
                        Non-toxic and safe around curious cats and dogs.
                      </small>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card 4: Imagery & Preset Selector */}
              <div className="itmu-panel itmu-form-card" style={{ marginTop: 20 }}>
                <div className="itmu-form-card-head">
                  <div className="itmu-form-card-icon">
                    <ImageIcon size={18} color="#146B3A" />
                  </div>
                  <div>
                    <h3>Imagery & Visual Presets</h3>
                    <p>Select from pre-configured nursery botanical photography or enter custom URLs</p>
                  </div>
                </div>

                {/* 1-Click Nursery Preset Images */}
                <div style={{ marginBottom: 16 }}>
                  <label className="itmu-label" style={{ marginBottom: 8, display: 'block' }}>
                    1-Click Nursery Botanical Presets
                  </label>
                  <div className="itmu-preset-images-grid">
                    {PRESET_PLANT_IMAGES.map((preset) => {
                      const isSelected = formData.image === preset.path;
                      return (
                        <div
                          key={preset.path}
                          className={`itmu-preset-item ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            handleChange('image', preset.path);
                            if (!formData.imageHover) handleChange('imageHover', preset.path);
                          }}
                        >
                          <img
                            src={preset.path}
                            alt={preset.name}
                            className="itmu-preset-thumb"
                          />
                          <span className="itmu-preset-name">{preset.name}</span>
                          {isSelected && (
                            <span className="itmu-preset-check">
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Image URL Input */}
                <div className="itmu-form-grid-2">
                  <div className="itmu-field-group">
                    <label className="itmu-label">Main Image URL / Asset Path</label>
                    <input
                      type="text"
                      className="itmu-input"
                      placeholder="/images/plants/snake_plant.png or https://..."
                      value={formData.image}
                      onChange={(e) => handleChange('image', e.target.value)}
                    />
                  </div>

                  <div className="itmu-field-group">
                    <label className="itmu-label">Hover Image URL (Optional)</label>
                    <input
                      type="text"
                      className="itmu-input"
                      placeholder="Alternate photo on hover..."
                      value={formData.imageHover}
                      onChange={(e) => handleChange('imageHover', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Social Proof & Metrics */}
              <div className="itmu-panel itmu-form-card" style={{ marginTop: 20 }}>
                <div className="itmu-form-card-head">
                  <div className="itmu-form-card-icon">
                    <Sparkles size={18} color="#146B3A" />
                  </div>
                  <div>
                    <h3>Ratings & Social Proof</h3>
                    <p>Initial customer rating and review counters</p>
                  </div>
                </div>

                <div className="itmu-form-grid-2">
                  <div className="itmu-field-group">
                    <label className="itmu-label">Initial Star Rating (1.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      className="itmu-input"
                      value={formData.rating}
                      onChange={(e) => handleChange('rating', e.target.value)}
                    />
                  </div>

                  <div className="itmu-field-group">
                    <label className="itmu-label">Verified Reviews Count</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="itmu-input"
                      value={formData.reviewsCount}
                      onChange={(e) => handleChange('reviewsCount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="itmu-form-bottom-actions">
                <button
                  type="button"
                  className="itmu-btn-outline"
                  onClick={() => onNavigate('/admin/products')}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="itmu-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="itmu-micro-spinner" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Storefront Card Preview (Sticky) */}
          <div className="itmu-form-preview-col">
            <div className="itmu-preview-sticky-card">
              <div className="itmu-preview-sticky-head">
                <Eye size={16} color="#146B3A" />
                <span>Live Storefront Preview</span>
              </div>

              <div className="itmu-store-card-preview">
                {/* Image & Badges */}
                <div className="itmu-store-preview-media">
                  <img
                    src={formData.image || '/images/plants/snake_plant.png'}
                    alt={formData.name || 'Plant'}
                    className="itmu-store-preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/plants/snake_plant.png';
                    }}
                  />
                  {formData.tag && (
                    <span className="itmu-store-preview-badge">
                      {formData.tag}
                    </span>
                  )}
                  <span
                    className={`itmu-store-preview-stock ${formData.inStock ? 'in' : 'out'}`}
                  >
                    {formData.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Details */}
                <div className="itmu-store-preview-content">
                  <span className="itmu-store-preview-cat">{formData.category}</span>
                  <h4 className="itmu-store-preview-title">
                    {formData.name || 'Untitled Plant Product'}
                  </h4>
                  {formData.botanicalName && (
                    <p className="itmu-store-preview-botanical">
                      <em>{formData.botanicalName}</em>
                    </p>
                  )}

                  {/* Rating */}
                  <div className="itmu-store-preview-rating">
                    <span style={{ color: '#F59E0B' }}>★</span>
                    <strong>{Number(formData.rating || 5.0).toFixed(1)}</strong>
                    <span>({formData.reviewsCount || 0} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="itmu-store-preview-price-row">
                    <strong className="itmu-store-preview-price">
                      ₹ {Number(formData.price || 0).toLocaleString('en-IN')}
                    </strong>
                    {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                      <span className="itmu-store-preview-orig">
                        ₹ {Number(formData.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    {formData.discount ? (
                      <span className="itmu-discount-tag">{formData.discount}% OFF</span>
                    ) : null}
                  </div>

                  {/* Care attributes */}
                  <div className="itmu-store-preview-care-pills">
                    <span title="Sunlight">☀️ {formData.light.split(' ')[0]}</span>
                    <span title="Water">💧 {formData.water.split(' ')[0]}</span>
                    <span title="Room">🏠 {formData.room}</span>
                  </div>

                  {/* Mock Add to Cart button */}
                  <button
                    type="button"
                    className="itmu-store-preview-add-btn"
                    disabled={!formData.inStock}
                  >
                    {formData.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>

              <div className="itmu-preview-note">
                <small>
                  💡 <strong>Real-Time Sync:</strong> The card updates live as you edit the fields. Customers will see this exact card in the nursery catalog.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD NEW CATEGORY INLINE MODAL ================= */}
      {showNewCatModal && (
        <div className="itmu-modal-backdrop" onClick={() => setShowNewCatModal(false)}>
          <div className="itmu-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="itmu-confirm-modal-icon" style={{ backgroundColor: '#E8F5E9', color: '#146B3A' }}>
              <Layers size={24} color="#146B3A" />
            </div>

            <h3 className="itmu-confirm-modal-title">Create New Category</h3>
            <p className="itmu-confirm-modal-desc">
              Add a new product category to organize your nursery catalog.
            </p>

            <form onSubmit={handleCreateCategory} style={{ marginTop: 16 }}>
              <div className="itmu-field-group" style={{ textAlign: 'left', marginBottom: 14 }}>
                <label className="itmu-label">Category Name <span className="itmu-req">*</span></label>
                <input
                  type="text"
                  className="itmu-input"
                  placeholder="e.g. Rare Succulents"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="itmu-field-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                <label className="itmu-label">Description (Optional)</label>
                <input
                  type="text"
                  className="itmu-input"
                  placeholder="Brief description of this collection..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
              </div>

              <div className="itmu-confirm-modal-buttons">
                <button
                  type="button"
                  className="itmu-btn-outline"
                  onClick={() => setShowNewCatModal(false)}
                  disabled={creatingCat}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="itmu-btn-primary"
                  disabled={creatingCat || !newCatName.trim()}
                >
                  {creatingCat ? 'Creating...' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
