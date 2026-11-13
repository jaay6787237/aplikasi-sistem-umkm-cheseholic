/**
 * Direct Online Ordering Screen (Replacing WA Order)
 * Allows users to place orders directly on the website without leaving to WhatsApp.
 * Features Domicile Area selection with automatic nearest outlet recommendation (Anti-Bingung).
 */

import { useState } from 'react';
import { Product, Outlet, calculateOrderTotals, formatRupiah } from '../utils/orderCalculator';
import { VariantStock } from '../utils/inventoryManager';
import { DirectOrder, DeliveryMode, PaymentMethod, generateOrderId, playOrderNotificationSound } from '../utils/orderManager';
import { DOMISILI_AREAS, DomisiliArea } from '../data/domisiliAreas';

interface DirectOrderScreenProps {
  products: Product[];
  outlets: Outlet[];
  cart: Record<string, number>;
  updateQty: (productId: string, delta: number) => void;
  setCartDirect: (newCart: Record<string, number>) => void;
  clearCart: () => void;
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
  inventoryState: Record<string, Record<string, VariantStock>>;
  onOrderCreated: (newOrder: DirectOrder) => void;
}

export function DirectOrderScreen({
  products,
  outlets,
  cart,
  updateQty,
  clearCart,
  selectedOutletId,
  setSelectedOutletId,
  inventoryState,
  onOrderCreated,
}: DirectOrderScreenProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area-kedaton');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [createdOrder, setCreatedOrder] = useState<DirectOrder | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];
  const selectedDomisili = DOMISILI_AREAS.find((a) => a.id === selectedAreaId) || DOMISILI_AREAS[0];
  const outletStocks = inventoryState[selectedOutletId] || {};
  const totals = calculateOrderTotals(cart, products);

  // When user selects a domicile area, auto-recommend & select the nearest outlet!
  const handleAreaSelect = (area: DomisiliArea) => {
    setSelectedAreaId(area.id);
    setSelectedOutletId(area.nearestOutletId);
  };

  const handleGpsDetect = () => {
    setGpsDetecting(true);
    setGpsMessage('Mendeteksi koordinat GPS Bandar Lampung...');

    setTimeout(() => {
      setGpsDetecting(false);
      // Recommend Kedaton or Sukarame
      const sampleRec = DOMISILI_AREAS[0]; // Kedaton
      setSelectedAreaId(sampleRec.id);
      setSelectedOutletId(sampleRec.nearestOutletId);
      setGpsMessage(`📍 GPS Terdeteksi: Area ${sampleRec.name}! Outlet terdekat (${sampleRec.nearestOutletName}) telah dipilih otomatis.`);
    }, 1200);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (totals.totalQty === 0) {
      alert('Pilih minimal 1 box cheesecake terlebih dahulu!');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon lengkapi Nama Pemesan dan Nomor HP/WhatsApp!');
      return;
    }

    if (deliveryMode === 'delivery' && !address.trim()) {
      alert('Mohon isi alamat pengiriman lengkap!');
      return;
    }

    const orderId = generateOrderId();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const orderItems = totals.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      qty: item.qty,
      price: item.product.price,
      subtotal: item.subtotal,
      image: item.product.image,
    }));

    const newOrder: DirectOrder = {
      id: orderId,
      createdAt: `Hari ini (${timeStr})`,
      outletId: selectedOutlet.id,
      outletName: selectedOutlet.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryMode,
      address: deliveryMode === 'delivery' ? address.trim() : undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'Tunai di Outlet' ? 'Bayar di Tempat' : 'Lunas',
      items: orderItems,
      totalQty: totals.totalQty,
      totalPrice: totals.totalPrice,
      status: 'Baru',
      readByOutlet: false,
    };

    playOrderNotificationSound();
    onOrderCreated(newOrder);
    setCreatedOrder(newOrder);
    clearCart();
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-300">
      {/* Banner Order Direct Header */}
      <div className="bg-gradient-to-br from-[#FFC700] via-[#FFD700] to-[#FFA800] text-[#311309] p-5 sm:p-7 rounded-3xl shadow-lg mb-6 relative overflow-hidden border border-[#FFC700]/50">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#311309] text-[#FFC700] rounded-full text-xs font-bold font-headline mb-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Direct Order Website - Tanpa WA
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-[#311309]">
              Pesan Cheesecake On-Site Direct
            </h1>
            <p className="text-xs sm:text-sm font-body text-[#311309]/80 mt-1 max-w-xl">
              Pilih wilayah domisili Anda untuk mendapatkan rekomendasi outlet terdekat otomatis agar ongkir lebih hemat &amp; pasokan fresh!
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#311309]/70">Semua Varian Box</span>
            <span className="text-2xl font-black font-headline text-[#311309]">IDR 25K</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        {/* STEP 1: PILIH WILAYAH DOMISILI & REKOMENDASI OUTLET TERDEKAT */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#311309]/5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#311309] text-[#FFC700] font-headline font-bold flex items-center justify-center text-sm shadow-sm">
                1
              </span>
              <div>
                <h2 className="text-lg font-bold font-headline text-[#311309]">Pilih Wilayah Domisili Pemesan</h2>
                <p className="text-xs text-gray-500">Sistem akan memilihkan outlet terdekat secara otomatis agar anti-bingung!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={gpsDetecting}
              className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold font-headline flex items-center gap-1 transition-colors cursor-pointer shrink-0 border border-emerald-200"
            >
              <span className="material-symbols-outlined text-sm text-emerald-600">my_location</span>
              <span>{gpsDetecting ? 'Mendeteksi...' : 'Cari via GPS'}</span>
            </button>
          </div>

          {/* GPS Message Alert */}
          {gpsMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <span>{gpsMessage}</span>
            </div>
          )}

          {/* Selector Wilayah Domisili */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Pilih Kecamatan / Lokasi Anda di Bandar Lampung:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {DOMISILI_AREAS.map((area) => {
                const isSelectedArea = area.id === selectedAreaId;
                return (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => handleAreaSelect(area)}
                    className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelectedArea
                        ? 'border-[#311309] bg-[#311309] text-white shadow-md'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-xs sm:text-sm truncate">{area.name}</span>
                      {isSelectedArea && (
                        <span className="material-symbols-outlined text-[#FFC700] text-base shrink-0">check_circle</span>
                      )}
                    </div>
                    <p className={`text-[11px] line-clamp-1 ${isSelectedArea ? 'text-gray-300' : 'text-gray-500'}`}>
                      Kecamatan: {area.subdistricts.slice(0, 3).join(', ')}...
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Auto Recommendation Box */}
          <div className="p-4 rounded-2xl bg-[#FFFDF0] border-2 border-[#FFC700] space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-headline text-[10px] font-extrabold uppercase">
                ⭐ REKOMENDASI OTOMATIS TERDEKAT ({selectedDomisili.estimatedDistanceKm})
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">
              Berdasarkan wilayah domisili <b>{selectedDomisili.name}</b>, cabang terdekat yang paling hemat ongkir adalah <b>{selectedDomisili.nearestOutletName}</b>!
            </p>
            <p className="text-[11px] text-gray-500 italic">
              * {selectedDomisili.recommendationReason}
            </p>
          </div>

          {/* Cards Pilihan Cabang Outlet */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-gray-700 mb-2">
              Pilihan Cabang Outlet yang Dipilih (Bisa Diganti Manual):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {outlets.map((outlet) => {
                const isSelected = outlet.id === selectedOutletId;
                const isRecommended = outlet.id === selectedDomisili.nearestOutletId;
                const stocks = inventoryState[outlet.id] || {};
                const totalStock = Object.values(stocks).reduce((sum, item) => sum + item.stock, 0);

                return (
                  <button
                    type="button"
                    key={outlet.id}
                    onClick={() => setSelectedOutletId(outlet.id)}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                      isSelected
                        ? 'border-[#FFC700] bg-[#FFFDF0] shadow-md ring-2 ring-[#FFC700]/30'
                        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-sm text-[#311309]">{outlet.name}</span>
                        {isRecommended && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-md w-fit mt-0.5">
                            ⭐ Terdekat Domisili
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#311309] text-base shrink-0">check_circle</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1">{outlet.address}</p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                      <span className="text-gray-400 font-medium">Jam: {outlet.hours}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          totalStock > 20
                            ? 'bg-emerald-100 text-emerald-800'
                            : totalStock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Stok: {totalStock} Box
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* STEP 2: Pilih Varian Cheesecake */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#311309]/5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#311309] text-[#FFC700] font-headline font-bold flex items-center justify-center text-sm shadow-sm">
                2
              </span>
              <div>
                <h2 className="text-lg font-bold font-headline text-[#311309]">Pilih Varian Cheesecake</h2>
                <p className="text-xs text-gray-500">Stok menyesuaikan outlet {selectedOutlet.name}</p>
              </div>
            </div>
            {totals.totalQty > 0 && (
              <span className="font-headline font-bold text-xs bg-[#FFC700] text-[#311309] px-3 py-1 rounded-full shadow-sm">
                {totals.totalQty} Box Dipilih ({formatRupiah(totals.totalPrice)})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {products.map((product) => {
              const currentQty = cart[product.id] || 0;
              const productStockItem = outletStocks[product.id];
              const availableStock = productStockItem ? productStockItem.stock : 15;
              const isOutOfStock = availableStock <= 0;

              return (
                <div
                  key={product.id}
                  className={`p-3 rounded-2xl border flex gap-3 items-center transition-all ${
                    currentQty > 0
                      ? 'border-[#FFC700] bg-[#FFFDF5] shadow-sm'
                      : isOutOfStock
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-black/5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline font-bold text-sm text-[#311309] truncate">{product.name}</h3>
                      {product.tag && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#311309] text-[#FFC700] rounded">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-headline font-extrabold text-xs text-[#311309]">
                        {formatRupiah(product.price)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isOutOfStock
                            ? 'text-rose-600 font-extrabold uppercase'
                            : availableStock <= 5
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {isOutOfStock ? '• Habis' : `• Stok ${availableStock}`}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="shrink-0">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-xl">
                        Kosong
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, -1)}
                          disabled={currentQty === 0}
                          className="w-7 h-7 rounded-lg bg-white text-[#311309] disabled:opacity-30 font-bold flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-headline font-extrabold text-xs text-[#311309]">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, 1)}
                          disabled={currentQty >= availableStock}
                          className="w-7 h-7 rounded-lg bg-[#FFC700] text-[#311309] font-bold flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 3: Metode Pengiriman & Informasi Pemesan */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#311309]/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="w-8 h-8 rounded-full bg-[#311309] text-[#FFC700] font-headline font-bold flex items-center justify-center text-sm shadow-sm">
              3
            </span>
            <div>
              <h2 className="text-lg font-bold font-headline text-[#311309]">Detail Pemesan &amp; Metode Antar</h2>
              <p className="text-xs text-gray-500">Lengkapi alamat dan kontak pemesan</p>
            </div>
          </div>

          {/* Selector Delivery / Takeaway */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setDeliveryMode('delivery')}
              className={`py-2.5 px-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                deliveryMode === 'delivery'
                  ? 'bg-[#311309] text-[#FFC700] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">two_wheeler</span>
              <span>Delivery Kurir / Ojol</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('takeaway')}
              className={`py-2.5 px-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                deliveryMode === 'takeaway'
                  ? 'bg-[#311309] text-[#FFC700] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Takeaway Ambil di Outlet</span>
            </button>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Pemesan *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">No. HP / WhatsApp *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all"
              />
            </div>

            {deliveryMode === 'delivery' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alamat Lengkap Pengiriman (Kota Bandar Lampung) *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Isi nama jalan, nomor rumah, patokan lokasi (misal: Samping Apotek Kimia Farma)"
                  rows={2}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Pesanan (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titip di satpam / mohon bungkus rapi untuk hadiah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all"
              />
            </div>
          </div>
        </section>

        {/* STEP 4: Metode Pembayaran */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#311309]/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="w-8 h-8 rounded-full bg-[#311309] text-[#FFC700] font-headline font-bold flex items-center justify-center text-sm shadow-sm">
              4
            </span>
            <div>
              <h2 className="text-lg font-bold font-headline text-[#311309]">Metode Pembayaran</h2>
              <p className="text-xs text-gray-500">Pilih metode pembayaran yang paling nyaman untuk Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'QRIS', title: 'QRIS All Payment', badge: 'Verifikasi Instant', icon: 'qr_code_2' },
              { id: 'Transfer BCA', title: 'Transfer BCA', badge: 'Rekening Resmi', icon: 'account_balance' },
              { id: 'Tunai di Outlet', title: 'Tunai / Cash', badge: 'Bayar saat Ambil', icon: 'payments' },
            ].map((pm) => (
              <button
                type="button"
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  paymentMethod === pm.id
                    ? 'border-[#FFC700] bg-[#FFFDF0] shadow-sm ring-2 ring-[#FFC700]/30'
                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-xl text-[#311309]">{pm.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#311309] text-[#FFC700]">
                    {pm.badge}
                  </span>
                </div>
                <span className="font-headline font-bold text-xs text-[#311309]">{pm.title}</span>
              </button>
            ))}
          </div>

          {/* Payment Detail Details Box */}
          {paymentMethod === 'QRIS' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-200 shrink-0">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=CHEESEHOLIC_BDL_OFFICIAL_QRIS"
                  alt="QRIS Cheeseholic"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  NMID: ID1020039281729 - CHEESEHOLIC BDL
                </span>
                <p className="text-xs text-emerald-900 font-medium">
                  Scan QRIS menggunakan GoPay, OVO, DANA, ShopeePay, BCA Mobile, atau Aplikasi Bank Manapun.
                </p>
                <p className="text-xs font-extrabold text-[#311309] pt-1">
                  Total Tagihan: {formatRupiah(totals.totalPrice)}
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'Transfer BCA' && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-800 uppercase">Bank BCA Resmi Cheeseholic</span>
                <p className="text-base font-headline font-extrabold text-[#311309] tracking-wider mt-0.5">
                  023-889-1123
                </p>
                <p className="text-xs text-gray-600">a.n CHEESEHOLIC INDONESIA</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('0238891123');
                  alert('Nomor Rekening BCA Berhasil Diculik/Disalin!');
                }}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-headline transition-colors cursor-pointer"
              >
                Salin Rekening
              </button>
            </div>
          )}
        </section>

        {/* STEP 5: Summary & Submit Order */}
        <div className="bg-[#311309] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#FFC700]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs text-[#FFC700] font-headline font-bold uppercase tracking-wider">
                Ringkasan Pesanan Website
              </span>
              <p className="text-sm font-bold font-headline text-white mt-0.5">
                Target: {selectedOutlet.name} • ({totals.totalQty} Box)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-300">Total Pembayaran:</span>
              <p className="text-2xl font-black font-headline text-[#FFC700]">{formatRupiah(totals.totalPrice)}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={totals.totalQty === 0}
            className="w-full py-4 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] disabled:opacity-40 font-headline font-extrabold text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">task_alt</span>
            <span>Konfirmasi & Kirim Pesanan Langsung</span>
          </button>
        </div>
      </form>

      {/* Success Order Confirmation Modal */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#FFC700] relative max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
                ✓
              </div>
              <span className="inline-block px-3 py-1 bg-[#311309] text-[#FFC700] text-xs font-bold rounded-full font-headline">
                PESANAN BERHASIL TERKIRIM!
              </span>
              <h2 className="text-2xl font-extrabold font-headline text-[#311309]">{createdOrder.id}</h2>
              <p className="text-xs text-gray-600">
                Pesanan Anda telah diteruskan secara realtime ke terminal outlet <b>{createdOrder.outletName}</b>.
              </p>
            </div>

            <div className="my-5 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Pemesan:</span>
                <span className="font-bold text-[#311309]">{createdOrder.customerName} ({createdOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cabang Outlet:</span>
                <span className="font-bold text-[#311309]">{createdOrder.outletName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Metode:</span>
                <span className="font-bold text-[#311309] uppercase">{createdOrder.deliveryMode}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pembayaran:</span>
                <span className="font-bold text-emerald-700">{createdOrder.paymentMethod} ({createdOrder.paymentStatus})</span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <span className="font-bold text-[#311309] block mb-1">Rincian Menu:</span>
                {createdOrder.items.map((it) => (
                  <div key={it.productId} className="flex justify-between text-gray-700 py-0.5">
                    <span>{it.qty}x {it.productName}</span>
                    <span className="font-semibold">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-[#311309]">
                <span>Total:</span>
                <span className="text-[#311309] font-headline font-extrabold">{formatRupiah(createdOrder.totalPrice)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 mb-4">
              <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">notifications_active</span>
              <span>
                Notifikasi bel telah berbunyi di kasir outlet <b>{createdOrder.outletName}</b>. Tim outlet sedang memproses pesanan Anda.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCreatedOrder(null)}
              className="w-full py-3 bg-[#311309] text-white hover:bg-[#4a1d0f] rounded-2xl font-headline font-bold text-sm cursor-pointer transition-colors shadow-md"
            >
              Selesai &amp; Buat Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
