import React, { useState } from 'react';
import { CLIENT_API_KEY } from '../services/apiSync';
import { sounds } from '../utils/soundEffects';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncTime: string;
  totalOrders: number;
  totalDispatches: number;
  onManualSync: () => Promise<void>;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  lastSyncTime,
  totalOrders,
  totalDispatches,
  onManualSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleSyncClick = async () => {
    setIsSyncing(true);
    sounds.playPop();
    await onManualSync();
    setTimeout(() => {
      setIsSyncing(false);
      sounds.playSuccess();
    }, 600);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(CLIENT_API_KEY);
    sounds.playSuccess();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#FFC700] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#311309] text-[#FFC700] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-base sm:text-lg text-[#311309]">
                Database &amp; Real-time Sync Cloud
              </h3>
              <p className="text-[11px] text-gray-500">Sinkronisasi Data Multi-Outlet &amp; Keamanan API Key</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block font-headline">
                ● STATUS: {syncStatus === 'connected' ? 'TERKONEKSI REALTIME' : syncStatus.toUpperCase()}
              </span>
              <p className="text-[11px] text-emerald-950 font-medium">
                Data pesanan, dapur, dan stok 5 cabang selalu sinkron secara otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-headline font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Sinkron...' : 'Sync Sekarang'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Cabang Outlet</span>
            <span className="text-lg font-black font-headline text-[#311309]">5 Cabang</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Pesanan</span>
            <span className="text-lg font-black font-headline text-[#311309]">{totalOrders} Order</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Pengiriman Dapur</span>
            <span className="text-lg font-black font-headline text-[#311309]">{totalDispatches} Batch</span>
          </div>
        </div>

        {/* API Key Security Section */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5 font-headline">
              <span className="material-symbols-outlined text-sm text-amber-700">vpn_key</span>
              <span>API Key Keamanan Data (x-api-key)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
              Terverifikasi 🔒
            </span>
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200">
            <code className="text-xs font-mono font-bold text-[#311309]">{CLIENT_API_KEY}</code>
            <button
              onClick={handleCopyKey}
              className="py-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold font-headline transition-colors cursor-pointer"
            >
              {copiedKey ? 'Disalin! ✓' : 'Salin Key'}
            </button>
          </div>
          <p className="text-[11px] text-amber-800">
            Setiap request sinkronisasi antara outlet kasir, dapur, dan staf dienkripsi dan divalidasi dengan API key ini.
          </p>
        </div>

        {/* Vercel Deployment Guide */}
        <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-white text-black rounded flex items-center justify-center font-black text-[10px]">
                ▲
              </span>
              <span className="font-headline font-bold text-xs text-white">Panduan Deploy di Vercel</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Vercel Ready ✓
            </span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            Aplikasi telah dilengkapi file <b>vercel.json</b> dan endpoint serverless <b>api/index.ts</b>. Anda dapat langsung menghubungkan repository ke Vercel:
          </p>

          <div className="space-y-1.5 text-[11px] font-mono bg-black/50 p-2.5 rounded-xl border border-white/10 text-gray-200">
            <p>1. Framework Preset: <b>Vite</b></p>
            <p>2. Build Command: <b>npm run build</b></p>
            <p>3. Output Directory: <b>dist</b></p>
            <p>4. Environment Variable: <b>CHEESEHOLIC_API_KEY={CLIENT_API_KEY}</b></p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="w-full py-3 bg-[#311309] hover:bg-[#4a1d0f] text-[#FFC700] rounded-2xl font-headline font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Tutup Panel
        </button>
      </div>
    </div>
  );
};
