import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import StoreSection from "@modules/home/components/store-location"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import ProductViewTracker from "@modules/products/components/product-view-tracker"

type ProductTemplateProps = {
  product: any // Sesuaikan dengan tipe Medusa v2 kamu
  region: any
  countryCode: string
}

// 🌟 PERBAIKAN: Diubah menjadi async function agar await retrieveCustomer() aman dieksekusi di dalam Server Component
export default async function ProductTemplate({
  product,
  region,
  countryCode,
}: ProductTemplateProps) {
  
  const customer = await retrieveCustomer()

  if (!product || !product.id) {
    return notFound()
  }

  return (
    // Tambahkan lg:pb-12 agar di desktop tidak terlalu jauh jaraknya dengan bawah
    <div className="relative w-full pt-[85px] md:pt-24 pb-24 lg:pb-12 bg-white">
      <ProductViewTracker product={product} />
      
      {/* ==================================================== */}
      {/* 🌟 PEMBUNGKUS UTAMA: Mobile (Numpuk) & Desktop (Belah 2 Kiri-Kanan) */}
      {/* ==================================================== */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-14 lg:items-start w-full max-w-[1200px] xl:max-w-[1400px] mx-auto lg:px-8">
        
        {/* 1. BAGIAN KIRI: GALLERY IMAGE */}
        <div className="w-full px-[5pt] lg:px-0">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* 2. BAGIAN KANAN: PRODUCT INFO, ACTIONS, TABS */}
        <div className="w-full px-5 pt-6 lg:pt-0 mx-auto lg:mx-0 max-w-[480px] lg:max-w-full">
          
          <ProductInfo product={product} />

          <Suspense fallback={<p className="text-[#EF7044] text-xs font-bold animate-pulse mt-4">Loading actions...</p>}>
            <ProductActions product={product} region={region} customer={customer} />
          </Suspense>

          <div className="mt-8 lg:mt-12">
            <ProductTabs product={product} />
          </div>

        </div>

      </div>
      {/* ==================================================== */}

      {/* 5. SIMILAR PRODUCTS (Keluar dari Grid agar lebarnya penuh) */}
      <div className="mt-12 lg:mt-24 w-full max-w-[1200px] xl:max-w-[1400px] mx-auto">
        <Suspense fallback={<p className="text-center text-gray-400 text-xs">Loading related products...</p>}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>

      {/* 6. VISIT OUR STORE */}
      <div className="mt-12 mb-8 w-full max-w-[1200px] xl:max-w-[1400px] mx-auto">
        <StoreSection />
      </div>

    </div>
  )
}