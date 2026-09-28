export const PRODUCTS = [
  {
    id: "p1",
    name: "Snake Plant Golden",
    botanicalName: "Sansevieria trifasciata 'Laurentii'",
    category: "Indoor Plants",
    tag: "Bestseller",
    price: 399,
    originalPrice: 599,
    discount: 33,
    rating: 4.9,
    reviewsCount: 1420,
    inStock: true,
    light: "Low Light to Bright Indirect",
    water: "Once every 2 weeks",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Easy / Low Maintenance",
    room: "Bedroom",
    description: "The Golden Snake Plant is an un-killable indoor favourite known for its striking upright architectural leaves with vibrant yellow margins. Highly recommended by NASA for absorbing toxins like xylene, formaldehyde, and benzene.",
    image: "/images/plants/snake_plant.png",
    imageHover: "https://images.unsplash.com/photo-1599598425947-02064510b5f5?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/snake_plant.png",
      "https://images.unsplash.com/photo-1599598425947-02064510b5f5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "white", name: "White Self-Watering Pot", hex: "#FFFFFF", extraPrice: 0 },
      { id: "terracotta", name: "Terracotta Planter", hex: "#C86446", extraPrice: 100 },
      { id: "emerald", name: "Emerald Gloss Ceramic", hex: "#0A4C36", extraPrice: 200 }
    ],
    sizeOptions: ["Small (6\")", "Medium (8\")", "Large (10\")"],
    careSpecs: {
      sunlight: "Thrives in indirect sunlight. Can handle dark corners as well as bright spots.",
      watering: "Water only when top 75% of soil is dry. Overwatering is its only enemy.",
      humidity: "Tolerates normal room humidity.",
      fertilizer: "Feed with organic liquid fertilizer once every 2 months in spring & summer."
    }
  },
  {
    id: "p2",
    name: "Monstera Deliciosa (Swiss Cheese Plant)",
    botanicalName: "Monstera deliciosa",
    category: "Indoor Plants",
    tag: "Trending",
    price: 699,
    originalPrice: 999,
    discount: 30,
    rating: 4.8,
    reviewsCount: 980,
    inStock: true,
    light: "Bright Indirect Sunlight",
    water: "Once a week",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Easy / Moderate",
    room: "Living Room",
    description: "Iconic tropical plant famous for its lush perforated green leaves (fenestrations). A stunning focal piece for living rooms and office spaces that adds an instant jungle vibe.",
    image: "/images/plants/monstera.png",
    imageHover: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/monstera.png",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "emerald", name: "Emerald Self-Watering Pot", hex: "#0A4C36", extraPrice: 0 },
      { id: "matte-black", name: "Matte Black Ceramic", hex: "#222222", extraPrice: 250 },
      { id: "jute", name: "Natural Jute Basket Container", hex: "#D4A373", extraPrice: 150 }
    ],
    sizeOptions: ["Medium (8\")", "Large (12\")", "XL Specimen (14\")"],
    careSpecs: {
      sunlight: "Prefers medium to bright indirect sunlight. Keep away from harsh midday sun.",
      watering: "Water thoroughly when top 2 inches of soil feel dry.",
      humidity: "Loves high humidity. Wipe leaves with wet cloth once a week.",
      fertilizer: "Monthly organic plant food during growth season."
    }
  },
  {
    id: "p3",
    name: "Areca Palm Air Purifier",
    botanicalName: "Dypsis lutescens",
    category: "Outdoor Plants",
    tag: "Bestseller",
    price: 549,
    originalPrice: 799,
    discount: 31,
    rating: 4.9,
    reviewsCount: 1150,
    inStock: true,
    light: "Bright Indirect / Partial Sun",
    water: "2 times a week",
    petFriendly: true,
    airPurifying: true,
    maintenance: "Easy / Low Maintenance",
    room: "Balcony",
    description: "Feathery, arching fronds make the Areca Palm one of the best tropical indoor & balcony plants. Acts as a natural humidifier and air purifier for indoor environments.",
    image: "/images/plants/areca_palm.jpg",
    imageHover: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/areca_palm.jpg",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596724817765-414a623f7775?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "white", name: "Self-Watering White Pot", hex: "#FFFFFF", extraPrice: 0 },
      { id: "terracotta", name: "Terracotta Pot", hex: "#C86446", extraPrice: 120 }
    ],
    sizeOptions: ["Medium (8\")", "Large (10\")"],
    careSpecs: {
      sunlight: "Bright indirect light or filtered outdoor sunlight.",
      watering: "Keep soil moist but not waterlogged.",
      humidity: "Enjoys humid conditions.",
      fertilizer: "Feed monthly with nitrogen-rich fertilizer."
    }
  },
  {
    id: "p4",
    name: "ZZ Plant (Zamioculcas Zamiifolia)",
    botanicalName: "Zamioculcas zamiifolia",
    category: "Indoor Plants",
    tag: "Low Maintenance",
    price: 499,
    originalPrice: 699,
    discount: 28,
    rating: 4.9,
    reviewsCount: 860,
    inStock: true,
    light: "Low Light to Indirect Sun",
    water: "Once every 2-3 weeks",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Zero Effort / Beginner",
    room: "Workspace",
    description: "Waxy, glossy deep green foliage that retains water in underground rhizomes. Virtually indestructible plant perfect for busy lifestyle or low-light offices.",
    image: "/images/plants/zz_plant.png",
    imageHover: "https://images.unsplash.com/photo-1599598425947-02064510b5f5?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/zz_plant.png",
      "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599598425947-02064510b5f5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "white", name: "White Self-Watering Pot", hex: "#FFFFFF", extraPrice: 0 },
      { id: "pastel-pink", name: "Pastel Blush Pink", hex: "#F7CAD0", extraPrice: 150 }
    ],
    sizeOptions: ["Small (6\")", "Medium (8\")"],
    careSpecs: {
      sunlight: "Tolerates low light and fluorescent lighting easily.",
      watering: "Allow soil to dry out completely between waterings.",
      humidity: "Adapts well to low humidity.",
      fertilizer: "Minimal fertilizer required (every 3 months)."
    }
  },
  {
    id: "p5",
    name: "Peace Lily (Spathiphyllum)",
    botanicalName: "Spathiphyllum wallisii",
    category: "Flowering Plants",
    tag: "Air Purifier",
    price: 429,
    originalPrice: 599,
    discount: 28,
    rating: 4.7,
    reviewsCount: 740,
    inStock: true,
    light: "Medium to Low Indirect Light",
    water: "Once a week (droops when thirsty)",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Easy",
    room: "Bedroom",
    description: "Elegant dark foliage with pristine white spathe blooms. Famous for communicates its thirst by dramatically drooping and perking right back up when watered!",
    image: "/images/plants/peace_lily.png",
    imageHover: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/peace_lily.png",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "white", name: "White Self-Watering Pot", hex: "#FFFFFF", extraPrice: 0 },
      { id: "sage", name: "Sage Green Matte Pot", hex: "#87A96B", extraPrice: 150 }
    ],
    sizeOptions: ["Small (6\")", "Medium (8\")"],
    careSpecs: {
      sunlight: "Medium to low indirect light. Direct sun scorches leaves.",
      watering: "Water thoroughly when top soil feels dry.",
      humidity: "Prefers warm humid air.",
      fertilizer: "Feed every month during blooming season."
    }
  },
  {
    id: "p6",
    name: "Organic Heirloom Vegetable Seeds (Pack of 7)",
    botanicalName: "Capsicum, Tomato, Spinach, Coriander, Cucumber & More",
    category: "Seeds",
    tag: "Top Rated",
    price: 299,
    originalPrice: 499,
    discount: 40,
    rating: 4.9,
    reviewsCount: 2150,
    inStock: true,
    light: "Direct Sunlight",
    water: "Daily misting",
    petFriendly: true,
    airPurifying: false,
    maintenance: "Gardening Hobby",
    room: "Balcony",
    description: "100% Non-GMO, high-germination (90%+) organic vegetable seeds collection complete with sowing markers and step-by-step germination manual.",
    image: "/images/plants/heirloom_seeds.jpg",
    imageHover: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "seed-pack", name: "Standard Eco Pouch Pack", hex: "#87A96B", extraPrice: 0 }
    ],
    sizeOptions: ["Pack of 12 Varieties", "Pack of 24 Jumbo Edition"],
    careSpecs: {
      sunlight: "Sow in seed trays placed under bright morning sun.",
      watering: "Keep soil constantly moist with fine spray mister.",
      humidity: "Normal outdoor garden humidity.",
      fertilizer: "Use vermicompost upon 2nd set of leaves appearing."
    }
  },
  {
    id: "p7",
    name: "Ribbed Ceramic Self-Watering Planter (Set of 2)",
    botanicalName: "Premium Glazed Ceramic",
    category: "Pots & Planters",
    tag: "Modern Growth",
    price: 799,
    originalPrice: 1199,
    discount: 33,
    rating: 4.9,
    reviewsCount: 520,
    inStock: true,
    light: "N/A",
    water: "N/A",
    petFriendly: true,
    airPurifying: false,
    maintenance: "Durable",
    room: "Living Room",
    description: "Handcrafted ribbed ceramic pots featuring an inner cotton-wick self-watering mechanism that feeds plants for up to 14 days without manual watering.",
    image: "/images/plants/ribbed_planter.png",
    imageHover: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/ribbed_planter.png",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "cream", name: "Cream White & Gold", hex: "#FFFDD0", extraPrice: 0 },
      { id: "sage", name: "Sage Green Gloss", hex: "#87A96B", extraPrice: 0 },
      { id: "terracotta", name: "Warm Ochre", hex: "#C86446", extraPrice: 0 }
    ],
    sizeOptions: ["Medium (7\")", "Large (9\")"],
    careSpecs: {
      sunlight: "Indoor / Outdoor suitable",
      watering: "Fill bottom reservoir with clean water",
      humidity: "Weatherproof UV-resistant ceramic glaze",
      fertilizer: "N/A"
    }
  },
  {
    id: "p8",
    name: "e-haat Bio-Enriched Organic Potting Mix (5 KG)",
    botanicalName: "Coco Peat + Vermicompost + Perlite + Neem Cake",
    category: "Plant Care",
    tag: "Essential",
    price: 349,
    originalPrice: 499,
    discount: 30,
    rating: 4.9,
    reviewsCount: 3100,
    inStock: true,
    light: "Balcony / Garden",
    water: "Moist Soil",
    petFriendly: true,
    airPurifying: false,
    maintenance: "Ready to Use",
    room: "Balcony",
    description: "Premixed ready-to-use soil mix enriched with beneficial microbes, mycorrhizae, aerating perlite, and organic neem cake to prevent root rot and promote 3x faster growth.",
    image: "/images/categories/fertilizers.jpg",
    imageHover: "/images/categories/fertilizers.jpg",
    gallery: [
      "/images/categories/fertilizers.jpg",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "bag-5kg", name: "5 KG Eco Bag", hex: "#0A4C36", extraPrice: 0 }
    ],
    sizeOptions: ["5 KG Bag", "10 KG Value Pack (+ ₹250)", "20 KG Jumbo Pack (+ ₹550)"],
    careSpecs: {
      sunlight: "Balcony / Outdoor / Garden",
      watering: "Pre-moistened, lightweight formula with superior drainage",
      humidity: "Store in cool dry place",
      fertilizer: "Provides balanced nutrients for up to 6 months"
    }
  },
  {
    id: "p9",
    name: "Jade Plant (Crassula Ovata - Money Tree)",
    botanicalName: "Crassula ovata",
    category: "Indoor Plants",
    tag: "Good Fortune",
    price: 349,
    originalPrice: 499,
    discount: 30,
    rating: 4.8,
    reviewsCount: 1680,
    inStock: true,
    light: "Bright Sunlight / Direct Light",
    water: "Once every 10-14 days",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Succulent / Low Water",
    room: "Desk",
    description: "Famous Feng Shui succulent with fleshy coin-like emerald leaves symbolizing wealth and prosperity. Perfect compact desktop plant.",
    image: "/images/plants/jade_plant.jpg",
    imageHover: "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/jade_plant.jpg",
      "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "gold-trim", name: "Ceramic Gold Trim Pot", hex: "#FFD700", extraPrice: 100 },
      { id: "white", name: "Self-Watering White Pot", hex: "#FFFFFF", extraPrice: 0 }
    ],
    sizeOptions: ["Mini (4\")", "Small (6\")"],
    careSpecs: {
      sunlight: "Loves bright direct to indirect sunlight.",
      watering: "Water sparingly only when soil is completely bone dry.",
      humidity: "Prefers low humidity dry air.",
      fertilizer: "Diluted succulent food once every 2 months."
    }
  },
  {
    id: "p10",
    name: "Air Purifying Trio Plant Combo",
    botanicalName: "Snake Plant + Money Plant + Peace Lily",
    category: "Gifting & Combos",
    tag: "Super Saver",
    price: 999,
    originalPrice: 1597,
    discount: 37,
    rating: 5.0,
    reviewsCount: 890,
    inStock: true,
    light: "Low to Bright Indirect",
    water: "Weekly",
    petFriendly: false,
    airPurifying: true,
    maintenance: "Beginner Friendly",
    room: "Living Room",
    description: "Curated set of 3 NASA-certified air purifying plants packaged in matching modern self-watering planters. An ideal eco-friendly housewarming gift!",
    image: "/images/plants/snake_plant.png",
    imageHover: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "/images/plants/snake_plant.png",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800"
    ],
    potOptions: [
      { id: "combo-white", name: "Matching White Self-Watering Pots", hex: "#FFFFFF", extraPrice: 0 },
      { id: "combo-terracotta", name: "Warm Terracotta Pots", hex: "#C86446", extraPrice: 150 }
    ],
    sizeOptions: ["Standard Combo Set"],
    careSpecs: {
      sunlight: "Perfect for any room with medium to indirect light.",
      watering: "Water individually when topsoil is dry.",
      humidity: "Adaptable to all household humidity levels.",
      fertilizer: "Included 100g sample of Organic Seaweed Granules!"
    }
  }
];

export const CATEGORIES = [
  { id: "all", name: "All Products", },
  { id: "Indoor Plants", name: "Indoor Plants" },
  { id: "Outdoor Plants", name: "Outdoor Plants" },
  { id: "Flowering Plants", name: "Flowering Plants" },
  { id: "Seeds", name: "Seeds & Microgreens" },
  { id: "Pots & Planters", name: "Pots & Planters" },
  { id: "Plant Care", name: "Plant Care & Soil" },
  { id: "Gifting & Combos", name: "Gifting & Combos", }
];

export const CATEGORY_CIRCLES = [
  {
    id: "Indoor Plants",
    label: "Indoor Plants",
    badge: "Up to 40% OFF",
    img: "/images/categories/indoor_plants.jpg"
  },
  {
    id: "Seeds",
    label: "Seeds",
    badge: "Buy 2 Get 1",
    img: "/images/categories/seeds.jpg"
  },
  {
    id: "Pots & Planters",
    label: "Planters",
    badge: "New Arrival",
    img: "/images/categories/planters.jpg"
  },
  {
    id: "Plant Care",
    label: "Fertilizers",
    badge: "Organic",
    img: "/images/categories/fertilizers.jpg"
  },
  {
    id: "Gifting & Combos",
    label: "Gifting",
    badge: "Housewarming",
    img: "/images/categories/gifting.jpg"
  },
  {
    id: "low-light",
    label: "Low Light",
    badge: "Bedroom",
    img: "/images/categories/low_light.jpg"
  },
  {
    id: "pet-friendly",
    label: "Pet Safe",
    badge: "100% Safe",
    img: "/images/categories/pet_safe.jpg"
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    title: "Bring Nature Indoors",
    subtitle: "Lush Air Purifying Plants Grown with Love & Care",
    tagline: "INDIA'S PREMIUM ONLINE NURSERY",
    ctaText: "Shop Bestselling Plants",
    ctaLink: "Indoor Plants",
    bgGradient: "linear-gradient(135deg, rgba(10, 76, 54, 0.92) 0%, rgba(6, 56, 39, 0.85) 100%)",
    image: "/images/hero/bring_nature_indoors.jpg",
    badge: "FREE Delivery on ₹499+"
  },
  {
    id: 2,
    title: "Handcrafted Self-Watering Planters",
    subtitle: "Designed for Modern Homes. Never Worry About Overwatering Again.",
    tagline: "ELEGANT CERAMIC & ECO COLLECTION",
    ctaText: "Explore Pots & Planters",
    ctaLink: "Pots & Planters",
    bgGradient: "linear-gradient(135deg, rgba(20, 110, 75, 0.92) 0%, rgba(10, 76, 54, 0.85) 100%)",
    image: "/images/hero/self_watering_planters.png",
    badge: "AgriMart Quality Guarantee"
  },
  {
    id: 3,
    title: "Organic Gardening & Seeds",
    subtitle: "Grow Fresh Heirloom Vegetables & Herbs on Your Balcony",
    tagline: "100% NON-GMO HIGH GERMINATION SEEDS",
    ctaText: "Get Organic Seeds",
    ctaLink: "Seeds",
    bgGradient: "linear-gradient(135deg, rgba(26, 92, 60, 0.92) 0%, rgba(4, 40, 26, 0.88) 100%)",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200",
    badge: "Flat 40% OFF Combos"
  }
];

export const REVIEWS = [
  {
    id: "r1",
    name: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    date: "2 days ago",
    verified: true,
    title: "Unbelievable packaging! Delivered completely undamaged!",
    comment: "I was hesitant ordering live plants online, but ITMU e-haat blew my mind. The 5-layer eco packaging held the Monstera firm, and the soil was still damp. Leaves were super fresh!",
    productName: "Monstera Deliciosa",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "r2",
    name: "Ananya Roy",
    city: "Bengaluru",
    rating: 5,
    date: "1 week ago",
    verified: true,
    title: "The self-watering pots are a lifesaver",
    comment: "I travel frequently for work. The ribbed ceramic self-watering planter keeps my Snake plant hydrated for 2 weeks straight without issue. Premium quality!",
    productName: "Snake Plant Golden",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "r3",
    name: "Vikram Malhotra",
    city: "Delhi NCR",
    rating: 5,
    date: "3 weeks ago",
    verified: true,
    title: "Best seed germination rate I've ever experienced",
    comment: "Planted the organic spinach and coriander seeds in ITMU e-haat potting mix. Germinated in just 4 days! Extremely happy with the results.",
    productName: "Heirloom Seeds Pack",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  }
];

export const FAQS = [
  {
    q: "How does E-HAAT ensure plants stay safe during transit?",
    a: "We use a proprietary 5-Layer Eco Box structure with ventilated custom pot locks. This prevents any movement, keeps soil intact, and ensures your plant receives air flow during transit. We guarantee 100% healthy arrival or instant replacement!"
  },
  {
    q: "What is your 7-Day Plant Replacement Guarantee?",
    a: "If your plant arrives damaged or develops issues within 7 days of delivery, simply WhatsApp our Plant Doctor team at +91-9876543210 with a photo. We will send a free replacement immediately with zero hassle!"
  },
  {
    q: "How do self-watering pots work?",
    a: "Our self-watering pots have a dual-chamber design. Fill the bottom water reservoir, and the cotton wick slowly draws moisture into the roots as needed via capillary action. Perfect for avoiding root rot and overwatering."
  },
  {
    q: "Do you deliver pan-India? What is the shipping time?",
    a: "Yes! We ship across 20,000+ pincodes in India. Standard delivery takes 3 to 5 business days. Express pincode orders in tier-1 cities are delivered within 24 to 48 hours."
  }
];
