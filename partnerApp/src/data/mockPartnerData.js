export const vendorProfile = {
  storeName: 'Sunita Home Restro & Sweets',
  ownerName: 'Chef Sunita Sharma',
  phone: '+91 98765 43210',
  category: 'homerestro', // homerestro, farmer, sweets_bakery, village_hub
  isStoreOpen: true,
  rating: 4.9,
  totalOrders: 184,
  pendingOrdersCount: 2,
  wednesdaySettlement: 3450
};

export const incomingCustomerOrders = [
  {
    id: 'FMT-ORD-9821',
    customerName: 'Harpreet Singh',
    customerPhone: '+91 98765 43210',
    time: '11:30 AM',
    items: [
      { name: 'Special Punjabi Rajma Thali', qty: 2, price: 130 },
      { name: 'Gur Besan Ladoo (500g)', qty: 1, price: 240 }
    ],
    total: 500,
    status: 'NEW_ORDER', // NEW_ORDER, ACCEPTED, PREPARING, READY_FOR_RIDER, COMPLETED
    deliveryType: 'Express Rider Dispatch'
  },
  {
    id: 'FMT-ORD-9829',
    customerName: 'Gurleen Kaur',
    customerPhone: '+91 98111 88776',
    time: '11:42 AM',
    items: [
      { name: 'Special Punjabi Rajma Thali', qty: 1, price: 130 }
    ],
    total: 130,
    status: 'ACCEPTED',
    deliveryType: 'Express Rider Dispatch'
  }
];

export const initialInventoryItems = [
  {
    id: 'v-item-1',
    name: 'Special Punjabi Rajma Thali',
    category: 'Home Restro',
    price: 130,
    unit: 'thali',
    stock: 25,
    isAvailable: true
  },
  {
    id: 'v-item-2',
    name: 'Organic Gur Besan Ladoo',
    category: 'Desi Sweets',
    price: 240,
    unit: '500g',
    stock: 15,
    isAvailable: true
  },
  {
    id: 'v-item-3',
    name: 'Pure Desi Cow Ghee (A2 Bilona)',
    category: 'Dairy',
    price: 650,
    unit: '500g',
    stock: 8,
    isAvailable: true
  }
];

export const settlementHistory = [
  { date: 'Wed, Aug 05, 2026', total: 4280, status: 'PAID', ref: 'UPI-FMT-99412' },
  { date: 'Wed, Jul 29, 2026', total: 3950, status: 'PAID', ref: 'UPI-FMT-88190' },
  { date: 'Wed, Jul 22, 2026', total: 5120, status: 'PAID', ref: 'UPI-FMT-77631' }
];
