import React, { useState } from 'react';
import { StockDispatchLog } from '../utils/inventoryManager';

interface CourierPortalProps {
  dispatchLogs: StockDispatchLog[];
  onUpdateStatus: (logId: string, newStatus: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima') => void;
  onGoToDashboard: () => void;
  onGoToKitchen: () => void;
}

export const CourierPortal: React.FC<CourierPortalProps> = ({
  dispatchLogs,
  onUpdateStatus,
  onGoToDashboard,
  onGoToKitchen,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLogs = dispatchLogs.filter((log) => {
    if (filterStatus === 'active') return log.status !== 'Selesai & Diterima';
    if (filterStatus === 'completed') return log.status === 'Selesai & Diterima';
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-28 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="bg-[#25D366] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#20BD5A]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#311309] text-[#FFC700] font-headline font-bold text-xs mb-2">
            <span className="material-symbols-outlined text-sm">two_wheeler</span>
            <span>Portal Kurir &amp; Logistics Armada</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Manajemen Pengiriman Stok &amp; Pesanan Kurir
          </h1>
          <p className="font-body text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
            Akses khusus driver kurir internal Cheeseholic untuk menerima tugas restok dari Dapur Utama, mengubah status antaran, dan mengonfirmasi penerimaan di outlet tujuan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="px-4 py-2.5 bg-[#311309] text-[#FFC700] rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard Stok</span>
          </button>
          <button
            type="button"
            onClick={onGoToKitchen}
            className="px-4 py-2.5 bg-white text-[#311309] rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">cookie</span>
            <span>Tim Produksi</span>
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#D2C5AB]/40 shadow-xs">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#FFC700] text-[#311309] shadow-xs'
              : 'bg-[#FFF1ED] text-[#4F4632] hover:bg-[#FFE9E3]'
          }`}
        >
          Semua Tugass ({dispatchLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('active')}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-1 ${
            filterStatus === 'active'
              ? 'bg-[#FFC700] text-[#311309] shadow-xs'
              : 'bg-[#FFF1ED] text-[#4F4632] hover:bg-[#FFE9E3]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
          <span>Tugas Aktif ({dispatchLogs.filter((l) => l.status !== 'Selesai & Diterima').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-[#FFC700] text-[#311309] shadow-xs'
              : 'bg-[#FFF1ED] text-[#4F4632] hover:bg-[#FFE9E3]'
          }`}
        >
          Selesai ({dispatchLogs.filter((l) => l.status === 'Selesai & Diterima').length})
        </button>
      </div>

      {/* DISPATCH TASKS CARDS */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-[#4F4632] space-y-2 border border-[#D2C5AB]/30">
            <span className="material-symbols-outlined text-4xl text-[#D2C5AB]">two_wheeler</span>
            <p className="font-headline font-bold text-sm text-[#311309]">Tidak ada tugas pengiriman</p>
            <p className="font-body text-xs text-[#4F4632]">Semua pesanan dan restok cabang telah selesai diantar!</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-[#D2C5AB]/40 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D2C5AB]/30">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-sm sm:text-base text-[#8B4F2F]">
                    {log.id}
                  </span>
                  <span className="text-xs text-[#4F4632]">• {log.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-headline font-bold ${
                      log.status === 'Selesai & Diterima'
                        ? 'bg-[#E7FFDB] text-[#25D366]'
                        : log.status === 'Dalam Perjalanan'
                        ? 'bg-[#FFC700] text-[#311309]'
                        : 'bg-[#FFE9E3] text-[#8B4F2F]'
                    }`}
                  >
                    {log.status === 'Disiapkan' && '🛵 Disiapkan di Dapur'}
                    {log.status === 'Dalam Perjalanan' && '🚀 Dalam Perjalanan'}
                    {log.status === 'Selesai & Diterima' && '✅ Sampai & Diterima Outlet'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body text-[#4F4632]">
                <div className="space-y-1">
                  <span className="text-[10px] font-headline font-bold text-[#8B4F2F] uppercase block">
                    Kue &amp; Jumlah
                  </span>
                  <p className="font-headline font-bold text-sm text-[#311309]">
                    {log.quantity} Box - {log.productName}
                  </p>
                  <p className="text-[11px] text-[#4F4632]">Asal: {log.fromOutletOrKitchen}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-headline font-bold text-[#8B4F2F] uppercase block">
                    Outlet Tujuan
                  </span>
                  <p className="font-headline font-bold text-sm text-[#311309]">
                    {log.targetOutletName}
                  </p>
                  <p className="text-[11px] text-[#4F4632]">Driver: {log.courierName}</p>
                </div>
              </div>

              {log.notes && (
                <div className="p-3 bg-[#FFF1ED] rounded-xl text-xs font-body text-[#311309] flex items-start gap-1.5 border border-[#D2C5AB]/30">
                  <span className="material-symbols-outlined text-sm text-[#8B4F2F] shrink-0 mt-0.5">
                    info
                  </span>
                  <span>Catatan: {log.notes}</span>
                </div>
              )}

              {/* Status Update Quick Buttons */}
              <div className="pt-2 border-t border-[#D2C5AB]/30 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-headline font-bold text-[#311309]">
                  Ubah Status Pengiriman:
                </span>

                <div className="flex items-center gap-2">
                  {log.status === 'Disiapkan' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(log.id, 'Dalam Perjalanan')}
                      className="px-3.5 py-2 bg-[#FFC700] hover:bg-[#F5BF00] text-[#311309] rounded-xl font-headline font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">two_wheeler</span>
                      <span>Bawa &amp; Berangkat</span>
                    </button>
                  )}

                  {log.status === 'Dalam Perjalanan' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(log.id, 'Selesai & Diterima')}
                      className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      <span>Konfirmasi Diterima Outlet</span>
                    </button>
                  )}

                  {log.status === 'Selesai & Diterima' && (
                    <span className="text-xs font-headline font-bold text-[#25D366] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      <span>Tugas Selesai &amp; Stok Bertambah</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
