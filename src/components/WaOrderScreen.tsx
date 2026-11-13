import React, { useState, useId } from 'react';
import {
  Product,
  Outlet,
  formatRupiah,
  calculateOrderTotals,
  buildWhatsAppMessage,
} from '../utils/orderCalculator';
import { BANK_ACCOUNTS } from '../data/cheeseholicData';

interface WaOrderScreenProps {
  products: Product[];
  outlets: Outlet[];
  cart: Record<string, number>;
  updateQty: (productId: string, delta: number) => void;
  setCartDirect: (cart: Record<string, number>) => void;
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
}

export const WaOrderScreen: React.FC<WaOrderScreenProps> = ({
  products,
  outlets,
  cart,
  updateQty,
  setCartDirect,
  selectedOutletId,
  setSelectedOutletId,
}) => {
  const fileUploadId = useId();
  // Mode state
  const [orderMode, setOrderMode] = useState<'delivery' | 'takeaway'>('delivery');

  // Filter states
  const [outletFilter, setOutletFilter] = useState<'all' | 'ready'>('all');
  const [variantFilter, setVariantFilter] = useState<'all' | 'ready' | 'limited'>('all');

  // Customer form states (Delivery)
  const [delName, setDelName] = useState('Budi Santoso');
  const [delPhone, setDelPhone] = useState('0812-3456-7890');
  const [delAddress, setDelAddress] = useState('Jl. Teuku Umar No. 45, Kedaton, Bandar Lampung');
  const [delPinpoint, setDelPinpoint] = useState('Depan Apotek Kimia Farma (Shareloc via chat)');
  const [delNotes, setDelNotes] = useState('Pastikan box tidak miring selama di perjalanan kurir');

  // Customer form states (Takeaway)
  const [takeName, setTakeName] = useState('Budi Santoso');
  const [takePhone, setTakePhone] = useState('0812-3456-7890');
  const [takeTime, setTakeTime] = useState('Hari ini, Pukul 14.30 WIB');
  const [takeNotes, setTakeNotes] = useState('Tolong siapkan sebelum jam 14.30 ya min');

  // Receipt state
  const [receiptFileName, setReceiptFileName] = useState('struk_transfer_bca_75000.jpg');
  const [receiptFileSize, setReceiptFileSize] = useState('1.2 MB');
  const [hasReceipt, setHasReceipt] = useState(true);

  // Copy feedback states
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedWaText, setCopiedWaText] = useState(false);

  // Active outlet object
  const activeOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  // Calculations
  const totals = calculateOrderTotals(cart, products);

  // Filtered lists
  const filteredOutlets = outlets.filter((o) => {
    if (outletFilter === 'ready') return o.stockStatus === 'ready';
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (variantFilter === 'ready') return p.stockStatus === 'ready';
    if (variantFilter === 'limited') return p.stockStatus === 'limited';
    return true;
  });

  // Quick Action: Best Seller 4 Varian
  const handleSelectBestSellers = () => {
    const newCart: Record<string, number> = {};
    const bestIds = ['lotus-biscoff', 'dark-choco', 'choco-cheese', 'choco-crunchy'];
    bestIds.forEach((id) => {
      newCart[id] = 1;
    });
    setCartDirect(newCart);
  };

  // Quick Action: Reset
  const handleResetOrder = () => {
    setCartDirect({});
  };

  // Copy Bank Account
  const handleCopyBank = (accNum: string, bank: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  // Construct message text
  const waMessageText = buildWhatsAppMessage({
    mode: orderMode,
    outlet: activeOutlet,
    cart,
    products,
    customer: {
      name: orderMode === 'delivery' ? delName : takeName,
      phone: orderMode === 'delivery' ? delPhone : takePhone,
      address: delAddress,
      pinpoint: delPinpoint,
      time: takeTime,
      notes: orderMode === 'delivery' ? delNotes : takeNotes,
      paymentMethod: 'QRIS / Transfer BCA (LUNAS - Bukti Terlampir)',
    },
  });

  // Copy WhatsApp Preview
  const handleCopyWaText = () => {
    navigator.clipboard.writeText(waMessageText);
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 2000);
  };

  // File upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setReceiptFileSize(`${sizeMb} MB`);
      setHasReceipt(true);
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = '/assets/aistudio/Image_7_79645b84.png';
    link.download = `QRIS-Cheeseholic-${totals.totalPrice || 25000}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const waSendUrl = `https://wa.me/${activeOutlet.phoneRaw}?text=${encodeURIComponent(waMessageText)}`;

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 pb-28 space-y-6 max-w-3xl mx-auto">
      {/* TOP INTRO CARD */}
      <div className="rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden bg-[#FFC700] text-[#311309] border border-[#E5A800]">
        <div className="relative z-10 flex flex-col space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#25D366] text-white shadow-sm">
              <span className="material-symbols-outlined text-sm">chat</span>
              WA Instant Order
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-headline text-xs font-bold bg-[#60237C] text-white">
              <span className="material-symbols-outlined text-xs">verified</span>
              ID18110036353041225
            </span>
          </div>

          <div className="pt-1">
            <h1 className="font-headline font-bold text-xl sm:text-2xl tracking-tight text-[#311309] leading-tight">
              Format Pesan Otomatis WhatsApp
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#311309]/85 mt-1 leading-snug">
              Pilih menu favorit, tentukan cabang terdekat, dan kirim format order langsung ke admin via WhatsApp tanpa ribet!
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-[#311309] text-[#FFC700] font-headline text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">savings</span>
              Semua Varian Box Bar: IDR 25K
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/20 pointer-events-none"></div>
      </div>

      {/* STEP 1: Pilih Cabang Cheeseholic */}
      <section className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center font-headline font-bold text-xs">
              1
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Pilih Cabang Cheeseholic
            </h2>
          </div>
          <span className="font-body text-xs text-[#8B4F2F] font-semibold">
            Bandar Lampung
          </span>
        </div>

        {/* Outlet Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pb-1 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOutletFilter('all')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                outletFilter === 'all'
                  ? 'bg-[#FFC700] text-[#311309] shadow-sm ring-1 ring-[#765B00]/40'
                  : 'bg-white text-[#4F4632] border border-[#D2C5AB]/40 hover:border-[#8B4F2F]/40'
              }`}
            >
              <span className="material-symbols-outlined text-sm">store</span>
              <span>Semua Cabang</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#311309] text-[#FFC700] font-bold">
                {outlets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutletFilter('ready')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                outletFilter === 'ready'
                  ? 'bg-[#E7FFDB] text-[#25D366] border border-[#25D366]/60 shadow-sm ring-2 ring-[#25D366]/40'
                  : 'bg-white text-[#4F4632] border border-[#D2C5AB]/40 hover:border-[#8B4F2F]/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              <span>Hanya Stok Ready</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#25D366] text-white font-bold">
                {outlets.filter((o) => o.stockStatus === 'ready').length}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-[#4F4632] hidden sm:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#25D366]">verified</span>
            Update Real-time
          </span>
        </div>

        {/* Outlet Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {filteredOutlets.map((outlet) => {
            const isSelected = selectedOutletId === outlet.id;
            return (
              <label
                key={outlet.id}
                onClick={() => setSelectedOutletId(outlet.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl bg-white shadow-sm cursor-pointer transition-all active:scale-[0.99] relative border ${
                  isSelected
                    ? 'border-[#8B4F2F] ring-2 ring-[#8B4F2F]/20 bg-[#FFF8F6]'
                    : 'border-transparent hover:border-[#8B4F2F]/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-headline text-xs mt-0.5 shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#8B4F2F] text-white font-bold'
                      : 'bg-[#FFE9E3] text-[#4F4632]'
                  }`}
                >
                  {outlet.number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span
                      className={`font-headline font-bold text-sm sm:text-base leading-snug ${
                        isSelected ? 'text-[#8B4F2F]' : 'text-[#311309]'
                      }`}
                    >
                      {outlet.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {outlet.stockStatus === 'ready' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#E7FFDB] text-[#25D366] border border-[#25D366]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                          Stok Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FFEDE8] text-[#964900] border border-[#8B4F2F]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#964900] animate-pulse"></span>
                          Stok Menipis
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-[#FFC700] text-[#311309] text-[10px] sm:text-[11px] font-bold">
                        {outlet.hours.replace(' WIB', '')}
                      </span>
                    </div>
                  </div>

                  <p className="font-body text-xs text-[#4F4632] flex items-center gap-1 mt-0.5 truncate">
                    <span className="material-symbols-outlined text-sm text-[#8B4F2F] shrink-0">
                      location_on
                    </span>
                    {outlet.location}, {outlet.address.split(',')[0]}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E7FFDB] text-[#25D366] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">chat</span> WA CS: {outlet.phoneDisplay}
                    </span>
                    <span className="text-[10px] text-[#4F4632]">({outlet.role})</span>
                  </div>

                  {/* Actions: Maps & Direct WhatsApp */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#FFF1ED] hover:bg-[#FFE9E3] text-[#8B4F2F] border border-[#8B4F2F]/40 font-bold text-xs shadow-sm transition-all active:scale-95"
                    >
                      <div className="inline-flex items-center gap-1 leading-tight">
                        <span className="material-symbols-outlined text-sm text-[#8B4F2F]">
                          near_me
                        </span>
                        <span>Buka Maps &amp; Rute</span>
                      </div>
                      <span className="mt-0.5 px-1.5 py-0.2 rounded-md bg-[#FFC700] text-[#311309] text-[10px] font-bold tracking-tight leading-tight">
                        ⏰ {outlet.hours.replace(' WIB', '')}
                      </span>
                    </a>

                    <a
                      href={`https://wa.me/${outlet.phoneRaw}?text=Halo%20Admin%20Cheeseholic%20${encodeURIComponent(outlet.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[#E7FFDB] hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 font-bold text-xs shadow-sm transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>Chat CS</span>
                    </a>
                  </div>
                </div>

                {isSelected && (
                  <div className="text-[#8B4F2F] absolute top-3.5 right-3">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {/* METODE PEMESANAN SEGMENTED CONTROL */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-xs sm:text-sm text-[#311309] font-semibold block">
              Metode Pemesanan:
            </span>
            <span className="text-[11px] text-[#8B4F2F] font-bold">
              {orderMode === 'delivery' ? '🛵 Kirim ke Alamat' : '🛍️ Ambil di Outlet'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#FFE9E3]/80 p-1.5 rounded-2xl border border-[#D2C5AB]/40">
            {/* Delivery Tab */}
            <button
              type="button"
              onClick={() => setOrderMode('delivery')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-headline text-xs sm:text-sm cursor-pointer ${
                orderMode === 'delivery'
                  ? 'bg-[#FFC700] text-[#311309] ring-2 ring-[#765B00]/40 font-bold shadow-sm'
                  : 'bg-white text-[#4F4632] border border-[#D2C5AB]/30 hover:text-[#311309]'
              }`}
            >
              <span className="material-symbols-outlined text-lg shrink-0">two_wheeler</span>
              <span className="truncate">🛵 Delivery (Kurir/Ojol)</span>
              {orderMode === 'delivery' && (
                <span className="w-4 h-4 rounded-full bg-[#311309] text-[#FFC700] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[10px]">done</span>
                </span>
              )}
            </button>

            {/* Takeaway Tab */}
            <button
              type="button"
              onClick={() => setOrderMode('takeaway')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-headline text-xs sm:text-sm cursor-pointer ${
                orderMode === 'takeaway'
                  ? 'bg-[#FFC700] text-[#311309] ring-2 ring-[#765B00]/40 font-bold shadow-sm'
                  : 'bg-white text-[#4F4632] border border-[#D2C5AB]/30 hover:text-[#311309]'
              }`}
            >
              <span className="material-symbols-outlined text-lg shrink-0">shopping_bag</span>
              <span className="truncate">🛍️ Takeaway (Ambil di Outlet)</span>
              {orderMode === 'takeaway' && (
                <span className="w-4 h-4 rounded-full bg-[#311309] text-[#FFC700] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[10px]">done</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* STEP 2: Pilih Varian Menu Box Bar */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center font-headline font-bold text-xs">
              2
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Pilih Varian Cheesecake
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSelectBestSellers}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all bg-[#FFC700] text-[#311309] border border-[#FFC700]/60 shadow-sm active:scale-95 cursor-pointer ring-1 ring-[#765B00]/40"
            >
              <span className="material-symbols-outlined text-sm text-[#8B4F2F]">star</span>
              <span>⭐ Paket Best Seller</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#8B4F2F] text-white font-bold">
                4 Varian
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetOrder}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BA1A1A] bg-[#FFEDE8] hover:bg-[#FFE9E3] border border-[#BA1A1A]/30 px-2.5 py-1 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">restart_alt</span>
              <span>Reset</span>
            </button>

            <span className="font-headline font-bold text-xs text-[#964900] bg-[#FFC29A]/40 px-2.5 py-1 rounded-full">
              {totals.totalQty} Box Dipilih
            </span>
          </div>
        </div>

        {/* Variant Filter Bar */}
        <div className="flex items-center gap-1.5 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setVariantFilter('all')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              variantFilter === 'all'
                ? 'bg-[#FFC700] text-[#311309] shadow-sm ring-1 ring-[#765B00]/40'
                : 'bg-white text-[#4F4632] border border-[#D2C5AB]/30'
            }`}
          >
            <span className="material-symbols-outlined text-sm">category</span>
            <span>Semua Varian</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#311309] text-[#FFC700] font-bold">
              12
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVariantFilter('ready')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              variantFilter === 'ready'
                ? 'bg-[#E7FFDB] text-[#25D366] border border-[#25D366]/40 shadow-sm ring-1 ring-[#25D366]/40'
                : 'bg-white text-[#4F4632] border border-[#D2C5AB]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            <span>🟢 Stok Melimpah</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#25D366] text-white font-bold">
              8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVariantFilter('limited')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              variantFilter === 'limited'
                ? 'bg-[#FFEDE8] text-[#BA1A1A] border border-[#BA1A1A]/30 shadow-sm ring-1 ring-[#BA1A1A]/30'
                : 'bg-white text-[#4F4632] border border-[#D2C5AB]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-pulse"></span>
            <span>⚡ Sisa Sedikit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#BA1A1A] text-white font-bold">
              4
            </span>
          </button>
        </div>

        {/* 12 Product Items List */}
        <div className="space-y-2.5">
          {filteredProducts.map((product) => {
            const qty = cart[product.id] || 0;
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-[#D2C5AB]/25 hover:border-[#8B4F2F]/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FFF1ED] flex items-center justify-center shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline font-bold text-sm text-[#311309] truncate">
                        {product.name}
                      </h3>
                      {product.tag && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: product.badgeBg || product.headerColor }}
                        >
                          {product.tag}
                        </span>
                      )}
                      {product.stockLabel && (
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                            product.stockStatus === 'limited'
                              ? 'bg-[#FFEDE8] text-[#BA1A1A] border-[#BA1A1A]/30 animate-pulse'
                              : 'bg-[#E7FFDB] text-[#25D366] border-[#25D366]/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.stockStatus === 'limited' ? 'bg-[#BA1A1A]' : 'bg-[#25D366]'
                            }`}
                          ></span>
                          {product.stockLabel}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-[#4F4632] truncate mt-0.5">
                      {product.subtitle}
                    </p>
                    <span className="font-headline font-bold text-xs text-[#8B4F2F]">
                      Rp 25.000
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-[#FFF1ED] px-2 py-1 rounded-full border border-black/5">
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, -1)}
                    className="w-7 h-7 rounded-full bg-white text-[#311309] flex items-center justify-center text-sm font-bold shadow-xs active:scale-90 transition-transform cursor-pointer"
                    aria-label={`Kurangi ${product.name}`}
                  >
                    -
                  </button>
                  <span className="font-headline font-bold text-sm text-[#311309] w-5 text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, 1)}
                    className="w-7 h-7 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center text-sm font-bold shadow-xs active:scale-90 transition-transform cursor-pointer"
                    aria-label={`Tambah ${product.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STEP 3: Data Pemesan (Dynamic View Delivery vs Takeaway) */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center font-headline font-bold text-xs">
              3
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              {orderMode === 'delivery'
                ? 'Data Pengiriman Kurir / Ojol'
                : 'Data Pengambilan di Outlet'}
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFE9E3] text-[#8B4F2F]">
            {orderMode === 'delivery' ? 'Mode Delivery' : 'Mode Takeaway'}
          </span>
        </div>

        {orderMode === 'delivery' ? (
          /* CONTAINER FORM DELIVERY */
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-[#D2C5AB]/30">
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Nama Pemesan / Penerima
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">person</span>
                <input
                  type="text"
                  value={delName}
                  onChange={(e) => setDelName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Nomor WhatsApp Penerima
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">call</span>
                <input
                  type="tel"
                  value={delPhone}
                  onChange={(e) => setDelPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>
            </div>

            <div className="border border-[#8B4F2F]/40 bg-[#FFF1ED] p-3 rounded-xl space-y-2">
              <label className="font-body text-xs font-bold text-[#8B4F2F] flex items-center justify-between">
                <span>Alamat Lengkap Pengantaran</span>
                <span className="text-[10px] bg-[#8B4F2F] text-white px-2 py-0.5 rounded-full font-headline font-bold">
                  Wajib
                </span>
              </label>
              <div className="flex items-start bg-white rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2 mt-0.5">
                  home_pin
                </span>
                <input
                  type="text"
                  value={delAddress}
                  onChange={(e) => setDelAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>

              <div className="flex items-center bg-white rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-base mr-2">
                  share_location
                </span>
                <input
                  type="text"
                  value={delPinpoint}
                  onChange={(e) => setDelPinpoint(e.target.value)}
                  placeholder="Patokan / Link Google Maps / Shareloc"
                  className="bg-transparent w-full text-xs outline-none font-body"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#4F4632] font-medium pt-0.5">
                <span className="material-symbols-outlined text-xs text-[#8B4F2F]">local_shipping</span>
                <span>Ongkir ditanggung pembeli sesuai tarif GoSend / GrabExpress.</span>
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Catatan Pengiriman / Dapur
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-base mr-2">
                  edit_note
                </span>
                <input
                  type="text"
                  value={delNotes}
                  onChange={(e) => setDelNotes(e.target.value)}
                  placeholder="Contoh: Minta sendok kayu extra ya kak"
                  className="bg-transparent w-full text-xs outline-none font-body"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[#4F4632] font-body text-[11px] text-center pt-1">
              <span className="material-symbols-outlined text-xs text-[#FFC700]">lock</span>
              <span>
                Pesan akan otomatis dialihkan ke WhatsApp Admin {activeOutlet.name} ({activeOutlet.phoneDisplay})
              </span>
            </div>
          </div>
        ) : (
          /* CONTAINER FORM TAKEAWAY */
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-[#D2C5AB]/30">
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Nama Pengambil
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">person</span>
                <input
                  type="text"
                  value={takeName}
                  onChange={(e) => setTakeName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Nomor WhatsApp Pengambil
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">call</span>
                <input
                  type="tel"
                  value={takePhone}
                  onChange={(e) => setTakePhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>
            </div>

            <div className="border border-[#FFC700]/60 bg-[#FFF1ED] p-3 rounded-xl space-y-1.5">
              <label className="font-body text-xs font-bold text-[#8B4F2F] flex items-center justify-between">
                <span>Estimasi Jam Pengambilan di Outlet</span>
                <span className="text-[10px] bg-[#FFC700] text-[#311309] px-2 py-0.5 rounded-full font-bold">
                  Outlet Siap Sedia
                </span>
              </label>
              <div className="flex items-center bg-white rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-base mr-2">
                  schedule
                </span>
                <input
                  type="text"
                  value={takeTime}
                  onChange={(e) => setTakeTime(e.target.value)}
                  placeholder="Hari &amp; Jam pengambilan..."
                  className="bg-transparent w-full text-sm outline-none font-body"
                />
              </div>
              <span className="text-[11px] text-[#4F4632] flex items-center gap-1 pt-0.5">
                <span className="material-symbols-outlined text-xs text-[#8B4F2F]">store</span>
                Kue akan disiapkan fresh sebelum jam pengambilan Anda di {activeOutlet.name}.
              </span>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Catatan Pengambilan
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 text-[#311309] border border-[#D2C5AB]/30">
                <span className="material-symbols-outlined text-[#8B4F2F] text-base mr-2">
                  edit_note
                </span>
                <input
                  type="text"
                  value={takeNotes}
                  onChange={(e) => setTakeNotes(e.target.value)}
                  placeholder="Contoh: Tolong siapkan sebelum jam 14.30 ya min"
                  className="bg-transparent w-full text-xs outline-none font-body"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[#4F4632] font-body text-[11px] text-center pt-1">
              <span className="material-symbols-outlined text-xs text-[#FFC700]">lock</span>
              <span>
                Pesan akan otomatis dialihkan ke WhatsApp Admin {activeOutlet.name} ({activeOutlet.phoneDisplay})
              </span>
            </div>
          </div>
        )}
      </section>

      {/* STEP 4: Langkah Pembayaran & Bukti Transfer */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center font-headline font-bold text-xs">
              4
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Pembayaran &amp; Bukti Transfer
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E7FFDB] text-[#25D366] flex items-center gap-1 shadow-xs">
            <span className="material-symbols-outlined text-xs">verified</span> Bebas Biaya Admin
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 border border-[#D2C5AB]/30">
          {/* QRIS Card Display */}
          <div className="rounded-2xl p-3.5 bg-[#FFF1ED] border border-[#FFC700]/40 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#25D366] text-white text-[10px] font-bold tracking-tight">
                  QRIS NASIONAL
                </span>
                <span className="text-[11px] font-body text-[#4F4632] font-medium">
                  GoPay, OVO, Dana, BCA, Mandiri
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC700] text-[#311309] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">bolt</span> Verifikasi Otomatis
              </span>
            </div>

            {/* Simulated QR Visual */}
            <div className="p-3 bg-white rounded-xl shadow-sm flex flex-col items-center border border-[#D2C5AB]/30 text-center">
              <div className="w-36 h-36 bg-white flex items-center justify-center rounded-lg border-2 border-dashed border-[#311309]/20 relative p-1">
                <div className="w-full h-full bg-[#111] p-1.5 rounded flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                    <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-white px-1.5 py-0.5 rounded text-[8px] font-headline font-bold text-black tracking-wider">
                      CHEESEHOLIC
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                    <div className="w-6 h-6 border-2 border-white bg-black flex flex-wrap p-0.5 gap-0.5">
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-body text-[#4F4632] font-semibold mt-1.5 block">
                NMID: ID1020039281729 - CHEESEHOLIC BDL
              </span>
            </div>

            <div className="w-full flex items-center justify-between pt-1 text-center bg-white p-2.5 rounded-xl border border-[#D2C5AB]/30">
              <div className="text-left">
                <span className="text-[10px] font-body text-[#4F4632] block">
                  Nominal Sesuai Pesanan:
                </span>
                <span className="font-headline font-bold text-base sm:text-lg text-[#8B4F2F]">
                  {formatRupiah(totals.totalPrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex items-center gap-1 text-xs font-bold text-[#8B4F2F] bg-[#FFE9E3] hover:bg-[#FFC700] hover:text-[#311309] px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Unduh QR</span>
              </button>
            </div>
          </div>

          {/* Transfer Bank Manual List */}
          <div className="space-y-2">
            <span className="font-body text-[11px] text-[#4F4632] font-semibold block">
              Nomor Rekening Resmi Cheeseholic:
            </span>

            {BANK_ACCOUNTS.map((acc) => (
              <div
                key={acc.bankName}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FFF1ED] border border-[#D2C5AB]/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-12 h-7 rounded ${acc.badgeColor} text-white flex items-center justify-center font-headline font-bold text-[10px] shrink-0 shadow-xs`}
                  >
                    {acc.bankName}
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline text-xs sm:text-sm text-[#311309] font-bold tracking-wide">
                      {acc.accountNumber}
                    </div>
                    <span className="font-body text-[11px] text-[#4F4632] truncate block">
                      {acc.accountHolder}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyBank(acc.accountNumber, acc.bankName)}
                  className="flex items-center gap-1 text-xs font-bold text-[#8B4F2F] bg-white hover:bg-[#FFE9E3] px-2.5 py-1.5 rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer border border-[#D2C5AB]/30"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedBank === acc.bankName ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedBank === acc.bankName ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Interactive Unggah Bukti Transfer / Resi Container */}
          <div className="pt-1">
            <label className="font-body text-xs font-semibold text-[#311309] flex items-center justify-between mb-1.5">
              <span>Unggah Bukti Transfer / Resi</span>
              <span className="text-[11px] text-[#25D366] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {hasReceipt ? 'Bukti Terlampir' : 'Opsional'}
              </span>
            </label>

            <div className="border-2 border-dashed border-[#8B4F2F]/40 bg-[#FFF1ED] rounded-2xl p-3 flex items-center justify-between gap-3 hover:bg-[#FFE9E3]/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#8B4F2F]/10 flex items-center justify-center text-[#8B4F2F] shrink-0 relative overflow-hidden">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  {hasReceipt && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[9px]">
                      <span className="material-symbols-outlined text-[10px]">done</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-body text-xs sm:text-sm font-bold text-[#311309] truncate">
                    {receiptFileName}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#4F4632]">
                    <span>{receiptFileSize}</span>
                    <span>•</span>
                    <span className="text-[#25D366] font-semibold">
                      {hasReceipt ? 'Siap dikirim ke admin' : 'Pilih file struk'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#8B4F2F] shrink-0">
                <label
                  htmlFor={fileUploadId}
                  className="p-1.5 rounded-lg bg-white text-[#4F4632] hover:text-[#8B4F2F] shadow-xs cursor-pointer"
                  title="Ganti Bukti Transfer"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                </label>
                <input
                  id={fileUploadId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <p className="font-body text-[11px] text-[#4F4632] mt-1.5 leading-snug flex items-start gap-1">
              <span className="material-symbols-outlined text-xs text-[#8B4F2F] shrink-0 mt-0.5">
                info
              </span>
              <span>
                Bukti transfer akan otomatis disertakan atau dikirim bersamaan dengan pesan WhatsApp ke admin (Max 5MB).
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* STEP 5: Live Real-time WhatsApp Message Preview */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center font-headline font-bold text-xs">
              5
            </span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Preview Teks WhatsApp
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCopyWaText}
            className="flex items-center gap-1 text-xs font-bold text-[#8B4F2F] bg-[#FFE9E3] hover:bg-[#FFC700] hover:text-[#311309] px-3 py-1 rounded-full active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedWaText ? 'check' : 'content_copy'}
            </span>
            <span>{copiedWaText ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>

        {/* Quick Format Switcher for Preview */}
        <div className="flex items-center gap-2 bg-[#FFE9E3]/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderMode('delivery')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              orderMode === 'delivery'
                ? 'bg-[#FFC700] text-[#311309] shadow-sm'
                : 'text-[#4F4632] hover:text-[#311309]'
            }`}
          >
            🛵 Format Delivery
          </button>
          <button
            type="button"
            onClick={() => setOrderMode('takeaway')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              orderMode === 'takeaway'
                ? 'bg-[#FFC700] text-[#311309] shadow-sm'
                : 'text-[#4F4632] hover:text-[#311309]'
            }`}
          >
            🛍️ Format Takeaway
          </button>
        </div>

        {/* Realistic WhatsApp Chat Bubble Container */}
        <div className="bg-[#ECE5DD] p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#D2C5AB]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-1">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#54656F] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              <span>Format Siap Kirim ke CS {activeOutlet.name} ({activeOutlet.phoneDisplay})</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/70 text-[#8B4F2F] text-[10px] font-bold">
              <span className="material-symbols-outlined text-xs text-[#25D366]">verified</span>
              <span>Admin Terpilih: {activeOutlet.role}</span>
            </div>
          </div>

          <div className="bg-[#E7FFDB] rounded-2xl rounded-tl-sm p-3.5 shadow-sm text-[#311309] relative">
            <pre className="font-body text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-all font-mono">
              {waMessageText}
            </pre>
            <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-[#311309]/50 font-medium">
              <span>Baru saja</span>
              <span className="material-symbols-outlined text-xs text-[#53BDEB]">done_all</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Summary & CTA */}
      <div className="pt-2">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-[#FFC700]/40 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-body text-xs text-[#4F4632]">
                Total Pesanan ({totals.totalQty} Box)
              </span>
              <span className="font-headline font-extrabold text-2xl text-[#8B4F2F] leading-none mt-0.5">
                {formatRupiah(totals.totalPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="font-headline text-xs font-bold text-[#4F4632] block">
                {orderMode === 'delivery' ? 'Pengiriman Kurir' : 'Ambil Sendiri'}
              </span>
              <span className="font-body text-xs text-[#8B4F2F] font-bold truncate max-w-[170px] block">
                {activeOutlet.name} {orderMode === 'delivery' ? '(Ojol)' : ''}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={waSendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-headline font-bold text-sm sm:text-base shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 2C6.516 2 2.03 6.485 2.03 12c0 1.93.55 3.73 1.503 5.257L2 22l4.896-1.504A9.957 9.957 0 0 0 12.031 22C17.547 22 22.03 17.515 22.03 12s-4.483-10-9.999-10zm5.82 14.184c-.244.686-1.22 1.258-1.748 1.336-.48.072-1.096.103-3.23-.78-2.56-1.058-4.2-3.673-4.327-3.843-.127-.17-1.03-1.372-1.03-2.616 0-1.244.654-1.854.887-2.106.233-.252.51-.314.68-.314.17 0 .34.002.488.01.157.009.366-.06.574.437.214.512.73 1.78.793 1.91.063.128.106.279.02.449-.085.17-.128.277-.255.426-.127.15-.266.335-.38.45-.128.127-.26.265-.112.52.148.254.658 1.084 1.411 1.756.97.865 1.787 1.134 2.042 1.261.255.127.404.106.552-.064.15-.17.637-.743.807-1.002.17-.258.34-.212.573-.127.234.085 1.485.7 1.74.827.255.128.425.191.488.3.064.108.064.623-.18 1.309z" />
            </svg>
            <span>
              {orderMode === 'delivery'
                ? 'Kirim Pesan Delivery ke WA'
                : 'Kirim Pesan Takeaway ke WA'}
            </span>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[#4F4632] font-body text-[11px] text-center">
            <span className="material-symbols-outlined text-xs text-[#FFC700]">lock</span>
            <span>
              Format langsung terbuka otomatis di chat WhatsApp admin {activeOutlet.name} ({activeOutlet.phoneDisplay})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
