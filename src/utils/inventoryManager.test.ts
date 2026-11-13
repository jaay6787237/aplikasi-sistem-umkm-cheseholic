import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStockStatusLevel,
  calculateOutletTotalStock,
  calculateLowStockAlertCount,
  dispatchStockTransfer,
  VariantStock,
  StockDispatchLog,
} from './inventoryManager';

const mockStocks: Record<string, VariantStock> = {
  'lotus-biscoff': { productId: 'lotus-biscoff', stock: 3, minAlertThreshold: 5, maxCapacity: 30 },
  'dark-choco': { productId: 'dark-choco', stock: 15, minAlertThreshold: 5, maxCapacity: 30 },
  'choco-crunchy': { productId: 'choco-crunchy', stock: 0, minAlertThreshold: 5, maxCapacity: 30 },
};

test('getStockStatusLevel categorizes inventory alert thresholds', () => {
  assert.equal(getStockStatusLevel(15, 5), 'Melimpah');
  assert.equal(getStockStatusLevel(3, 5), 'Menipis');
  assert.equal(getStockStatusLevel(0, 5), 'Habis');
});

test('calculateOutletTotalStock sums up box counts correctly', () => {
  assert.equal(calculateOutletTotalStock(mockStocks), 18);
});

test('calculateLowStockAlertCount identifies low or out of stock items', () => {
  assert.equal(calculateLowStockAlertCount(mockStocks), 2); // 3 (low) & 0 (out)
});

test('dispatchStockTransfer handles stock increments correctly upon delivery', () => {
  const initialData = {
    kedaton: mockStocks,
  };
  const dispatch: StockDispatchLog = {
    id: 'disp-1',
    timestamp: '2026-11-12 10:00',
    productName: 'choco-crunchy',
    quantity: 10,
    fromOutletOrKitchen: 'Dapur Utama Kedaton',
    targetOutletId: 'kedaton',
    targetOutletName: 'Outlet Kedaton',
    courierName: 'Mas Supri',
    courierPhone: '0812-9988-7711',
    status: 'Selesai & Diterima',
  };

  const res = dispatchStockTransfer(initialData, dispatch);
  assert.equal(res.success, true);
  assert.equal(res.updatedStocks.kedaton['choco-crunchy'].stock, 10);
});
