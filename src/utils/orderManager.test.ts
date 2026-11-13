import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOrderId, INITIAL_DIRECT_ORDERS } from './orderManager';

test('generateOrderId generates valid CH- prefixed ID', () => {
  const id = generateOrderId();
  assert.match(id, /^CH-\d{4}$/);
});

test('INITIAL_DIRECT_ORDERS contains initial sample data', () => {
  assert.ok(INITIAL_DIRECT_ORDERS.length >= 3);
  assert.equal(INITIAL_DIRECT_ORDERS[0].outletId, 'kedaton');
  assert.equal(INITIAL_DIRECT_ORDERS[0].status, 'Baru');
});
