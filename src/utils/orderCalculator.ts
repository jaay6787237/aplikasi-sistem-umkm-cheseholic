export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'best' | 'choco' | 'cheese' | 'coffee';
  tag: string;
  badgeBg?: string;
  headerColor: string;
  image: string;
  subtitle: string;
  description: string;
  stockStatus: 'ready' | 'limited';
  stockLabel?: string;
}

export interface Outlet {
  id: string;
  number: number;
  name: string;
  hours: string;
  location: string;
  address: string;
  phoneDisplay: string;
  phoneRaw: string;
  role: string;
  mapsUrl: string;
  stockStatus: 'ready' | 'low';
  stockBadge: string;
}

export interface WhatsAppMessageParams {
  mode: 'delivery' | 'takeaway';
  outlet: Outlet;
  cart: Record<string, number>;
  products: Product[];
  customer: {
    name: string;
    phone: string;
    address?: string;
    pinpoint?: string;
    time?: string;
    notes?: string;
    paymentMethod?: string;
  };
}

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export interface OrderTotalResult {
  totalQty: number;
  totalPrice: number;
  items: Array<{
    product: Product;
    qty: number;
    subtotal: number;
  }>;
}

export function calculateOrderTotals(
  cart: Record<string, number>,
  products: Product[]
): OrderTotalResult {
  let totalQty = 0;
  let totalPrice = 0;
  const items: OrderTotalResult['items'] = [];

  for (const product of products) {
    const qty = cart[product.id] || 0;
    if (qty > 0) {
      const subtotal = qty * product.price;
      totalQty += qty;
      totalPrice += subtotal;
      items.push({
        product,
        qty,
        subtotal,
      });
    }
  }

  return {
    totalQty,
    totalPrice,
    items,
  };
}

export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { mode, outlet, cart, products, customer } = params;
  const totals = calculateOrderTotals(cart, products);

  const orderLinesFormatted =
    totals.items.length > 0
      ? totals.items
          .map(
            (item) =>
              `- ${item.qty}x ${item.product.name} (${formatRupiah(item.subtotal)})`
          )
          .join('\n')
      : '- Belum ada varian dipilih';

  const formattedTotal = formatRupiah(totals.totalPrice);
  const paymentMethod = customer.paymentMethod || 'QRIS / Transfer BCA (LUNAS - Bukti Terlampir)';

  if (mode === 'delivery') {
    const name = customer.name.trim() || 'Budi Santoso';
    const phone = customer.phone.trim() || '0812-3456-7890';
    const address =
      customer.address?.trim() ||
      'Jl. Teuku Umar No. 45, Kedaton, Bandar Lampung';
    const pinpoint =
      customer.pinpoint?.trim() ||
      'Depan Apotek Kimia Farma (Shareloc via chat)';
    const notes =
      customer.notes?.trim() ||
      'Pastikan box tidak miring selama di perjalanan kurir';

    return `🛵 METODE: Delivery Kurir / Ojol (Antar ke Alamat)
📍 OUTLET PENGIRIMAN: ${outlet.name} (${outlet.address.split(',')[0]})
👤 PENERIMA: ${name} (${phone})
🏠 ALAMAT LENGKAP: ${address}
📍 PATOKAN / SHARELOC: ${pinpoint}
🍰 VARIAN PESANAN:
${orderLinesFormatted}
💰 TOTAL: ${formattedTotal} (${totals.totalQty} Box)
💳 PEMBAYARAN: ${paymentMethod}
🛵 ONGKIR: Ditanggung pembeli via GoSend/GrabExpress
📝 CATATAN: ${notes}`;
  } else {
    const name = customer.name.trim() || 'Budi Santoso';
    const phone = customer.phone.trim() || '0812-3456-7890';
    const time = customer.time?.trim() || 'Hari ini, Pukul 14.30 WIB';
    const notes =
      customer.notes?.trim() || 'Tolong siapkan sebelum jam 14.30 ya min';

    return `🛍️ METODE: Takeaway (Ambil Sendiri di Outlet)
📍 OUTLET PENGAMBILAN: ${outlet.name} (${outlet.address.split(',')[0]})
⏰ ESTIMASI AMBIL: ${time}
👤 NAMA PENGAMBIL: ${name} (${phone})
🍰 VARIAN PESANAN:
${orderLinesFormatted}
💰 TOTAL: ${formattedTotal} (${totals.totalQty} Box)
💳 PEMBAYARAN: ${paymentMethod}
📝 CATATAN: ${notes}`;
  }
}
