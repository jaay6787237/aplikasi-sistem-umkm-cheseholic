import React from 'react';
import { Product, Outlet, formatRupiah, calculateOrderTotals } from '../utils/orderCalculator';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, number>;
  products: Product[];
  outlets: Outlet[];
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
  updateQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  onProceedToDirectOrder: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  outlets,
  selectedOutletId,
  setSelectedOutletId,
  updateQty,
  clearCart,
  onProceedToDirectOrder,
}) => {
  if (!isOpen) return null;

  const totals = calculateOrderTotals(cart, products);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#FFC700]/30"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
      >
        {/* Header */}
        <div className="bg-[#FFC700] px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#E5A800]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#311309] text-2xl">
              shopping_basket
            </span>
            <h3
              id="cart-modal-title"
              className="font-headline font-bold text-lg text-[#311309]"
            >
              Keranjang Belanja ({totals.totalQty} Box)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#311309] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Item List Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-3 flex-grow">
          {totals.totalQty === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#4F4632] gap-3">
              <div className="w-16 h-16 rounded-full bg-[#FFE9E3] flex items-center justify-center text-[#8B4F2F]">
                <span className="material-symbols-outlined text-3xl">remove_shopping_cart</span>
              </div>
              <p className="font-headline font-bold text-base text-[#311309]">
                Keranjang belanjamu masih kosong
              </p>
              <p className="font-body text-xs text-[#4F4632] max-w-xs">
                Yuk pilih varian rasa Cheeseholic favoritmu dengan harga flat Rp 25.000/box!
              </p>
            </div>
          ) : (
            totals.items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-3 bg-[#FFF1ED] rounded-xl border border-[#D2C5AB]/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <span className="font-headline font-bold text-sm text-[#311309] block truncate">
                      {item.product.name}
                    </span>
                    <span className="font-body text-xs text-[#4F4632]">
                      Rp 25.000 x {item.qty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#8B4F2F] mr-1">
                    {formatRupiah(item.subtotal)}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full shadow-sm border border-black/5">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-6 h-6 rounded-full bg-[#FFF1ED] hover:bg-[#FFE9E3] text-[#311309] flex items-center justify-center text-xs font-bold active:scale-90 transition-transform cursor-pointer"
                      aria-label={`Kurangi ${item.product.name}`}
                    >
                      -
                    </button>
                    <span className="font-headline font-bold text-xs w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-transform cursor-pointer"
                      aria-label={`Tambah ${item.product.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {totals.totalQty > 0 && (
          <div className="p-4 sm:p-5 bg-[#FFE9E3]/70 border-t border-[#D2C5AB]/40 flex flex-col gap-3">
            {/* Outlet selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-xs font-semibold text-[#311309]">
                Pilihan Outlet Tujuan:
              </span>
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="font-body text-xs bg-white rounded-lg px-2.5 py-1.5 text-[#311309] border border-[#D2C5AB] focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total calculation */}
            <div className="flex items-center justify-between pt-1 border-t border-[#D2C5AB]/30">
              <span className="font-body text-xs text-[#4F4632]">
                Total ({totals.totalQty} Box):
              </span>
              <span className="font-headline font-extrabold text-lg text-[#8B4F2F]">
                {formatRupiah(totals.totalPrice)}
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                onClose();
                onProceedToDirectOrder();
              }}
              className="py-3 px-4 bg-[#311309] hover:bg-[#4a1d0f] text-[#FFC700] rounded-2xl font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
              <span>Lanjutkan Pesan Direct Online →</span>
            </button>

            <button
              onClick={clearCart}
              className="text-[11px] font-semibold text-[#BA1A1A] hover:underline text-center py-1 cursor-pointer"
            >
              Reset Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
