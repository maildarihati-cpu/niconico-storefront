"use client"

import { HttpTypes } from "@medusajs/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { sdk } from "@lib/config" 
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import ProductCard from "../../products/components/product-card"
import LookbookViewer from "../components/lookbook-viewer"
import CollectionSection from "../components/collection-section"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

/**
 * Update bagian ini agar menerima props tambahan dari page.tsx
 */
export default function CollectionTemplate({ 
  collection,
  page,
  sortBy,
  countryCode
}: { 
  collection: HttpTypes.StoreCollection 
  page?: string
  sortBy?: SortOptions
  countryCode: string
}) {
  const { ref, inView } = useInView()

  // Kita gunakan sortBy di queryKey agar saat user mengganti sort, 
  // datanya otomatis di-fetch ulang
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ["collection-products", collection.id, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await sdk.store.product.list({ 
        collection_id: [collection.id], 
        limit: 12, 
        offset: pageParam,
        // @ts-ignore - Medusa v2 SDK handling for sortBy might vary
        order: sortBy === "price_asc" ? "price" : sortBy === "price_desc" ? "-price" : undefined
      })
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: HttpTypes.StoreProductListResponse, 
      allPages: HttpTypes.StoreProductListResponse[]
    ) => {
      const nextOffset = allPages.length * 12
      return lastPage.products.length === 12 ? nextOffset : undefined
    },
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="flex flex-col w-full">
      {/* Banner Section */}
      <div className="relative h-[60vh] w-full flex flex-col items-center justify-center text-white text-center p-6 bg-gray-900">
        <h1 className="text-4xl md:text-6xl font-serif mb-2 tracking-widest uppercase">
          {collection.title}
        </h1>
        <p className="max-w-md text-sm opacity-90 italic">
          Niconico Resorts {collection.title}. Prepare You For Your Summer 2026.
        </p>
      </div>

      {/* Lookbook Section */}
      <div className="-mt-20 z-10 max-w-4xl mx-auto w-full">
         <LookbookViewer />
      </div>

      {/* Product Grid */}
      <div className="content-container py-12 px-4">
        <div className="grid grid-cols-3 gap-x-2 gap-y-8 md:grid-cols-4 lg:grid-cols-5">
          {data?.pages.map((pageData: HttpTypes.StoreProductListResponse) =>
            pageData.products.map((product: HttpTypes.StoreProduct) => (
              <ProductCard 
      key={product.id} 
      product={product} 
      countryCode={countryCode as string} // <--- Tambahkan baris ini
    />
            ))
          )}
        </div>

        {/* Scroll Observer */}
        <div ref={ref} className="h-10 flex justify-center items-center mt-10">
          {isFetchingNextPage && (
            <p className="text-orange-500 animate-pulse text-sm font-medium">
              Loading more products, Say...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ... (Named exports NewRelease, BestSeller, dkk tetap sama di bawah)