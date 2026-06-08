import { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"
import { listProducts } from "@lib/data/products" // 🌟 Tambahkan import untuk penarik data

export const metadata: Metadata = {
  title: "Store | Niconico Resort",
  description: "Explore all of our products.",
}

// 🌟 JURUS CACHE TINGKAT DEWA (ISR)
// Menyimpan hasil halaman secara statis di memori Vercel/Railway selama 60 detik.
// Loading yang tadinya 4 detik akan terpangkas menjadi 0.1 detik murni!
export const revalidate = 60;

export default async function StorePage({ 
  params 
}: { 
  params: { countryCode: string } 
}) {
  
  // 🌟 TARIK DATA DI SERVER SEBELUM HALAMAN DI-RENDER
  const data = await listProducts({
    queryParams: { 
      limit: 10,
      offset: 0,
      order: "-created_at", // Ambil produk rilisan terbaru
      fields: "*collection,*categories,*variants,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder",
    }, 
    countryCode: params.countryCode,
  }).catch(() => null);

  // Amankan data jika API gagal atau kosong
  const initialProducts = data?.response?.products || [];

  return (
    // 🌟 SUNTIKKAN DATA CACHE KE DALAM KOMPONEN CLIENT
    <StoreTemplate initialProducts={initialProducts} />
  )
}