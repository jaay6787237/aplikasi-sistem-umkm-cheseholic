import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  calculateOrderTotals,
  buildWhatsAppMessage,
  Product,
  Outlet,
} from './orderCalculator';

const mockProducts: Product[] = [
  {
    id: 'lotus-biscoff',
    name: 'Lotus Biscoff',
    price: 25000,
    category: 'best',
    tag: 'BEST',
    headerColor: '#D01923',
    image: '/test.jpg',
    subtitle: 'Spiced biscuit',
    description: 'Cream cheese',
    stockStatus: 'limited',
  },
  {
    id: 'choco-cheese',
    name: 'Choco Cheese',
    price: 25000,
    category: 'choco',
    tag: 'DUO',
    headerColor: '#B87A1E',
    image: '/test.jpg',
    subtitle: 'Keju & cokelat',
    description: 'Separuh keju',
    stockStatus: 'ready',
  },
];

const mockOutlet: Outlet = {
  id: 'kedaton',
  number: 1,
  name: 'Outlet Kedaton',
  hours: '08.00 – 22.00 WIB',
  location: 'Seberang Eiger',
  address: 'Jl. ZA. Pagar Alam, Kedaton, Bandar Lampung',
  phoneDisplay: '0895-4114-22626',
  phoneRaw: '62895411422626',
  role: 'Pusat Kedaton',
  mapsUrl: 'https://maps.google.com',
  stockStatus: 'ready',
  stockBadge: 'Stok Ready',
};

test('formatRupiah correctly formats Indonesian currency', () => {
  assert.equal(formatRupiah(25000), 'Rp 25.000');
  assert.equal(formatRupiah(75000), 'Rp 75.000');
  assert.equal(formatRupiah(100000), 'Rp 100.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('calculateOrderTotals computes correct sum and box counts', () => {
  const cart = {
    'lotus-biscoff': 2,
    'choco-cheese': 1,
  };
  const result = calculateOrderTotals(cart, mockProducts);
  assert.equal(result.totalQty, 3);
  assert.equal(result.totalPrice, 75000);
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].subtotal, 50000);
  assert.equal(result.items[1].subtotal, 25000);
});

test('buildWhatsAppMessage creates proper Delivery template text', () => {
  const cart = {
    'lotus-biscoff': 2,
    'choco-cheese': 1,
  };
  const msg = buildWhatsAppMessage({
    mode: 'delivery',
    outlet: mockOutlet,
    cart,
    products: mockProducts,
    customer: {
      name: 'Budi Santoso',
      phone: '0812-3456-7890',
      address: 'Jl. Teuku Umar No. 45, Kedaton',
      pinpoint: 'Depan Apotek Kimia Farma',
      notes: 'Minta sendok kayu extra',
    },
  });

  assert.ok(msg.includes('🛵 METODE: Delivery Kurir / Ojol'));
  assert.ok(msg.includes('📍 OUTLET PENGIRIMAN: Outlet Kedaton'));
  assert.ok(msg.includes('👤 PENERIMA: Budi Santoso (0812-3456-7890)'));
  assert.ok(msg.includes('- 2x Lotus Biscoff (Rp 50.000)'));
  assert.ok(msg.includes('- 1x Choco Cheese (Rp 25.000)'));
  assert.ok(msg.includes('💰 TOTAL: Rp 75.000 (3 Box)'));
});

test('buildWhatsAppMessage creates proper Takeaway template text', () => {
  const cart = {
    'lotus-biscoff': 1,
  };
  const msg = buildWhatsAppMessage({
    mode: 'takeaway',
    outlet: mockOutlet,
    cart,
    products: mockProducts,
    customer: {
      name: 'Siti Rahma',
      phone: '0812-9876-5432',
      time: 'Hari ini, Pukul 15.00 WIB',
      notes: 'Disiapkan fresh ya min',
    },
  });

  assert.ok(msg.includes('🛍️ METODE: Takeaway (Ambil Sendiri di Outlet)'));
  assert.ok(msg.includes('⏰ ESTIMASI AMBIL: Hari ini, Pukul 15.00 WIB'));
  assert.ok(msg.includes('💰 TOTAL: Rp 25.000 (1 Box)'));
});
