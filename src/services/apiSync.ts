/**
 * Real-time API Client & Database Synchronization Service
 * Automatically synchronizes Outlet, Kitchen, and Staff data across all devices
 * with API Key authorization and offline fallback.
 */

import { VariantStock, StockDispatchLog } from '../utils/inventoryManager';
import { DirectOrder, OrderStatus } from '../utils/orderManager';
import { INITIAL_OUTLET_STOCKS, INITIAL_DISPATCH_LOGS } from '../data/initialInventory';
import { INITIAL_DIRECT_ORDERS } from '../utils/orderManager';

export const CLIENT_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) ||
  'ch_sec_bdl_2026_99x7';

export interface SyncDataPayload {
  orders: DirectOrder[];
  inventory: Record<string, Record<string, VariantStock>>;
  dispatchLogs: StockDispatchLog[];
  lastUpdated: string;
  version: number;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

const STORAGE_KEY = 'cheeseholic_db_cache_v2';

export function deduplicateOrders(orders: DirectOrder[]): DirectOrder[] {
  if (!Array.isArray(orders)) return [];
  const seen = new Set<string>();
  const unique: DirectOrder[] = [];
  for (const o of orders) {
    if (!o || !o.id) continue;
    if (o.id.startsWith('CH-TEST-SYNC')) continue;
    if (!seen.has(o.id)) {
      seen.add(o.id);
      unique.push(o);
    }
  }
  return unique;
}

// Load initial local cache if available
export function loadLocalCache(): SyncDataPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.orders) {
        parsed.orders = deduplicateOrders(parsed.orders);
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return {
    orders: deduplicateOrders(INITIAL_DIRECT_ORDERS),
    inventory: INITIAL_OUTLET_STOCKS,
    dispatchLogs: INITIAL_DISPATCH_LOGS,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
}

export function saveLocalCache(data: SyncDataPayload): void {
  try {
    if (data.orders) {
      data.orders = deduplicateOrders(data.orders);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': CLIENT_API_KEY,
  'x-requested-with': 'cheeseholic-client',
};

// 1. Fetch Sync
export async function fetchRemoteSync(): Promise<SyncDataPayload | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: defaultHeaders,
    });
    if (!res.ok) {
      throw new Error(`Sync HTTP error: ${res.status}`);
    }
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.orders) {
        json.data.orders = deduplicateOrders(json.data.orders);
      }
      saveLocalCache(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('[Sync] Using cached database due to network state:', err);
  }
  return null;
}

// 2. Post New Order
export async function createRemoteOrder(order: DirectOrder): Promise<{
  success: boolean;
  order?: DirectOrder;
  inventory?: Record<string, Record<string, VariantStock>>;
}> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(order),
    });
    const json = await res.json();
    if (json.success) {
      return { success: true, order: json.order, inventory: json.inventory };
    }
  } catch (err) {
    console.warn('[Order] Remote creation error, falling back locally:', err);
  }
  return { success: false };
}

// 3. Update Order Status
export async function updateRemoteOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('[Order] Status update error:', err);
    return false;
  }
}

// 4. Update Stock
export async function updateRemoteStock(outletId: string, productId: string, stock: number): Promise<boolean> {
  try {
    const res = await fetch('/api/inventory', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({ outletId, productId, stock }),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('[Stock] Remote update error:', err);
    return false;
  }
}

// 5. Post Kitchen Dispatch Log
export async function createRemoteDispatch(log: StockDispatchLog): Promise<boolean> {
  try {
    const res = await fetch('/api/dispatch', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(log),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('[Dispatch] Remote creation error:', err);
    return false;
  }
}

// 6. Update Courier Status
export async function updateRemoteCourierStatus(
  logId: string,
  status: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima'
): Promise<boolean> {
  try {
    const res = await fetch(`/api/dispatch/${logId}/status`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('[Courier] Remote status update error:', err);
    return false;
  }
}
