export const services = [
  { id: 'farmart_mart', title: 'Farmart Mart', subtitle: 'Daily Grocery & Staples', icon: 'basket-outline', color: '#16a34a', bg: '#dcfce7' },
  { id: 'farm_harvest', title: 'Direct Farm Harvest', subtitle: 'Fresh Veggies & Fruits', icon: 'leaf-outline', color: '#15803d', bg: '#ecfdf5' },
  { id: 'homerestro', title: 'Home Restro Meals', subtitle: 'Authentic Home Thalis', icon: 'restaurant-outline', color: '#ea580c', bg: '#ffedd5' },
  { id: 'bakery_sweets', title: 'Bakery & Sweets', subtitle: 'Fresh Baked & Desserts', icon: 'gift-outline', color: '#ec4899', bg: '#fce7f3' },
  { id: 'handmade_care', title: 'Women Handmade', subtitle: 'Soaps, Spices & Crafts', icon: 'heart-outline', color: '#8b5cf6', bg: '#f3e8ff' },
  { id: 'village_hub', title: 'Village Commerce', subtitle: 'Local Hub Services', icon: 'home-outline', color: '#0284c7', bg: '#e0f2fe' }
];

export const categories = [
  { id: 'all', name: 'All Services', icon: 'grid-outline' },
  { id: 'grocery', name: 'Farmart Mart', icon: 'basket-outline' },
  { id: 'veggies', name: 'Farm Veggies', icon: 'leaf-outline' },
  { id: 'fruits', name: 'Fresh Fruits', icon: 'sunny-outline' },
  { id: 'dairy', name: 'Dairy & Ghee', icon: 'water-outline' },
  { id: 'homerestro', name: 'Home Food & Thali', icon: 'restaurant-outline' },
  { id: 'bakery', name: 'Fresh Bakery', icon: 'disc-outline' },
  { id: 'sweets', name: 'Desi Sweets', icon: 'gift-outline' },
  { id: 'handmade', name: 'Handmade Care', icon: 'heart-outline' }
];

export const products = [
  // 1. Direct Farm Harvest (Veggies & Fruits)
  {
    id: 'p1',
    name: 'Farm Fresh Organic Red Tomatoes',
    category: 'veggies',
    service: 'farm_harvest',
    price: 38,
    unit: 'kg',
    rating: 4.8,
    reviewsCount: 142,
    farmer: 'Sukhwinder Singh (Tarn Taran Farm)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    description: 'Naturally ripened, pesticides-free farm fresh tomatoes harvested daily at dawn.',
    discount: '15% OFF',
    inStock: true
  },
  {
    id: 'p4',
    name: 'Kinnow Mandarin Fresh Fruits',
    category: 'fruits',
    service: 'farm_harvest',
    price: 75,
    unit: 'kg',
    rating: 4.7,
    reviewsCount: 88,
    farmer: 'Gurpreet Orchards (Abohar)',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80',
    description: 'Juicy, vitamin-C rich Kinnow freshly picked from Abohar orchards.',
    discount: 'FARM FRESH',
    inStock: true
  },
  {
    id: 'p9',
    name: 'Crisp Punjab Green Spinach (Palak)',
    category: 'veggies',
    service: 'farm_harvest',
    price: 25,
    unit: 'bunch (250g)',
    rating: 4.9,
    reviewsCount: 76,
    farmer: 'Harpreet Organics (Amritsar)',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
    description: 'Tender green iron-rich spinach leaves harvested fresh without synthetic chemicals.',
    discount: 'MORNING HARVEST',
    inStock: true
  },
  {
    id: 'p10',
    name: 'Royal Shimla Red Apples',
    category: 'fruits',
    service: 'farm_harvest',
    price: 160,
    unit: 'kg',
    rating: 4.9,
    reviewsCount: 110,
    farmer: 'Himachal Farm Producer Co-Op',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    description: 'Sweet, crunchy high-altitude Shimla apples directly sourced from mountain orchards.',
    discount: 'PREMIUM',
    inStock: true
  },

  // 2. Farmart Mart (Grocery & Daily Essentials)
  {
    id: 'p2',
    name: 'Pure Desi Cow Ghee (A2 Bilona)',
    category: 'dairy',
    service: 'farmart_mart',
    price: 650,
    unit: '500g',
    rating: 4.9,
    reviewsCount: 289,
    farmer: 'Farmart Dairy Cooperative',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80',
    description: 'Traditionally churned Bilona method A2 cow ghee with authentic aroma and granular texture.',
    discount: 'TOP SELLER',
    inStock: true
  },
  {
    id: 'p8',
    name: 'Organic Whole Sharbati Wheat Atta',
    category: 'grocery',
    service: 'farmart_mart',
    price: 290,
    unit: '5kg',
    rating: 4.9,
    reviewsCount: 154,
    farmer: 'Village Hub Farmers Network',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80',
    description: 'Chakki fresh stone-ground MP Sharbati wheat flour packed with natural bran fibers.',
    discount: 'CHAKKI FRESH',
    inStock: true
  },
  {
    id: 'p11',
    name: 'Cold-Pressed Kachi Ghani Mustard Oil',
    category: 'grocery',
    service: 'farmart_mart',
    price: 195,
    unit: '1 Liter',
    rating: 4.8,
    reviewsCount: 98,
    farmer: 'Farmart Agro Mills',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Pure wood-pressed mustard oil with pungent natural aroma and zero chemical refining.',
    discount: '100% PURE',
    inStock: true
  },
  {
    id: 'p12',
    name: 'Aromatic Aged Royal Basmati Rice',
    category: 'grocery',
    service: 'farmart_mart',
    price: 480,
    unit: '5kg',
    rating: 4.9,
    reviewsCount: 210,
    farmer: 'Gurdaspur Paddy Growers',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Extra long grain 2-year aged Basmati rice with heavenly fragrance.',
    discount: 'AGED GRAIN',
    inStock: true
  },

  // 3. Home Restro Meals (Certified Women Chefs)
  {
    id: 'p3',
    name: 'Special Punjabi Rajma Rice Thali',
    category: 'homerestro',
    service: 'homerestro',
    price: 130,
    unit: 'thali',
    rating: 4.9,
    reviewsCount: 95,
    farmer: 'Chef Sunita Sharma (Women Entrepreneur)',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    description: 'Rich Punjabi Rajma cooked in pure ghee, served with Basmati rice, 2 Tandoori Rotis & Raita.',
    discount: 'BEST HOME THALI',
    inStock: true
  },
  {
    id: 'p13',
    name: 'Authentic Sarson Saag & Makki Roti Meal',
    category: 'homerestro',
    service: 'homerestro',
    price: 160,
    unit: 'meal',
    rating: 5.0,
    reviewsCount: 132,
    farmer: 'Chef Manjeet Kaur (Home Restro)',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    description: 'Slow-cooked Mustard Greens with White Butter (Makhan), 2 Makki Rotis and Jaggery.',
    discount: 'PUNJABI SPECIAL',
    inStock: true
  },
  {
    id: 'p14',
    name: 'Homemade Paneer Butter Masala Combo',
    category: 'homerestro',
    service: 'homerestro',
    price: 150,
    unit: 'combo',
    rating: 4.8,
    reviewsCount: 84,
    farmer: 'Chef Sunita Sharma (Home Restro)',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh cottage cheese in creamy tomato butter gravy with 3 Butter Phulkas.',
    discount: 'FRESH COOKED',
    inStock: true
  },

  // 4. Bakery & Sweets
  {
    id: 'p5',
    name: 'Handmade Organic Gur Besan Ladoo',
    category: 'sweets',
    service: 'bakery_sweets',
    price: 240,
    unit: '500g',
    rating: 5.0,
    reviewsCount: 64,
    farmer: 'Manjeet Sweets (Women Entrepreneur)',
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional Besan Ladoo prepared using organic jaggery (Gur) and pure Desi Ghee.',
    discount: 'NO REFINED SUGAR',
    inStock: true
  },
  {
    id: 'p6',
    name: 'Freshly Baked Whole Wheat Bread',
    category: 'bakery',
    service: 'bakery_sweets',
    price: 45,
    unit: 'loaf',
    rating: 4.6,
    reviewsCount: 42,
    farmer: 'Farmart Community Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: '100% whole wheat soft bread baked daily without artificial preservatives.',
    discount: 'BAKED TODAY',
    inStock: true
  },
  {
    id: 'p15',
    name: 'Pure Kaju Katli Gift Box',
    category: 'sweets',
    service: 'bakery_sweets',
    price: 420,
    unit: '500g',
    rating: 4.9,
    reviewsCount: 175,
    farmer: 'Farmart Heritage Sweets',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
    description: 'Mouth-melting silver foil coated diamond Kaju Katli made from premium cashews.',
    discount: 'FESTIVAL SPECIAL',
    inStock: true
  },

  // 5. Women Entrepreneur Handmade Care
  {
    id: 'p7',
    name: 'Artisanal Organic Neem & Turmeric Soap',
    category: 'handmade',
    service: 'handmade_care',
    price: 90,
    unit: 'bar (125g)',
    rating: 4.8,
    reviewsCount: 37,
    farmer: 'Self-Help Women Group (Sangrur)',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=500&auto=format&fit=crop&q=80',
    description: 'Cold-pressed handmade herbal soap made with cold-pressed oils, pure neem and organic turmeric.',
    discount: '100% HERBAL',
    inStock: true
  },
  {
    id: 'p16',
    name: 'Handmade Kashmiri Garam Masala Blend',
    category: 'handmade',
    service: 'handmade_care',
    price: 140,
    unit: '200g',
    rating: 5.0,
    reviewsCount: 62,
    farmer: 'Kaur Spices (Women Entrepreneur)',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
    description: 'Hand-roasted whole spices stone-ground into intensely aromatic Garam Masala.',
    discount: 'HANDGROUND',
    inStock: true
  }
];

export const initialOrders = [
  {
    id: 'FMT-ORD-9821',
    date: 'Today, 11:30 AM',
    items: [
      { name: 'Farm Fresh Organic Red Tomatoes', qty: 2, price: 38 },
      { name: 'Pure Desi Cow Ghee (A2 Bilona)', qty: 1, price: 650 }
    ],
    total: 726,
    status: 'IN_TRANSIT',
    assignedRider: 'Vikram Singh (+91 98123 45678)',
    hubName: 'Village Hub - Ludhiana Rural',
    deliveryAddress: 'House 42, Model Town, City Center'
  }
];
