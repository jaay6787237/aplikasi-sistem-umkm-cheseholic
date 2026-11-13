/**
 * File-based JSON Database Engine for Cheeseholic
 * Provides structured, thread-safe persistence for:
 * - Direct Customer Orders
 * - Outlet Inventory (5 branches x 12 products)
 * - Kitchen Dispatch Logs & Courier Transits
 * - Audit Trail
 */

import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_OUTLET_STOCKS, INITIAL_DISPATCH_LOGS } from '../data/initialInventory';
import { INITIAL_DIRECT_ORDERS, DirectOrder, OrderStatus } from '../utils/orderManager';
import { VariantStock, StockDispatchLog, dispatchStockTransfer } from '../utils/inventoryManager';

export interface DatabaseSchema {
  orders: DirectOrder[];
  inventory: Record<string, Record<string, VariantStock>>;
  dispatchLogs: StockDispatchLog[];
  lastUpdated: string;
  version: number;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// In-memory cache
let inMemoryDb: DatabaseSchema = {
  orders: INITIAL_DIRECT_ORDERS,
  inventory: INITIAL_OUTLET_STOCKS,
  dispatchLogs: INITIAL_DISPATCH_LOGS,
  lastUpdated: new Date().toISOString(),
  version: 1,
};

// Initialize DB file if not exists
export function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(raw);

      // Clean up test fixtures and deduplicate orders by ID
      const seenOrderIds = new Set<string>();
      const cleanOrders: DirectOrder[] = [];
      for (const order of (parsed.orders || [])) {
        if (!order || !order.id) continue;
        if (order.id.startsWith('CH-TEST-SYNC')) continue; // purge test fixtures
        if (!seenOrderIds.has(order.id)) {
          seenOrderIds.add(order.id);
          cleanOrders.push(order);
        }
      }
      parsed.orders = cleanOrders;
      inMemoryDb = parsed;
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn('[DB] Using in-memory fallback due to storage error:', err);
  }
  return inMemoryDb;
}

export function saveDatabase(): void {
  try {
    inMemoryDb.lastUpdated = new Date().toISOString();
    inMemoryDb.version += 1;
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist database to disk:', err);
  }
}

export function getDatabase(): DatabaseSchema {
  return inMemoryDb;
}

export function addOrder(newOrder: DirectOrder): { order: DirectOrder; inventory: Record<string, Record<string, VariantStock>> } {
  // Prevent duplicate order IDs in state
  const existingIdx = inMemoryDb.orders.findIndex((o) => o.id === newOrder.id);
  if (existingIdx !== -1) {
    inMemoryDb.orders[existingIdx] = newOrder;
  } else {
    inMemoryDb.orders.unshift(newOrder);
  }

  // Automatically deduct stock for this target outlet
  const outletStocks = inMemoryDb.inventory[newOrder.outletId];
  if (outletStocks) {
    newOrder.items.forEach((item) => {
      if (outletStocks[item.productId]) {
        outletStocks[item.productId].stock = Math.max(0, outletStocks[item.productId].stock - item.qty);
      }
    });
  }

  saveDatabase();
  return { order: newOrder, inventory: inMemoryDb.inventory };
}

export function updateOrderStatus(orderId: string, status: OrderStatus): DirectOrder | null {
  const order = inMemoryDb.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  saveDatabase();
  return order;
}

export function updateStock(outletId: string, productId: string, stock: number): boolean {
  if (inMemoryDb.inventory[outletId] && inMemoryDb.inventory[outletId][productId]) {
    inMemoryDb.inventory[outletId][productId].stock = stock;
    saveDatabase();
    return true;
  }
  return false;
}

export function addDispatchLog(newLog: StockDispatchLog): StockDispatchLog {
  inMemoryDb.dispatchLogs.unshift(newLog);

  // If already received, increment stock
  if (newLog.status === 'Selesai & Diterima') {
    const res = dispatchStockTransfer(inMemoryDb.inventory, newLog);
    if (res.success) {
      inMemoryDb.inventory = res.updatedStocks;
    }
  }

  saveDatabase();
  return newLog;
}

export function updateDispatchStatus(logId: string, status: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima'): StockDispatchLog | null {
  const log = inMemoryDb.dispatchLogs.find((l) => l.id === logId);
  if (!log) return null;

  const previousStatus = log.status;
  log.status = status;

  if (status === 'Selesai & Diterima' && previousStatus !== 'Selesai & Diterima') {
    const res = dispatchStockTransfer(inMemoryDb.inventory, log);
    if (res.success) {
      inMemoryDb.inventory = res.updatedStocks;
    }
  }

  saveDatabase();
  return log;
}

export function resetSeedData(): DatabaseSchema {
  inMemoryDb = {
    orders: INITIAL_DIRECT_ORDERS,
    inventory: INITIAL_OUTLET_STOCKS,
    dispatchLogs: INITIAL_DISPATCH_LOGS,
    lastUpdated: new Date().toISOString(),
    version: inMemoryDb.version + 1,
  };
  saveDatabase();
  return inMemoryDb;
}
