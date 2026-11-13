/**
 * Firebase Client Initialization & Firestore Connection
 * Configured from firebase-applet-config.json
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DirectOrder, OrderStatus } from '../utils/orderManager';
import { VariantStock, StockDispatchLog } from '../utils/inventoryManager';
import { INITIAL_OUTLET_STOCKS, INITIAL_DISPATCH_LOGS } from '../data/initialInventory';
import { INITIAL_DIRECT_ORDERS } from '../utils/orderManager';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected to cloud database successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline, checking Firebase configuration');
    }
    // Permissions error on /test/connection is normal if rule denies default paths
    return true;
  }
}

testConnection();

// ==========================================
// FIRESTORE SYNC & PERSISTENCE HELPERS
// ==========================================

export const ORDERS_COLLECTION = 'orders';
export const INVENTORY_COLLECTION = 'inventory';
export const DISPATCH_COLLECTION = 'dispatchLogs';

/**
 * Real-time listener for Orders from Cloud Firestore
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: DirectOrder[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('id', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: DirectOrder[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as DirectOrder;
        orders.push({
          ...data,
          id: d.id || data.id,
        });
      });
      onOrdersUpdated(orders);
    },
    (err) => {
      console.warn('[Firestore] Orders listener warning:', err);
      if (onError) onError(err);
    }
  );
}

// Sanitizer to strip undefined fields so Firestore setDoc never rejects with "Unsupported field value: undefined"
export function cleanForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = cleanForFirestore(val);
      }
    }
    return clean;
  }
  return obj;
}

/**
 * Save / Upsert an Order directly to Firestore
 */
export async function saveOrderToFirestore(order: DirectOrder): Promise<boolean> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    const payload = cleanForFirestore({
      ...order,
      notes: order.notes || '',
      address: order.address || '',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Update an Order status in Firestore
 */
export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus): Promise<boolean> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Save Outlet Inventory to Firestore
 */
export async function saveInventoryToFirestore(
  outletId: string,
  stocks: Record<string, VariantStock>
): Promise<boolean> {
  const path = `${INVENTORY_COLLECTION}/${outletId}`;
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, outletId);
    await setDoc(docRef, {
      outletId,
      stocks,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for Inventory from Cloud Firestore
 */
export function subscribeToInventory(
  onInventoryUpdated: (inventory: Record<string, Record<string, VariantStock>>) => void
): () => void {
  const invRef = collection(db, INVENTORY_COLLECTION);
  return onSnapshot(
    invRef,
    (snapshot) => {
      const result: Record<string, Record<string, VariantStock>> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && data.stocks) {
          result[d.id] = data.stocks;
        }
      });
      if (Object.keys(result).length > 0) {
        onInventoryUpdated(result);
      }
    },
    (err) => {
      console.warn('[Firestore] Inventory listener warning:', err);
    }
  );
}

/**
 * Save Dispatch Log to Firestore
 */
export async function saveDispatchToFirestore(log: StockDispatchLog): Promise<boolean> {
  const path = `${DISPATCH_COLLECTION}/${log.id}`;
  try {
    const docRef = doc(db, DISPATCH_COLLECTION, log.id);
    const payload = cleanForFirestore({
      ...log,
      notes: log.notes || '',
      courierPhone: log.courierPhone || '',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for Dispatch Logs from Cloud Firestore
 */
export function subscribeToDispatches(
  onDispatchesUpdated: (logs: StockDispatchLog[]) => void
): () => void {
  const dispatchesRef = collection(db, DISPATCH_COLLECTION);
  return onSnapshot(
    dispatchesRef,
    (snapshot) => {
      const logs: StockDispatchLog[] = [];
      snapshot.forEach((d) => {
        logs.push(d.data() as StockDispatchLog);
      });
      if (logs.length > 0) {
        onDispatchesUpdated(logs);
      }
    },
    (err) => {
      console.warn('[Firestore] Dispatch listener warning:', err);
    }
  );
}

/**
 * Bootstrap Cloud Firestore with initial sample seed if collections are empty
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (ordersSnap.empty) {
      console.log('[Firestore] Seeding initial orders...');
      for (const order of INITIAL_DIRECT_ORDERS) {
        await setDoc(doc(db, ORDERS_COLLECTION, order.id), cleanForFirestore(order), { merge: true });
      }
    }

    const invSnap = await getDocs(collection(db, INVENTORY_COLLECTION));
    if (invSnap.empty) {
      console.log('[Firestore] Seeding initial outlet inventories...');
      for (const [outletId, stocks] of Object.entries(INITIAL_OUTLET_STOCKS)) {
        await setDoc(doc(db, INVENTORY_COLLECTION, outletId), cleanForFirestore({
          outletId,
          stocks,
          updatedAt: new Date().toISOString(),
        }));
      }
    }

    const dispatchSnap = await getDocs(collection(db, DISPATCH_COLLECTION));
    if (dispatchSnap.empty) {
      console.log('[Firestore] Seeding initial dispatch logs...');
      for (const log of INITIAL_DISPATCH_LOGS) {
        await setDoc(doc(db, DISPATCH_COLLECTION, log.id), cleanForFirestore(log), { merge: true });
      }
    }
  } catch (err) {
    console.warn('[Firestore] Seed check skipped or failed:', err);
  }
}
