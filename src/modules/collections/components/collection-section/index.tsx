import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import ProductCard from "../../../products/components/product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CollectionSectionProps = {
  handle: string
  title: string
  description: string
  bannerImage: string // Kamu bisa pakai URL dari metadata atau static assets
}

export default async function CollectionSection({ 
  handle, 
  title, 
  description,
  bannerImage 
}: CollectionSectionProps) {
  
  // Fetch hanya 3 produk pertama untuk setiap koleksi di halaman depan
  const { products } = await sdk.store.product.list({
    handle: [handle], // atau collection_id jika lebih akurat
    limit: 3,
  })

  if (!products.length) return null

  return (
    <div className="flex flex-col w-full mb-16">
      {/* Banner Section */}
      <div 
        className="relative h-[400px] w-full flex flex-col items-start justify-end p-8 text-white mb-6 bg-cover bg-center rounded-lg overflow-hidden"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        {/* Overlay agar teks terbaca */}
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-serif tracking-widest uppercase mb-1">{title}</h2>
          <p className="text-xs max-w-xs mb-4 opacity-90">{description}</p>
          <LocalizedClientLink href={`/collections/${handle}`}>
            <button className="border border-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-full">
              Find More
            </button>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Product Grid (3 Kolom Sesuai Desain) */}
      <div className="grid grid-cols-3 gap-x-2 md:gap-x-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}