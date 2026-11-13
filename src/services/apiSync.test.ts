import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIENT_API_KEY, loadLocalCache } from './apiSync';
import { VALID_API_KEY } from '../server/api';
import { getDatabase, addOrder, updateOrderStatus, updateStock } from '../server/db';
import { DirectOrder } from '../utils/orderManager';

test('CLIENT_API_KEY matches server VALID_API_KEY default', () => {
  assert.equal(CLIENT_API_KEY, VALID_API_KEY);
  assert.ok(CLIENT_API_KEY.startsWith('ch_sec_'));
});

test('Database engine performs atomic order creation and stock deduction', () => {
  const dbBefore = getDatabase();
  const initialStock = dbBefore.inventory['kedaton']['lotus-biscoff'].stock;

  const testOrder: DirectOrder = {
    id: 'CH-TEST-SYNC',
    createdAt: 'Just now',
    outletId: 'kedaton',
    outletName: 'Outlet Kedaton',
    customerName: 'Test Sync User',
    customerPhone: '0812-9999-8888',
    deliveryMode: 'delivery',
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
    ],
    totalQty: 2,
    totalPrice: 50000,
    status: 'Baru',
    readByOutlet: false,
  };

  const { order, inventory } = addOrder(testOrder);
  assert.equal(order.id, 'CH-TEST-SYNC');
  assert.equal(inventory['kedaton']['lotus-biscoff'].stock, Math.max(0, initialStock - 2));

  // Test status update
  const updated = updateOrderStatus('CH-TEST-SYNC', 'Selesai');
  assert.ok(updated);
  assert.equal(updated.status, 'Selesai');

  // Clean up test order so it doesn't leave test fixtures in DB
  const db = getDatabase();
  const idx = db.orders.findIndex((o) => o.id === 'CH-TEST-SYNC');
  if (idx !== -1) {
    db.orders.splice(idx, 1);
  }
});

test('Database engine updates stock directly', () => {
  const success = updateStock('kedaton', 'lotus-biscoff', 25);
  assert.equal(success, true);
  assert.equal(getDatabase().inventory['kedaton']['lotus-biscoff'].stock, 25);
});
