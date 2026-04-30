import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Heart } from "lucide-react"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // --- LOGIC BAWAAN KAMU (Dipertahankan karena bagus) ---
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products
      .filter((responseProduct) => responseProduct.id !== product.id)
      .slice(0, 6) // Dibatasi 6 produk aja biar gak terlalu panjang di swipe
  })

  if (!products.length) {
    return null
  }

  // --- HELPER HARGA ---
  const getProductPrice = (p: any) => {
    // Ambil calculated price dari v2
    const price = p.variants?.[0]?.calculated_price?.calculated_amount || p.variants?.[0]?.prices?.[0]?.amount || 0
    const finalPrice = countryCode === "id" ? price : price / 100
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency", 
      currency: "IDR", 
      minimumFractionDigits: 0,
    }).format(finalPrice)
  }

  return (
    <div className="container mx-auto px-5 max-w-[480px]">
      <h2 className="text-[17px] font-bold text-gray-900 mb-4">Similar Products</h2>
      
      {/* HORIZONTAL SCROLL UNTUK PRODUK */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
        {products.map((item) => (
          <LocalizedClientLink 
            key={item.id} 
            href={`/products/${item.handle}`} 
            className="flex flex-col min-w-[140px] w-[140px] snap-start group"
          >
            {/* GAMBAR & ICON WISHLIST */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
              <Image 
                src={item.thumbnail || "/placeholder.png"} 
                alt={item.title || "Product"} 
                fill 
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500" 
              />
              {/* Tombol Wishlist di pojok kanan bawah gambar */}
              {/* Note: Karena ini Server Component, fungsi klik (onClick) sementara diganti hover state aja sampai fitur wishlist jalan */}
              <button className="absolute bottom-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-300 hover:text-[#EF7044] transition-colors z-10">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* JUDUL PILL ORANGE */}
            <div className="border border-[#EF7044] rounded-full py-1.5 px-2 text-center mb-1.5 transition-colors group-hover:bg-[#EF7044]">
              <h3 className="text-[10px] font-bold text-[#EF7044] group-hover:text-white truncate">
                {item.title}
              </h3>
            </div>

            {/* HARGA */}
            <p className="text-[11px] text-[#EF7044] font-black text-center">
              {getProductPrice(item)}
            </p>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}