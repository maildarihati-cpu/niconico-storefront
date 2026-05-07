"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import ProductCard from "@/modules/products/components/product-card"
import Link from "next/link"

const COLLECTION_MAP: Record<string, any> = {
  "new-arrivals": {
    title: "NEW ARRIVALS",
    subtitle: "Niconico Resorts New Arrivals\nPrepare You For Your Summer 2026",
    heroImage: "/banners/hero-collection-new-arrivals.png",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "best-seller": {
    title: "BEST SELLER",
    subtitle: "Niconico Resorts The Top Picks\nOur Loyal Customer",
    heroImage: "/banners/best-seller.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "signature": {
    title: "SIGNATURE",
    subtitle: "Niconico Resorts Signature\nPrepare You For Your Summer 2026",
    heroImage: "/banners/signature.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "island-escape": {
    title: "ISLAND ESCAPE",
    subtitle: "Make You More Feel The Magical Island",
    heroImage: "/banners/island-escape.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  }
}

export default function CollectionDetailPage() {
  const { countryCode, handle } = useParams()
  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [otherCollections, setOtherCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const config = COLLECTION_MAP[handle as string]

  useEffect(() => {
    const fetchCollectionData = async () => {
      setIsLoading(true)
      try {
        const { collections } = await listCollections({ limit: "20", offset: "0" })
        const currentCol = collections.find((c: any) => c.handle === handle)
        
        if (currentCol) {
          setCollection(currentCol)
          const { response } = await listProducts({
            queryParams: { collection_id: [currentCol.id], limit: 12 },
            countryCode: countryCode as string,
          })
          setProducts(response.products)
        }

        // FILTER: Pastikan koleksi yang sedang dibuka tidak muncul di bawah
        const others = collections.filter((c: any) => c.handle !== handle)
        setOtherCollections(others)

      } catch (err) {
        console.error("Gagal tarik data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollectionData()
  }, [handle, countryCode])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      
      {/* SECTION 1: HERO IMAGE (Full Width, Center Text) */}
      <section className="relative w-full h-[450px]">
        <div className="absolute inset-0">
          <img 
            src={config?.heroImage || `/banners/hero-collection-${handle}.jpg`} 
            alt={handle as string} 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center pt-10 px-4 text-center">
          <h1 className="text-4xl font-[900] text-white uppercase tracking-wider drop-shadow-md">
            {config?.title || collection?.title?.toUpperCase()}
          </h1>
          <p className="mt-2 text-[11px] font-medium text-white whitespace-pre-line leading-relaxed opacity-90">
            {config?.subtitle || "Explore the exclusive collection"}
          </p>
        </div>
      </section>

      {/* SECTION 2: LOOKBOOK (Overlap ke Hero) */}
      {config?.lookbookUrl && (
        <section className="relative z-20 px-4 -mt-[80px] mb-8">
          <div className="rounded-xl overflow-hidden shadow-2xl bg-white">
            <div style={{ position: "relative", paddingTop: "max(60%, 324px)", width: "100%", height: 0 }}>
              <iframe 
                style={{ position: "absolute", border: "none", width: "100%", height: "100%", left: 0, top: 0 }} 
                src={config.lookbookUrl} 
                title="Lookbook" 
                seamless 
                scrolling="no" 
                frameBorder="0" 
                allowTransparency 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: PRODUCT GRID */}
      <section className="px-4 mb-16 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} countryCode={countryCode as string} />
          ))}
        </div>
      </section>

      {/* SECTION 4: OTHER COLLECTIONS (Sesuai Screenshot 090703) */}
      <section className="mb-10">
        <h3 className="text-center text-[#EF7044] text-[16px] mb-6 font-bold uppercase tracking-widest">
          Other Collections
        </h3>
        
        <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar">
          {otherCollections.map((col) => {
            // Ambil config manual atau gunakan fallback path
            const thumbConfig = COLLECTION_MAP[col.handle]
            const imagePath = thumbConfig?.heroImage || `/banners/hero-collection-${col.handle}.png`
            
            return (
              <Link 
                key={col.id} 
                href={`/${countryCode}/collections/${col.handle}`}
                className="flex-shrink-0 block"
              >
                <div className="relative w-[280px] h-[155px] rounded-2xl overflow-hidden shadow-md group">
                  <img 
                    src={imagePath} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={col.title}
                    onError={(e) => {
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <h4 className="text-white text-3xl font-serif italic mb-1 drop-shadow-md">
                      {col.title}
                    </h4>
                    <p className="text-white text-[8px] uppercase tracking-[0.2em] mb-4 opacity-80">
                      {thumbConfig?.subtitle?.split('\n')[0] || "Luxury Resort Wear"}
                    </p>
                    <span className="border border-white text-white text-[10px] uppercase font-bold px-6 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                      Find More
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}