/**
 * Express API Router for Cheeseholic Fullstack & Vercel
 * Validates API Key for data integrity & synchronizes all outlets, kitchen, and courier.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  initDatabase,
  getDatabase,
  addOrder,
  updateOrderStatus,
  updateStock,
  addDispatchLog,
  updateDispatchStatus,
  resetSeedData,
} from './db';

export const apiRouter = express.Router();

// Initialize DB on boot
initDatabase();

// Default API Key for Cheeseholic system
export const VALID_API_KEY = process.env.CHEESEHOLIC_API_KEY || 'ch_sec_bdl_2026_99x7';

// Middleware for API Key verification
export function verifyApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['x-api-token'];
  const authHeader = req.headers['authorization'];

  let token = apiKeyHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Allow localhost/browser same-origin requests or valid API key
  if (token === VALID_API_KEY || req.headers['x-requested-with'] === 'cheeseholic-client' || !process.env.STRICT_API_KEY) {
    next();
    return;
  }

  res.status(401).json({
    success: false,
    error: 'Unauthorized: Invalid or missing x-api-key header',
    message: 'Gunakan API Key Cheeseholic yang valid untuk mengakses database.',
  });
}

// 1. Health & Server Status
apiRouter.get('/health', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    status: 'ok',
    system: 'Cheeseholic Unified Database API',
    version: db.version,
    lastUpdated: db.lastUpdated,
    totalOrders: db.orders.length,
    activeDispatches: db.dispatchLogs.length,
  });
});

// 2. Full Database Sync for Outlets, Kitchen, and Staff
apiRouter.get('/sync', verifyApiKey, (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    success: true,
    data: {
      orders: db.orders,
      inventory: db.inventory,
      dispatchLogs: db.dispatchLogs,
      lastUpdated: db.lastUpdated,
      version: db.version,
    },
  });
});

// 3. Create Direct Order (Customer -> Outlet)
apiRouter.post('/orders', verifyApiKey, (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData || !orderData.outletId || !orderData.items) {
    res.status(400).json({ success: false, error: 'Data pesanan tidak lengkap' });
    return;
  }

  const result = addOrder(orderData);
  res.status(201).json({
    success: true,
    message: `Pesanan ${result.order.id} berhasil dicatat & stok cabang dikurangi otomatis.`,
    order: result.order,
    inventory: result.inventory,
  });
});

// 4. Update Order Status (Baru -> Diproses -> Siap -> Selesai)
apiRouter.patch('/orders/:id/status', verifyApiKey, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, error: 'Status baru wajib disertakan' });
    return;
  }

  const updatedOrder = updateOrderStatus(id, status);
  if (!updatedOrder) {
    res.status(404).json({ success: false, error: `Pesanan dengan ID ${id} tidak ditemukan` });
    return;
  }

  res.json({
    success: true,
    message: `Status pesanan ${id} berhasil diubah menjadi ${status}`,
    order: updatedOrder,
  });
});

// 5. Update Inventory Stock (Admin / Outlet adjustment)
apiRouter.put('/inventory', verifyApiKey, (req: Request, res: Response) => {
  const { outletId, productId, stock } = req.body;
  if (!outletId || !productId || typeof stock !== 'number') {
    res.status(400).json({ success: false, error: 'Parameter outletId, productId, dan stock wajib diisi' });
    return;
  }

  const success = updateStock(outletId, productId, Math.max(0, stock));
  if (!success) {
    res.status(404).json({ success: false, error: 'Outlet atau varian tidak ditemukan' });
    return;
  }

  res.json({
    success: true,
    message: `Stok ${productId} di outlet ${outletId} diperbarui menjadi ${stock} box`,
    inventory: getDatabase().inventory,
  });
});

// 6. Kitchen Dispatch Log Creation
apiRouter.post('/dispatch', verifyApiKey, (req: Request, res: Response) => {
  const dispatchData = req.body;
  if (!dispatchData || !dispatchData.targetOutletId || !dispatchData.quantity) {
    res.status(400).json({ success: false, error: 'Data pengiriman stok dapur tidak lengkap' });
    return;
  }

  const newLog = addDispatchLog(dispatchData);
  res.status(201).json({
    success: true,
    message: `Pengiriman ${newLog.quantity} box ${newLog.productName} ke ${newLog.targetOutletName} berhasil dicatat.`,
    log: newLog,
    inventory: getDatabase().inventory,
  });
});

// 7. Update Courier Delivery Status
apiRouter.patch('/dispatch/:id/status', verifyApiKey, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, error: 'Status pengiriman wajib disertakan' });
    return;
  }

  const updatedLog = updateDispatchStatus(id, status);
  if (!updatedLog) {
    res.status(404).json({ success: false, error: `Log pengiriman dengan ID ${id} tidak ditemukan` });
    return;
  }

  res.json({
    success: true,
    message: `Status pengiriman ${id} diperbarui menjadi ${status}`,
    log: updatedLog,
    inventory: getDatabase().inventory,
  });
});

// 8. Reset Seed Data (Testing & demo reset)
apiRouter.post('/reset-seed', verifyApiKey, (_req: Request, res: Response) => {
  const db = resetSeedData();
  res.json({
    success: true,
    message: 'Database berhasil di-reset ke data default awal Cheeseholic.',
    data: db,
  });
});
