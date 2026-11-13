import React, { useState } from 'react';
import { Product, Outlet } from '../utils/orderCalculator';

interface MenuStorefrontScreenProps {
  products: Product[];
  outlets: Outlet[];
  cart: Record<string, number>;
  updateQty: (productId: string, delta: number) => void;
  onGoToDirectOrder: () => void;
  onGoToCabang: () => void;
}

export const MenuStorefrontScreen: React.FC<MenuStorefrontScreenProps> = ({
  products,
  outlets,
  cart,
  updateQty,
  onGoToDirectOrder,
  onGoToCabang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category === selectedCategory ||
      (selectedCategory === 'best' && item.category === 'best') ||
      (selectedCategory === 'choco' && item.category === 'choco') ||
      (selectedCategory === 'cheese' && item.category === 'cheese') ||
      (selectedCategory === 'coffee' && item.category === 'coffee');

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Announce Trust Bar */}
      <section className="bg-[#FFC700] text-[#311309] px-4 sm:px-6 py-2 border-b border-[#E5A800]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[#964900] text-lg shrink-0">
              verified
            </span>
            <span className="font-headline font-bold text-xs truncate">
              HALAL INDONESIA ID18110036353041225
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-full text-[#311309] text-[11px] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>5 Cabang Buka</span>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="relative w-full bg-[#FFC700] text-[#311309] px-4 sm:px-6 md:px-12 py-8 md:py-14 overflow-hidden border-b border-[#E5A800]">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/20 pointer-events-none blur-xl"></div>
        <div className="absolute -left-12 top-6 w-60 h-60 rounded-full bg-[#8B4F2F]/10 pointer-events-none blur-lg"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left Text */}
          <div className="flex flex-col items-start gap-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#60237C] text-white rounded-full shadow-sm text-xs font-headline font-bold">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>100% HALAL RESMI</span>
              </div>
              <span className="px-3 py-1 bg-[#8B4F2F] text-white rounded-full font-headline text-xs font-bold tracking-wider">
                FRESH DAILY BDL
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-headline font-extrabold text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#311309] leading-tight">
                Sensasi Cheesecake <br />
                <span className="text-[#964900] underline decoration-wavy decoration-[#964900]/60 decoration-2">
                  Lumer &amp; Lembut
                </span>{' '}
                Paling Hits!
              </h1>
              <p className="font-body text-sm sm:text-base text-[#311309]/85 max-w-xl leading-relaxed">
                Japanese sponge lembut berpadu cream cheese gurih lumer dan aneka topping mewah melimpah. Dibuat segar setiap hari dengan standar sertifikasi Halal MUI &amp; BPJPH.
              </p>
            </div>

            {/* Flat Price Pill */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-md border-l-4 border-[#8B4F2F]">
              <span className="font-headline text-xs sm:text-sm text-[#8B4F2F] font-bold tracking-tight">
                ALL VARIANT HARGA FLAT:
              </span>
              <span className="font-headline font-extrabold text-xl sm:text-2xl text-[#8B4F2F]">
                IDR 25K
              </span>
              <span className="font-body text-xs text-[#4F4632]">/ Box Bar</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGoToDirectOrder}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#311309] hover:bg-[#1C0904] text-[#FFC700] rounded-full font-headline font-bold text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                <span>Pesan Direct Online (Website)</span>
              </button>

              <button
                type="button"
                onClick={onGoToCabang}
                className="inline-flex items-center gap-1.5 px-5 py-3 bg-white hover:bg-[#FFF8F6] text-[#8B4F2F] rounded-full font-headline font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">location_on</span>
                <span>Lihat 5 Cabang Outlet</span>
              </button>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-3 gap-3 pt-4 w-full border-t border-[#311309]/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B4F2F] text-2xl">
                  bakery_dining
                </span>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-xs text-[#311309]">
                    Fresh Daily
                  </span>
                  <span className="font-body text-[11px] text-[#4F4632]">Panggang Pagi</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B4F2F] text-2xl">
                  workspace_premium
                </span>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-xs text-[#311309]">
                    100% Real Cheese
                  </span>
                  <span className="font-body text-[11px] text-[#4F4632]">Dairy Premium</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B4F2F] text-2xl">
                  star
                </span>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-xs text-[#311309]">
                    12 Varian Hits
                  </span>
                  <span className="font-body text-[11px] text-[#4F4632]">Paling Favorit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-white shadow-2xl flex items-center justify-center p-4 border-8 border-[#FFDBB0]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRvH_QFRxjOHIzu-zuDdMDsS6kxk5-SNbDGh9EOi5-pWaYs9MOcdmX3DtelsGBx7qAxZnDAiAUspp3eaGkRTGhX4mwN-ZG1MB7CHHiBR4f76Ztjg1rNp3AC6Ymk1ss19JAUm58WZn07f6bAK-XU5XoJeqdSncN19DngvQe4l05sGwC5UDL8fDg5gHwsWFMck_5NG49z_qsTyDI13kmV0GS85jAQCjZRnI6LboTkdel"
                alt="Cheeseholic Biscoff Signature Box"
                className="w-full h-full object-cover rounded-full shadow-inner"
              />
              <div className="absolute -top-3 -left-3 bg-[#60237C] text-white px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 transform -rotate-6">
                <span className="material-symbols-outlined text-sm text-[#FFC700]">verified</span>
                <div className="flex flex-col text-[10px] font-bold leading-tight">
                  <span>HALAL RESMI</span>
                  <span className="text-[8px] text-white/80">Kemenag &amp; MUI</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#8B4F2F] text-white px-4 py-2 rounded-2xl shadow-xl flex flex-col items-center transform rotate-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC700]">
                  Cuma
                </span>
                <span className="font-headline font-black text-xl leading-none">25K</span>
              </div>
            </div>
            <p className="font-body text-xs text-[#4F4632] mt-3 text-center">
              Penyajian higienis dalam box praktis siap santap atau simpan di kulkas hingga 5 hari.
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="w-full bg-[#311309] text-[#FFC700] py-2.5 overflow-hidden flex items-center">
        <div className="animate-marquee gap-8 font-headline text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">stars</span> LOTUS BISCOFF BEST SELLER
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">local_shipping</span> BISA INSTAN VIA GOFOOD / GRABFOOD / SHOPEEFOOD
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">schedule</span> 5 OUTLET BUKA TIAP HARI
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified</span> HALAL ID18110036353041225
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">savings</span> HARGA FLAT SEMUA RASA RP 25.000
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">storefront</span> KEDATON, PAHOMAN, UIN, KORPRI, NAVARA
          </span>
          <span>•</span>
        </div>
      </div>

      {/* MENU SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8" id="menu-catalog">
        <div className="flex flex-col gap-6">
          {/* Header & Filter Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 text-[#8B4F2F] font-headline text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">lunch_dining</span>
                <span>KATALOG RESMI CHEESEHOLIC</span>
              </div>
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#311309] tracking-tight">
                Menu Varian Box Bar (Semua Rasa Rp 25.000)
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#4F4632]">
                Pilih varian favoritmu sekarang. Nikmati dingin untuk sensasi ice cream lembut, atau suhu ruang untuk tekstur lumer.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#81765F] text-lg">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari varian rasa..."
                className="w-full bg-white text-[#311309] placeholder:text-[#81765F] text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#D2C5AB]/40 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#8B4F2F] text-white shadow-sm'
                  : 'bg-white text-[#4F4632] hover:bg-[#FFE9E3] border border-[#D2C5AB]/40'
              }`}
            >
              Semua Menu (12)
            </button>
            <button
              onClick={() => setSelectedCategory('best')}
              className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'best'
                  ? 'bg-[#8B4F2F] text-white shadow-sm'
                  : 'bg-white text-[#4F4632] hover:bg-[#FFE9E3] border border-[#D2C5AB]/40'
              }`}
            >
              Best Seller 🔥
            </button>
            <button
              onClick={() => setSelectedCategory('choco')}
              className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'choco'
                  ? 'bg-[#8B4F2F] text-white shadow-sm'
                  : 'bg-white text-[#4F4632] hover:bg-[#FFE9E3] border border-[#D2C5AB]/40'
              }`}
            >
              Choco Series 🍫
            </button>
            <button
              onClick={() => setSelectedCategory('cheese')}
              className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'cheese'
                  ? 'bg-[#8B4F2F] text-white shadow-sm'
                  : 'bg-white text-[#4F4632] hover:bg-[#FFE9E3] border border-[#D2C5AB]/40'
              }`}
            >
              Cheese &amp; Fruity 🍓
            </button>
            <button
              onClick={() => setSelectedCategory('coffee')}
              className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'coffee'
                  ? 'bg-[#8B4F2F] text-white shadow-sm'
                  : 'bg-white text-[#4F4632] hover:bg-[#FFE9E3] border border-[#D2C5AB]/40'
              }`}
            >
              Tea &amp; Coffee ☕
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const currentQty = cart[product.id] || 0;
              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#D2C5AB]/30 transition-all group"
                >
                  {/* Colored Header Banner */}
                  <div
                    className="text-white px-3 py-1.5 flex items-center justify-between"
                    style={{ backgroundColor: product.headerColor }}
                  >
                    <span className="font-headline font-bold text-xs uppercase tracking-wide truncate">
                      {product.name}
                    </span>
                    {product.tag && (
                      <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] font-bold shrink-0">
                        {product.tag}
                      </span>
                    )}
                  </div>

                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-[#FFF1ED] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#311309]/85 backdrop-blur-xs text-[#FFC700] font-headline font-bold text-xs px-2 py-0.5 rounded-md shadow-xs">
                      Rp 25.000
                    </div>

                    {currentQty > 0 && (
                      <div className="absolute top-2 right-2 bg-[#8B4F2F] text-white text-[11px] font-headline font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {currentQty} di keranjang
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow gap-2.5">
                    <div>
                      <p className="font-body text-xs text-[#4F4632] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D2C5AB]/30">
                      <span className="font-headline font-bold text-xs sm:text-sm text-[#8B4F2F]">
                        Rp 25.000
                      </span>

                      {currentQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => updateQty(product.id, 1)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFC700] hover:bg-[#8B4F2F] hover:text-white text-[#311309] rounded-xl font-headline font-bold text-xs transition-colors shadow-xs active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>+ Pesan</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-[#FFF1ED] px-1.5 py-0.5 rounded-full border border-black/5">
                          <button
                            type="button"
                            onClick={() => updateQty(product.id, -1)}
                            className="w-5 h-5 rounded-full bg-white text-[#311309] flex items-center justify-center text-xs font-bold shadow-xs active:scale-90 cursor-pointer"
                            aria-label={`Kurangi ${product.name}`}
                          >
                            -
                          </button>
                          <span className="font-headline font-bold text-xs w-4 text-center">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(product.id, 1)}
                            className="w-5 h-5 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center text-xs font-bold shadow-xs active:scale-90 cursor-pointer"
                            aria-label={`Tambah ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STORAGE TIPS BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-[#FFE9E3] rounded-3xl p-5 sm:p-6 shadow-sm flex items-start gap-4 border border-[#8B4F2F]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#8B4F2F] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-2xl">ac_unit</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Tips Penyimpanan Nikmat Cheeseholic
            </h3>
            <p className="font-body text-xs sm:text-sm text-[#4F4632] leading-relaxed">
              Tahan <strong>24 jam</strong> di suhu ruang, atau hingga <strong>5-7 hari</strong> di dalam chiller kulkas. Sajikan langsung dingin saat baru keluar dari chiller untuk sensasi lumer layaknya ice cream cheesecake!
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-8 bg-[#311309] text-white pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-headline font-extrabold text-2xl text-[#FFC700]">
                CHEESEHOLIC
              </span>
              <p className="font-body text-xs text-white/80 leading-relaxed">
                Spesialis Japanese &amp; American Cheesecake Box Bar nomor 1 di Bandar Lampung. Lembut, lumer, dan manisnya pas untuk menemani hari bahagiamu.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-sm text-[#FFC700]">
                Cabang Bandar Lampung
              </h4>
              <ul className="font-body text-xs text-white/80 space-y-1.5">
                <li>1. Kedaton (Jl. ZA. Pagar Alam)</li>
                <li>2. Pahoman (Stadion Pahoman)</li>
                <li>3. UIN Sukarame (Jl. Endro Suratmin)</li>
                <li>4. Korpri (Jl. Ryacudu)</li>
                <li>5. Navara Foodpark Citypark</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-sm text-[#FFC700]">
                Hubungi &amp; Sosial
              </h4>
              <ul className="font-body text-xs text-white/80 space-y-2">
                <li>
                  <a
                    href="https://wa.me/62895411422626"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFC700] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>CS: 0895-4114-22626</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/cheeseholic.bdl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFC700] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span>Instagram: @cheeseholic.bdl</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-sm text-[#FFC700]">
                Pesan Instan Website
              </h4>
              <p className="font-body text-xs text-white/80">
                Pesan langsung tanpa perlu buka WhatsApp dengan respon otomatis ke kasir cabang.
              </p>
              <button
                type="button"
                onClick={onGoToDirectOrder}
                className="mt-2 py-2.5 px-4 bg-[#FFC700] hover:bg-[#F5BF00] text-[#311309] font-headline font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
              >
                Buka Halaman Pesan Direct
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/60">
            <p>© 2024–2026 Cheeseholic Indonesia. Fresh and Delicious Every Day.</p>
            <p>Sertifikat Halal Resmi MUI &amp; BPJPH RI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
