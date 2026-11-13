import React, { useState } from 'react';
import { Outlet } from '../utils/orderCalculator';

interface OutletsScreenProps {
  outlets: Outlet[];
  onSelectOutletForOrder: (outletId: string) => void;
}

export const OutletsScreen: React.FC<OutletsScreenProps> = ({
  outlets,
  onSelectOutletForOrder,
}) => {
  const [selectedView, setSelectedView] = useState<'cards' | 'poster'>('cards');
  const [filterQuery, setFilterQuery] = useState('');

  const filteredOutlets = outlets.filter((o) => {
    const q = filterQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full pb-24 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="py-6 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D2C5AB]/40">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#8B4F2F] font-headline text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base">store</span>
            <span>CABANG RESMI BANDAR LAMPUNG</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#311309] tracking-tight">
            5 Lokasi Gerai &amp; Outlet Cheeseholic
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#4F4632] mt-1">
            Kunjungi gerai terdekat kami untuk take away langsung, pesan drive-thru, atau kirim instant via kurir/ojol.
          </p>
        </div>

        {/* View Switcher: Interactive Cards vs Poster */}
        <div className="flex items-center gap-2 bg-[#FFE9E3] p-1 rounded-xl self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedView('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer ${
              selectedView === 'cards'
                ? 'bg-[#FFC700] text-[#311309] shadow-xs'
                : 'text-[#4F4632] hover:text-[#311309]'
            }`}
          >
            Tampilan Interaktif
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('poster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer ${
              selectedView === 'poster'
                ? 'bg-[#FFC700] text-[#311309] shadow-xs'
                : 'text-[#4F4632] hover:text-[#311309]'
            }`}
          >
            Tampilan Poster Asli
          </button>
        </div>
      </div>

      {/* POSTER VIEW */}
      {selectedView === 'poster' ? (
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-[#FFC700] rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-[#311309] text-[#311309]">
            <div className="text-center pb-6">
              <h2 className="font-headline font-black text-3xl tracking-tight uppercase">
                CHEESEHOLIC
              </h2>
              <span className="font-headline font-extrabold text-xs tracking-widest uppercase text-[#8B4F2F]">
                FRESH AND DELICIOUS
              </span>
            </div>

            <div className="space-y-6">
              {outlets.map((outlet) => (
                <div key={outlet.id} className="flex flex-col gap-1">
                  <div className="font-headline font-black text-sm sm:text-base uppercase tracking-wide text-[#311309]">
                    {outlet.number}. {outlet.name.toUpperCase()} &quot;{outlet.hours.replace(' WIB', '')}&quot;
                  </div>
                  <div className="flex items-start gap-2 pl-1">
                    <span className="material-symbols-outlined text-[#8B4F2F] text-lg shrink-0 mt-0.5">
                      location_on
                    </span>
                    <div className="font-headline text-xs font-bold uppercase leading-tight text-[#311309]/90">
                      <div>{outlet.location}</div>
                      <div className="text-[11px] opacity-80">{outlet.address}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t-2 border-[#311309]/20 text-center">
              <button
                type="button"
                onClick={() => onSelectOutletForOrder(outlets[0].id)}
                className="w-full py-3 bg-[#311309] text-[#FFC700] font-headline font-bold text-sm rounded-2xl shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                Pesan via WhatsApp Sekarang
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE CARDS VIEW */
        <div className="py-6 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#81765F] text-lg">
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Cari cabang (Kedaton, Sukarame, Pahoman...)"
              className="w-full bg-white text-[#311309] placeholder:text-[#81765F] text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#D2C5AB]/40 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#D2C5AB]/30 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#8B4F2F] text-white font-headline font-bold text-sm flex items-center justify-center shrink-0">
                        {outlet.number}
                      </div>
                      <h3 className="font-headline font-bold text-base text-[#311309] uppercase">
                        {outlet.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          outlet.stockStatus === 'ready'
                            ? 'bg-[#E7FFDB] text-[#25D366] border-[#25D366]/40'
                            : 'bg-[#FFEDE8] text-[#964900] border-[#8B4F2F]/30'
                        }`}
                      >
                        {outlet.stockBadge}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FFC700] text-[#311309] text-[11px] font-bold">
                        {outlet.hours}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#4F4632] pl-1">
                    <p className="font-headline font-bold text-[#311309] flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[#8B4F2F] text-sm shrink-0 mt-0.5">
                        storefront
                      </span>
                      <span>{outlet.location}</span>
                    </p>
                    <p className="font-body text-[#4F4632] pl-5 leading-relaxed">
                      {outlet.address}
                    </p>
                    <p className="font-body text-xs text-[#25D366] font-bold pl-5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">chat</span>
                      <span>CS: {outlet.phoneDisplay} ({outlet.role})</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#D2C5AB]/30 grid grid-cols-2 gap-2">
                  <a
                    href={outlet.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-[#FFF1ED] hover:bg-[#FFE9E3] text-[#8B4F2F] font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#8B4F2F]/20"
                  >
                    <span className="material-symbols-outlined text-sm">navigation</span>
                    <span>Buka di Maps</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectOutletForOrder(outlet.id)}
                    className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">send_to_mobile</span>
                    <span>Pesan di Sini</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* City Coverage Map Simulation */}
          <div className="rounded-3xl p-6 bg-gradient-to-r from-[#311309] to-[#5B2B0C] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-lg">
              <span className="inline-flex items-center gap-1 text-[#FFC700] text-xs font-headline font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">explore</span>
                <span>Jangkauan Pengiriman</span>
              </span>
              <h3 className="font-headline font-bold text-xl sm:text-2xl text-white">
                Melayani Seluruh Penjuru Bandar Lampung
              </h3>
              <p className="font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                Dari Kedaton, Labuhan Ratu, Rajabasa, Way Halim, Sukarame, Pahoman, Teluk Betung, hingga Kemiling. Pesan langsung dari rumah, kue dikirim aman dengan kurir online terpercaya!
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectOutletForOrder(outlets[0].id)}
              className="py-3 px-6 rounded-full bg-[#FFC700] hover:bg-[#F5BF00] text-[#311309] font-headline font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            >
              Order Delivery Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
