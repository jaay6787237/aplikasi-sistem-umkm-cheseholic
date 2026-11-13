export interface VariantStock {
  productId: string;
  stock: number; // Current available box count
  minAlertThreshold: number; // e.g. 5 boxes triggers "Low" alert
  maxCapacity: number; // e.g. 30 boxes capacity per outlet
}

export interface OutletInventory {
  outletId: string;
  stocks: Record<string, VariantStock>;
}

export interface StockDispatchLog {
  id: string;
  timestamp: string;
  productName: string;
  quantity: number;
  fromOutletOrKitchen: string;
  targetOutletId: string;
  targetOutletName: string;
  courierName: string;
  courierPhone: string;
  status: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima';
  notes?: string;
}

export function getStockStatusLevel(count: number, threshold: number): 'Melimpah' | 'Menipis' | 'Habis' {
  if (count <= 0) return 'Habis';
  if (count <= threshold) return 'Menipis';
  return 'Melimpah';
}

export function calculateOutletTotalStock(stocks: Record<string, VariantStock>): number {
  return Object.values(stocks).reduce((sum, item) => sum + item.stock, 0);
}

export function calculateLowStockAlertCount(stocks: Record<string, VariantStock>): number {
  return Object.values(stocks).filter(
    (item) => getStockStatusLevel(item.stock, item.minAlertThreshold) !== 'Melimpah'
  ).length;
}

export function dispatchStockTransfer(
  currentStocks: Record<string, Record<string, VariantStock>>,
  dispatch: StockDispatchLog
): {
  updatedStocks: Record<string, Record<string, VariantStock>>;
  success: boolean;
  message: string;
} {
  const { targetOutletId, productName, quantity, status } = dispatch;

  if (quantity <= 0) {
    return {
      updatedStocks: currentStocks,
      success: false,
      message: 'Jumlah pengiriman harus lebih dari 0 box',
    };
  }

  const outletStocks = currentStocks[targetOutletId];
  if (!outletStocks) {
    return {
      updatedStocks: currentStocks,
      success: false,
      message: 'Cabang outlet tidak ditemukan',
    };
  }

  // Find product key by matching name or id
  const pKey = Object.keys(outletStocks).find(
    (key) => key === productName || outletStocks[key].productId === productName
  );

  if (!pKey) {
    return {
      updatedStocks: currentStocks,
      success: false,
      message: `Varian ${productName} tidak ditemukan di outlet ini`,
    };
  }

  // If status is Selesai & Diterima, update actual stock
  const newStocks = JSON.parse(JSON.stringify(currentStocks));
  if (status === 'Selesai & Diterima') {
    newStocks[targetOutletId][pKey].stock += quantity;
  }

  return {
    updatedStocks: newStocks,
    success: true,
    message: `Pengiriman ${quantity} box ${productName} berhasil dicatat dengan status ${status}`,
  };
}
