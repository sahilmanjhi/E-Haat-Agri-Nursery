// Category slug utilities and metadata mapping for ITMU e-Haat Agri Nursery

export const STANDARD_CATEGORIES = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'Indoor Plants', name: 'Indoor Plants', slug: 'indoor-plants' },
  { id: 'Flowering Plants', name: 'Flowering Plants', slug: 'flowering-plants' },
  { id: 'Fruits Plants', name: 'Fruits Plants', slug: 'fruits-plants' },
  { id: 'Vegetables Crops', name: 'Vegetables Crops', slug: 'vegetables-crops' },
  { id: 'Plant Care', name: 'Plant Care', slug: 'plant-care' }
];

/**
 * Convert any category name or alias to a canonical URL slug.
 */
export const categoryToSlug = (categoryName) => {
  if (!categoryName || categoryName === 'all' || categoryName === 'All Products') return 'all';
  const clean = String(categoryName).trim().toLowerCase();

  if (
    clean === 'flowering plants' || clean === 'flowering plant' ||
    clean === 'flowering-plants' || clean === 'flowers' || clean === 'flower' || clean === 'blooms'
  ) {
    return 'flowering-plants';
  }
  if (clean === 'indoor plants' || clean === 'indoor plant' || clean === 'indoor' || clean === 'indoor-plants') {
    return 'indoor-plants';
  }
  if (
    clean === 'fruits plants' || clean === 'fruit plants' || clean === 'fruit plant' ||
    clean === 'fruits plant' || clean === 'fruits' || clean === 'fruit' || clean === 'outdoor plants' ||
    clean === 'fruits-plants'
  ) {
    return 'fruits-plants';
  }
  if (
    clean === 'vegetables crops' || clean === 'vegetable crops' || clean === 'vegetable crop' ||
    clean === 'vegetables crop' || clean === 'vegetables' || clean === 'vegetable' || clean === 'seeds' ||
    clean === 'vegetables-crops'
  ) {
    return 'vegetables-crops';
  }
  if (clean === 'pots & planters' || clean === 'pots and planters' || clean === 'planters' || clean === 'pots') {
    return 'planters';
  }
  if (
    clean === 'plant care' || clean === 'plant care & soil' || clean === 'plant care and soil' ||
    clean === 'fertilizers' || clean === 'plant-care'
  ) {
    return 'plant-care';
  }
  if (
    clean === 'gifting & combos' || clean === 'gifting and combos' ||
    clean === 'gifting' || clean === 'combos' || clean === 'gifting-combos'
  ) {
    return 'gifting-combos';
  }

  // Generic fallback slugifier
  return clean
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Filter check: Does a product strictly belong to the given category slug/name?
 * Relies directly on product.category from the backend database (no leaky heuristics).
 */
export const isProductInCategory = (product, targetSlug, targetName = null) => {
  if (!product) return false;
  if (!targetSlug || targetSlug === 'all' || targetSlug === 'all-products') return true;

  const prodCat = product.category;
  if (!prodCat) return false;

  const pSlug = categoryToSlug(prodCat);

  // 1. Direct slug match
  if (pSlug === targetSlug) return true;

  // 2. Direct name match (case-insensitive)
  if (targetName && String(prodCat).trim().toLowerCase() === String(targetName).trim().toLowerCase()) {
    return true;
  }

  // 3. Normalized legacy slug equivalence (flowers <-> flowering-plants)
  if (
    (targetSlug === 'flowering-plants' || targetSlug === 'flowers') &&
    (pSlug === 'flowering-plants' || pSlug === 'flowers')
  ) {
    return true;
  }

  return false;
};

/**
 * Returns metadata (title, subtitle, banner badge, banner image, filter function)
 * for a category slug, dynamically prioritizing live database category records.
 */
export const getCategoryMeta = (slug, availableCategories = []) => {
  const normalized = (slug || 'all').toLowerCase().trim();

  // Find dynamic category match from DB categories
  const dynamicMatch = availableCategories.find(c => {
    const cName = typeof c === 'string' ? c : (c.name || c.id || '');
    return categoryToSlug(cName) === normalized || cName.toLowerCase() === normalized;
  });

  const matchedName = dynamicMatch
    ? (typeof dynamicMatch === 'string' ? dynamicMatch : dynamicMatch.name)
    : null;

  const matchedDesc = dynamicMatch && typeof dynamicMatch === 'object' && dynamicMatch.description
    ? dynamicMatch.description
    : null;

  // 1. All Products
  if (normalized === 'all' || normalized === 'all-products' || !slug) {
    return {
      id: 'all',
      slug: 'all',
      name: 'All Products',
      title: 'Complete Nursery Plants & Garden Collection',
      subtitle: 'Browse all farm-fresh indoor plants, vibrant flowering plants, fruit saplings, heirloom seeds, and garden essentials grown with care.',
      badge: 'NURSERY EXCLUSIVE',
      bannerImg: '/images/hero/bring_nature_indoors.jpg',
      filterFn: () => true
    };
  }

  // 2. Flowering Plants (legacy slug 'flowers' or 'flowering-plants')
  if (normalized === 'flowers' || normalized === 'flowering-plants' || normalized === 'flower') {
    const displayName = matchedName || 'Flowering Plants';
    return {
      id: displayName,
      slug: 'flowering-plants',
      name: displayName,
      title: 'Fresh Blooming Flowers & Flowering Plants',
      subtitle: matchedDesc || 'Brighten your home and garden with our vibrant, nursery-grown blooming flowers. Fresh, fragrant, and guaranteed healthy.',
      badge: 'FRESH BLOOMS',
      bannerImg: '/images/plants/peace_lily.png',
      filterFn: (p) => isProductInCategory(p, 'flowering-plants', displayName)
    };
  }

  // 3. Indoor Plants
  if (normalized === 'indoor-plants' || normalized === 'indoor') {
    const displayName = matchedName || 'Indoor Plants';
    return {
      id: displayName,
      slug: 'indoor-plants',
      name: displayName,
      title: 'Air-Purifying & Low-Maintenance Indoor Plants',
      subtitle: matchedDesc || 'NASA-recommended clean-air houseplants that thrive in indirect light, look stunning in modern interiors, and are easy to care for.',
      badge: 'BEST FOR INDOORS',
      bannerImg: '/images/categories/indoor_plants.jpg',
      filterFn: (p) => isProductInCategory(p, 'indoor-plants', displayName)
    };
  }

  // 4. Fruits Plants
  if (
    normalized === 'fruits-plants' || normalized === 'fruit-plants' ||
    normalized === 'fruits' || normalized === 'fruit' || normalized === 'outdoor-plants'
  ) {
    const displayName = matchedName || 'Fruits Plants';
    return {
      id: displayName,
      slug: 'fruits-plants',
      name: displayName,
      title: 'High-Yield Fruit Plants & Garden Flora',
      subtitle: matchedDesc || 'Harvest fresh homegrown fruits right from your balcony, terrace, or backyard. Hardy, all-season fruit trees acclimatized for Indian climates.',
      badge: 'TERRACE & GARDEN',
      bannerImg: '/images/plants/areca_palm.jpg',
      filterFn: (p) => isProductInCategory(p, 'fruits-plants', displayName)
    };
  }

  // 5. Vegetables Crops
  if (
    normalized === 'vegetables-crops' || normalized === 'vegetable-crops' ||
    normalized === 'vegetables' || normalized === 'vegetable' || normalized === 'seeds'
  ) {
    const displayName = matchedName || 'Vegetables Crops';
    return {
      id: displayName,
      slug: 'vegetables-crops',
      name: displayName,
      title: 'Organic Vegetable Crops & Heirloom Seeds',
      subtitle: matchedDesc || 'Grow your own healthy, chemical-free vegetables. Certified high-germination non-GMO heirloom seeds and fast-yielding kitchen garden crops.',
      badge: '100% NON-GMO ORGANIC',
      bannerImg: '/images/plants/heirloom_seeds.jpg',
      filterFn: (p) => isProductInCategory(p, 'vegetables-crops', displayName)
    };
  }

  // 6. Plant Care
  if (normalized === 'plant-care' || normalized === 'fertilizers') {
    const displayName = matchedName || 'Plant Care';
    return {
      id: displayName,
      slug: 'plant-care',
      name: displayName,
      title: 'Bio-Enriched Potting Soil & Plant Nutrition',
      subtitle: matchedDesc || 'Give your plants scientific nourishment with our nutrient-dense vermicompost, enriched potting soils, and organic fertilizers.',
      badge: 'NUTRITION & SOIL',
      bannerImg: '/images/categories/fertilizers.jpg',
      filterFn: (p) => isProductInCategory(p, 'plant-care', displayName)
    };
  }

  // 7. Pots & Planters
  if (normalized === 'planters' || normalized === 'pots-planters' || normalized === 'pots') {
    const displayName = matchedName || 'Pots & Planters';
    return {
      id: displayName,
      slug: 'planters',
      name: displayName,
      title: 'Self-Watering Pots & Handcrafted Planters',
      subtitle: matchedDesc || 'Modern self-watering wick planters and glazed ceramic pots designed to eliminate overwatering and elevate your interior decor.',
      badge: 'SELF-WATERING DESIGNS',
      bannerImg: '/images/hero/self_watering_planters.png',
      filterFn: (p) => isProductInCategory(p, 'planters', displayName)
    };
  }

  // 8. Gifting & Combos
  if (normalized === 'gifting-combos' || normalized === 'gifting') {
    const displayName = matchedName || 'Gifting & Combos';
    return {
      id: displayName,
      slug: 'gifting-combos',
      name: displayName,
      title: 'Curated Green Gifts & Plant Combos',
      subtitle: matchedDesc || 'Living gifts that keep on giving. Hand-assembled plant trios and sustainable gift hampers for birthdays, anniversaries, and festivities.',
      badge: 'GREEN GIFTING',
      bannerImg: '/images/hero/bring_nature_indoors.jpg',
      filterFn: (p) => isProductInCategory(p, 'gifting-combos', displayName)
    };
  }

  // 9. Dynamic/Custom categories added by Admin
  const finalName = matchedName || normalized.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    id: finalName,
    slug: normalized,
    name: finalName,
    title: `${finalName} Collection`,
    subtitle: matchedDesc || `Explore our nursery-grown ${finalName.toLowerCase()} selection with guaranteed freshness and doorstep delivery.`,
    badge: 'NURSERY FRESH',
    bannerImg: '/images/categories/indoor_plants.jpg',
    filterFn: (p) => isProductInCategory(p, normalized, finalName)
  };
};
