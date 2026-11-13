/**
 * Bandar Lampung Domicile / Sub-district Location Mapping for Cheeseholic Outlets
 * Helps users select their domicile area to automatically find and recommend the nearest outlet branch.
 */

export interface DomisiliArea {
  id: string;
  name: string;
  subdistricts: string[];
  nearestOutletId: string;
  nearestOutletName: string;
  estimatedDistanceKm: string;
  recommendationReason: string;
}

export const DOMISILI_AREAS: DomisiliArea[] = [
  {
    id: 'area-kedaton',
    name: 'Kedaton, Rajabasa & Way Halim',
    subdistricts: ['Kedaton', 'Rajabasa', 'Labuhan Ratu', 'Way Halim', 'Tanjung Senang', 'Sukamenanti', 'Sepang Jaya'],
    nearestOutletId: 'kedaton',
    nearestOutletName: 'Outlet Kedaton',
    estimatedDistanceKm: '1.2 - 2.5 km',
    recommendationReason: 'Outlet terdekat di Jl. ZA. Pagar Alam (seberang Eiger / Bebek H. Slamet). Pengiriman super cepat & hemat ongkir!',
  },
  {
    id: 'area-pahoman',
    name: 'Pahoman, Teluk Betung & Enggal',
    subdistricts: ['Pahoman', 'Teluk Betung Utara', 'Teluk Betung Selatan', 'Teluk Betung Barat', 'Teluk Betung Timur', 'Enggal', 'Tanjung Karang Pusat', 'Pengajaran'],
    nearestOutletId: 'pahoman',
    nearestOutletName: 'Outlet Pahoman',
    estimatedDistanceKm: '0.8 - 2.0 km',
    recommendationReason: 'Outlet terdekat di Jl. Way Lubuk (depan Kolam Renang / Stadion Pahoman).',
  },
  {
    id: 'area-sukarame',
    name: 'Sukarame & Kampus UIN',
    subdistricts: ['Sukarame', 'Kampus UIN Raden Intan', 'Way Dadi', 'Harapan Jaya', 'Sukarame Baru', 'Sukabumi'],
    nearestOutletId: 'uin',
    nearestOutletName: 'Outlet UIN Sukarame',
    estimatedDistanceKm: '0.5 - 1.8 km',
    recommendationReason: 'Outlet terdekat di Jl. Endro Suratmin (seberang Geprek Masboy Vol. 6). Sangat dekat dari Kampus UIN!',
  },
  {
    id: 'area-[#311309]korpri',
    name: 'Ryacudu, KORPRI & Kampus Itera',
    subdistricts: ['Ryacudu', 'KORPRI Komplek', 'Kampus Itera', 'Jatimulyo', 'Sabah Balau', 'Way Huwi', 'Sukarame Itera'],
    nearestOutletId: 'korpri',
    nearestOutletName: 'Outlet Korpri',
    estimatedDistanceKm: '0.6 - 2.2 km',
    recommendationReason: 'Outlet terdekat di Jl. Ryacudu (samping Tiara Parfum Korpri). Jalur utama menuju Itera!',
  },
  {
    id: 'area-[#311309]navara',
    name: 'Antasari, Kedamaian & Tanjung Karang Timur',
    subdistricts: ['Antasari', 'Kedamaian', 'Tanjung Karang Timur', 'Villa Citra', 'Bumi Kedaton', 'Campang Raya'],
    nearestOutletId: 'navara',
    nearestOutletName: 'Outlet Navara',
    estimatedDistanceKm: '1.0 - 2.4 km',
    recommendationReason: 'Outlet terdekat di Navara Foodpark / Navara Citypark.',
  },
];

export function findNearestOutletForArea(areaId: string): DomisiliArea | undefined {
  return DOMISILI_AREAS.find((a) => a.id === areaId);
}
