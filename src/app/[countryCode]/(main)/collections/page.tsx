"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/modules/products/components/product-card"
import Link from "next/link"

// Mapping Konten Statis
const STATIC_CONTENT: Record<string, any> = {
  "new-arrivals": {
    title: "NEW ARRIVALS",
    subtitle: "NICONICO RESORT New Arrivals\nPrepare You For Your Summer 2026",
    image: "/banners/hero-collection-new-arrivals.png"
  },
  "carvico": {
    title: "CARVICO",
    subtitle: "NICONICO RESORT The Top Picks\nOur Loyal Customer",
    image: "/banners/carvico.jpg"
  },
  "signature": {
    title: "SIGNATURE",
    subtitle: "NICONICO RESORT Signature\nPrepare You For Your Summer 2026",
    image: "/banners/signature.jpg"
  },
  "island-escape": {
    title: "ISLAND ESCAPE",
    subtitle: "Make You More Feel The Magical Island",
    image: "/banners/island-escape.jpg"
  }
}

// Urutan yang diinginkan
const ORDER = ["new-arrivals", "carvico", "signature", "island-escape"]

export default function CollectionsPage() {
  const { countryCode } = useParams()
  const [collectionsData, setCollectionsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const { collections } = await listCollections({ limit: "10", offset: "0" })
        
        // Ambil produk dan gabungkan
        const enriched = await Promise.all(
          collections.map(async (col: any) => {
            const { response } = await listProducts({
              queryParams: { 
                collection_id: [String(col.id)], 
                limit: 3,
                fields: "*variants.calculated_price"
              },
              countryCode: countryCode as string,
            })
            return { ...col, products: response.products }
          })
        )

        // SORTING: Urutkan data berdasarkan array ORDER di atas
        const sorted = enriched.sort((a, b) => {
          return ORDER.indexOf(a.handle) - ORDER.indexOf(b.handle)
        })

        setCollectionsData(sorted)
      } catch (err) {
        console.error("Gagal tarik data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [countryCode])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-[90px] pb-20">
      <div className="flex flex-col">
        {collectionsData.map((col) => {
          // Hanya tampilkan jika handle ada di daftar ORDER kita
          if (!ORDER.includes(col.handle)) return null

          const content = STATIC_CONTENT[col.handle] || {
            title: col.title.toUpperCase(),
            subtitle: "Explore Collection",
            image: "/banners/default.jpg"
          }

          return (
            <section key={col.id} className="w-full mb-10">
              <div className="relative w-full h-[280px] bg-[#1a1a1a] flex flex-col rounded-[10px] justify-center px-6">
                <div className="absolute inset-0 z-0">
                  <div className="absolute rounded-[10px] inset-0 bg-black/30 z-10" />
                  <img 
                    src={content.image} 
                    alt={col.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.opacity = '0')}
                  />
                </div>

                <div className="relative z-20 flex flex-col items-start max-w-xs">
                  <h2 className="text-4xl font-[1000] italic leading-none tracking-tighter text-white uppercase drop-shadow-md">
                    {content.title}
                  </h2>
                  <p className="mt-2 text-[9px] font-bold text-gray-100 uppercase tracking-widest whitespace-pre-line leading-tight">
                    {content.subtitle}
                  </p>
                  <Link 
                    href={`/${countryCode}/collections/${col.handle}`}
                    className="mt-5 px-8 py-2 border-[1.5px] border-white rounded-full text-[10px] font-black text-white uppercase transition-all hover:bg-[#EF7044] hover:border-[#EF7044]"
                  >
                    Find More
                  </Link>
                </div>
              </div>

              <div className="px-4 mt-6">
                <div className="grid grid-cols-3 gap-2">
                  {col.products?.length > 0 ? (
                    col.products.map((product: any) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        countryCode={countryCode as string} 
                      />
                    ))
                  ) : (
                    <div className="col-span-3 py-10 text-center text-gray-300 text-[10px] italic border border-dashed rounded-lg">
                      Products are being prepared...
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}