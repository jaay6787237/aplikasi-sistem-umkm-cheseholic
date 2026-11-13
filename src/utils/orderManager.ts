/**
 * Order Manager & Audio Notification Utilities for Cheeseholic
 */

import { Product } from './orderCalculator';

export type DeliveryMode = 'delivery' | 'takeaway';
export type PaymentMethod = 'QRIS' | 'Transfer BCA' | 'Transfer Mandiri' | 'Tunai di Outlet';
export type OrderStatus = 'Baru' | 'Diproses' | 'Siap' | 'Selesai' | 'Dibatalkan';

export interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface DirectOrder {
  id: string;
  createdAt: string;
  outletId: string;
  outletName: string;
  customerName: string;
  customerPhone: string;
  deliveryMode: DeliveryMode;
  address?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Lunas' | 'Menunggu Verifikasi' | 'Bayar di Tempat';
  items: OrderItem[];
  totalQty: number;
  totalPrice: number;
  status: OrderStatus;
  readByOutlet: boolean;
}

// Web Audio API Chime Synthesizer for instant audible alert when new order arrives
export function playOrderNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz) - Arpeggio Chime
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.45);
    });
  } catch (err) {
    console.warn('Audio notification sound could not play:', err);
  }
}

// Generate unique order ID
export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CH-${randomNum}`;
}

// Initial sample orders for demonstration & live outlet testing
export const INITIAL_DIRECT_ORDERS: DirectOrder[] = [
  {
    id: 'CH-8921',
    createdAt: 'Baru saja (14:32 WIB)',
    outletId: 'kedaton',
    outletName: 'Outlet Kedaton',
    customerName: 'Anisa Rahma',
    customerPhone: '0812-7890-4321',
    deliveryMode: 'delivery',
    address: 'Jl. ZA. Pagar Alam No. 12 (Samping Eiger), Kedaton',
    notes: 'Mohon cantumkan lilin ulang tahun 1 biji ya min',
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    items: [
      {
        productId: 'lotus-biscoff',
        productName: 'Lotus Biscoff',
        qty: 2,
        price: 25000,
        subtotal: 50000,
      },
      {
        productId: 'choco-cheese',
        productName: 'Choco Cheese',
        qty: 1,
        price: 25000,
        subtotal: 25000,
      },
    ],
    totalQty: 3,
    totalPrice: 75000,
    status: 'Baru',
    readByOutlet: false,
  },
  {
    id: 'CH-8919',
    createdAt: '15 Menit lalu (14:17 WIB)',
    outletId: 'pahoman',
    outletName: 'Outlet Pahoman',
    customerName: 'Dimas Prasetyo',
    customerPhone: '0853-1122-3344',
    deliveryMode: 'takeaway',
    notes: 'Diambil jam 16.00 WIB pas pulang kantor',
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'Lunas',
    items: [
      {
        productId: 'dark-choco',
        productName: 'Dark Choco',
        qty: 1,
        price: 25000,
        subtotal: 25000,
      },
      {
        productId: 'strawberry-cheese',
        productName: 'Strawberry Cheese',
        qty: 1,
        price: 25000,
        subtotal: 25000,
      },
    ],
    totalQty: 2,
    totalPrice: 50000,
    status: 'Diproses',
    readByOutlet: true,
  },
  {
    id: 'CH-8915',
    createdAt: '35 Menit lalu (13:57 WIB)',
    outletId: 'uin',
    outletName: 'Outlet UIN Sukarame',
    customerName: 'Siti Mahasiswa UIN',
    customerPhone: '0896-9876-5432',
    deliveryMode: 'takeaway',
    notes: 'Titip di kasir ya mba',
    paymentMethod: 'Tunai di Outlet',
    paymentStatus: 'Bayar di Tempat',
    items: [
      {
        productId: 'matcha-greentea',
        productName: 'Matcha Greentea',
        qty: 1,
        price: 25000,
        subtotal: 25000,
      },
    ],
    totalQty: 1,
    totalPrice: 25000,
    status: 'Siap',
    readByOutlet: true,
  },
];
