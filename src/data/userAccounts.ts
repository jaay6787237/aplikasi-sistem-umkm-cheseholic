/**
 * Cheeseholic User Accounts & Credentials Database
 * Each outlet branch has its own unique login account credentials.
 * Central Production (Pusat Produksi) also has a distinct dedicated account.
 */

export interface UserAccount {
  id: string;
  username: string;
  password: string; // Pre-configured default password
  name: string;
  role: 'outlet' | 'kitchen' | 'courier' | 'admin';
  outletId?: string; // Required for 'outlet' role
  locationDesc?: string;
  badgeColor: string;
}

export const CHEESEHOLIC_ACCOUNTS: UserAccount[] = [
  // 1. Pusat Produksi (Dapur Utama)
  {
    id: 'acc-kitchen',
    username: 'dapur.pusat',
    password: 'dapurcheese123',
    name: 'Pusat Produksi (Dapur Utama)',
    role: 'kitchen',
    locationDesc: 'Dapur Utama Baking & Pengiriman Batch',
    badgeColor: 'bg-amber-600 text-white',
  },

  // 2. Outlet 1 - Kedaton
  {
    id: 'acc-[#311309]kedaton',
    username: 'outlet.kedaton',
    password: 'kedaton123',
    name: 'Outlet Kedaton',
    role: 'outlet',
    outletId: 'kedaton',
    locationDesc: 'Seberang Eiger / Bebek H.Slamet, Jl. ZA. Pagar Alam',
    badgeColor: 'bg-emerald-600 text-white',
  },

  // 3. Outlet 2 - Pahoman
  {
    id: 'acc-[#311309]pahoman',
    username: 'outlet.pahoman',
    password: 'pahoman123',
    name: 'Outlet Pahoman',
    role: 'outlet',
    outletId: 'pahoman',
    locationDesc: 'Depan Kolam Renang / Stadion Pahoman, Jl. Way Lubuk',
    badgeColor: 'bg-[#311309] text-white',
  },

  // 4. Outlet 3 - UIN Sukarame
  {
    id: 'acc-[#311309]uin',
    username: 'outlet.uin',
    password: 'uin123',
    name: 'Outlet UIN Sukarame',
    role: 'outlet',
    outletId: 'uin',
    locationDesc: 'Seberang Geprek Masboy Vol.6, Jl. Endro Suratmin',
    badgeColor: 'bg-purple-600 text-white',
  },

  // 5. Outlet 4 - Korpri
  {
    id: 'acc-[#311309]korpri',
    username: 'outlet.korpri',
    password: 'korpri123',
    name: 'Outlet Korpri',
    role: 'outlet',
    outletId: 'korpri',
    locationDesc: 'Samping Tiara Parfum, Jl. Ryacudu, Korpri',
    badgeColor: 'bg-blue-600 text-white',
  },

  // 6. Outlet 5 - Navara
  {
    id: 'acc-[#311309]navara',
    username: 'outlet.navara',
    password: 'navara123',
    name: 'Outlet Navara',
    role: 'outlet',
    outletId: 'navara',
    locationDesc: 'Navara Foodpark / Navara Citypark',
    badgeColor: 'bg-[#311309] text-white',
  },

  // 7. Armada Kurir Logistik
  {
    id: 'acc-courier',
    username: 'kurir.logistik',
    password: 'kurir123',
    name: 'Armada Kurir Logistik',
    role: 'courier',
    locationDesc: 'Tim Pengantaran Pasokan Stok & Delivery',
    badgeColor: 'bg-[#25D366] text-white',
  },

  // 8. Executive Admin / Owner
  {
    id: 'acc-admin',
    username: 'admin.pusat',
    password: 'admin123',
    name: 'Admin Pusat & Management',
    role: 'admin',
    locationDesc: 'Akses Penuh Seluruh Cabang & Dapur',
    badgeColor: 'bg-[#311309] text-[#FFC700]',
  },
];
