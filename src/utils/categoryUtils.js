// Category slug utilities and metadata mapping for ITMU e-Haat Agri Nursery

export const STANDARD_CATEGORIES = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'Indoor Plants', name: 'Indoor Plants', slug: 'indoor-plants' },
  { id: 'Flowers', name: 'Flowers', slug: 'flowers' },
  { id: 'Fruits Plants', name: 'Fruits Plants', slug: 'fruits-plants' },
  { id: 'Vegetables Crops', name: 'Vegetables Crops', slug: 'vegetables-crops' },
  { id: 'Pots & Planters', name: 'Pots & Planters', slug: 'planters' },
  { id: 'Plant Care', name: 'Plant Care', slug: 'plant-care' },
  { id: 'Gifting & Combos', name: 'Gifting & Combos', slug: 'gifting-combos' }
];

export const categoryToSlug = (categoryName) => {
  if (!categoryName || categoryName === 'all' || categoryName === 'All Products') return 'all';
  const clean = String(categoryName).trim().toLowerCase();

  if (clean === 'flowers' || clean === 'flowering plants' || clean === 'flower' || clean === 'blooms') {
    return 'flowers';
  }
  if (clean === 'indoor plants' || clean === 'indoor plant' || clean === 'indoor') {
    return 'indoor-plants';
  }
  if (
    clean === 'fruits plants' || clean === 'fruit plants' || clean === 'fruit plant' ||
    clean === 'fruits plant' || clean === 'fruits' || clean === 'fruit' || clean === 'outdoor plants'
  ) {
    return 'fruits-plants';
  }
  if (
    clean === 'vegetables crops' || clean === 'vegetable crops' || clean === 'vegetable crop' ||
    clean === 'vegetables crop' || clean === 'vegetables' || clean === 'vegetable' || clean === 'seeds'
  ) {
    return 'vegetables-crops';
  }
  if (clean === 'pots & planters' || clean === 'pots and planters' || clean === 'planters' || clean === 'pots') {
    return 'planters';
  }
  if (clean === 'plant care' || clean === 'plant care & soil' || clean === 'plant care and soil' || clean === 'fertilizers') {
    return 'plant-care';
  }
  if (clean === 'gifting & combos' || clean === 'gifting and combos' || clean === 'gifting' || clean === 'combos') {
    return 'gifting-combos';
  }

  // Generic fallback slugifier
  return clean
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getCategoryMeta = (slug, availableCategories = []) => {
  const normalized = (slug || 'all').toLowerCase().trim();

  // 1. All Products
  if (normalized === 'all' || normalized === 'all-products' || !slug) {
    return {
      id: 'all',
      slug: 'all',
      name: 'All Products',
      title: 'Complete Nursery Plants & Garden Collection',
      subtitle: 'Browse all farm-fresh indoor plants, vibrant flowers, fruit saplings, heirloom seeds, and garden essentials grown with care.',
      badge: 'NURSERY EXCLUSIVE',
      bannerImg: '/images/hero/bring_nature_indoors.jpg',
      filterFn: () => true
    };
  }

  // 2. Flowers / Flowering Plants
  if (normalized === 'flowers' || normalized === 'flowering-plants' || normalized === 'flower') {
    return {
      id: 'Flowers',
      slug: 'flowers',
      name: 'Flowers',
      title: 'Fresh Blooming Flowers & Flowering Plants',
      subtitle: 'Brighten your home and garden with our vibrant, nursery-grown blooming flowers. Fresh, fragrant, and guaranteed healthy.',
      badge: 'FRESH BLOOMS',
      bannerImg: '/images/plants/peace_lily.png',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        const tag = (p.tag || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          cat === 'flowers' ||
          cat.includes('flower') ||
          tag.includes('bloom') ||
          tag.includes('flower') ||
          name.includes('lily') ||
          name.includes('rose') ||
          name.includes('flower') ||
          name.includes('bloom')
        );
      }
    };
  }

  // 3. Indoor Plants
  if (normalized === 'indoor-plants' || normalized === 'indoor') {
    return {
      id: 'Indoor Plants',
      slug: 'indoor-plants',
      name: 'Indoor Plants',
      title: 'Air-Purifying & Low-Maintenance Indoor Plants',
      subtitle: 'NASA-recommended clean-air houseplants that thrive in indirect light, look stunning in modern interiors, and are easy to care for.',
      badge: 'BEST FOR INDOORS',
      bannerImg: '/images/categories/indoor_plants.jpg',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('indoor') || p.room === 'Living Room' || p.room === 'Bedroom' || p.room === 'Workspace' || p.airPurifying === true;
      }
    };
  }

  // 4. Fruits Plants
  if (
    normalized === 'fruits-plants' || normalized === 'fruit-plants' ||
    normalized === 'fruits' || normalized === 'fruit' || normalized === 'outdoor-plants'
  ) {
    return {
      id: 'Fruits Plants',
      slug: 'fruits-plants',
      name: 'Fruits Plants',
      title: 'High-Yield Fruit Plants & Garden Flora',
      subtitle: 'Harvest fresh homegrown fruits right from your balcony, terrace, or backyard. Hardy, all-season fruit trees acclimatized for Indian climates.',
      badge: 'TERRACE & GARDEN',
      bannerImg: '/images/plants/areca_palm.jpg',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          cat === 'fruits plants' ||
          cat === 'fruit plants' ||
          cat.includes('fruit') ||
          cat.includes('outdoor') ||
          /lemon|guava|mango|fruit|palm|papaya|banana|chikoo|pomegranate/i.test(name)
        );
      }
    };
  }

  // 5. Vegetables Crops
  if (
    normalized === 'vegetables-crops' || normalized === 'vegetable-crops' ||
    normalized === 'vegetables' || normalized === 'vegetable' || normalized === 'seeds'
  ) {
    return {
      id: 'Vegetables Crops',
      slug: 'vegetables-crops',
      name: 'Vegetables Crops',
      title: 'Organic Vegetable Crops & Heirloom Seeds',
      subtitle: 'Grow your own healthy, chemical-free vegetables. Certified high-germination non-GMO heirloom seeds and fast-yielding kitchen garden crops.',
      badge: '100% NON-GMO ORGANIC',
      bannerImg: '/images/plants/heirloom_seeds.jpg',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          cat === 'vegetables crops' ||
          cat === 'vegetable crops' ||
          cat.includes('vegetable') ||
          cat.includes('crop') ||
          cat.includes('seed') ||
          /seed|spinach|coriander|tomato|chili|vegetable|crop|brinjal|okra/i.test(name)
        );
      }
    };
  }

  // 6. Pots & Planters
  if (normalized === 'planters' || normalized === 'pots-planters' || normalized === 'pots') {
    return {
      id: 'Pots & Planters',
      slug: 'planters',
      name: 'Pots & Planters',
      title: 'Self-Watering Pots & Handcrafted Planters',
      subtitle: 'Modern self-watering wick planters and glazed ceramic pots designed to eliminate overwatering and elevate your interior decor.',
      badge: 'SELF-WATERING DESIGNS',
      bannerImg: '/images/hero/self_watering_planters.png',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('pot') || cat.includes('planter');
      }
    };
  }

  // 7. Plant Care
  if (normalized === 'plant-care' || normalized === 'fertilizers') {
    return {
      id: 'Plant Care',
      slug: 'plant-care',
      name: 'Plant Care',
      title: 'Bio-Enriched Potting Soil & Plant Nutrition',
      subtitle: 'Give your plants scientific nourishment with our nutrient-dense vermicompost, enriched potting soils, and organic fertilizers.',
      badge: 'NUTRITION & SOIL',
      bannerImg: '/images/categories/fertilizers.jpg',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('care') || cat.includes('soil') || cat.includes('mix') || cat.includes('fertilizer');
      }
    };
  }

  // 8. Gifting & Combos
  if (normalized === 'gifting-combos' || normalized === 'gifting') {
    return {
      id: 'Gifting & Combos',
      slug: 'gifting-combos',
      name: 'Gifting & Combos',
      title: 'Curated Green Gifts & Plant Combos',
      subtitle: 'Living gifts that keep on giving. Hand-assembled plant trios and sustainable gift hampers for birthdays, anniversaries, and festivities.',
      badge: 'GREEN GIFTING',
      bannerImg: '/images/hero/bring_nature_indoors.jpg',
      filterFn: (p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('gift') || cat.includes('combo');
      }
    };
  }

  // 9. Match against custom/dynamic categories
  const dynamicMatch = availableCategories.find(c => {
    const cName = typeof c === 'string' ? c : (c.name || c.id || '');
    return categoryToSlug(cName) === normalized;
  });

  const matchedName = dynamicMatch
    ? (typeof dynamicMatch === 'string' ? dynamicMatch : dynamicMatch.name)
    : normalized.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    id: matchedName,
    slug: normalized,
    name: matchedName,
    title: `${matchedName} Collection`,
    subtitle: `Explore our nursery-grown ${matchedName.toLowerCase()} selection with guaranteed freshness and doorstep delivery.`,
    badge: 'NURSERY FRESH',
    bannerImg: '/images/categories/indoor_plants.jpg',
    filterFn: (p) => {
      const pCat = (p.category || '').toLowerCase();
      return pCat === matchedName.toLowerCase() || categoryToSlug(p.category) === normalized;
    }
  };
};

