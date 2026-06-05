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
  product: any 
  region: any
  countryCode: string
}

export default async function ProductTemplate({
  product,
  region,
  countryCode,
}: ProductTemplateProps) {
  
  // Ambil data customer (Aman di Server Component)
  const customer = await retrieveCustomer()

  if (!product || !product.id) {
    return notFound()
  }

  return (
    // 🌟 Padding top desktop dilegakan (lg:pt-[130px]) agar tidak mepet navbar
    <div className="relative w-full pt-[85px] lg:pt-[130px] pb-24 lg:pb-12 bg-white">
      <ProductViewTracker product={product} />
      
      {/* ==================================================== */}
      {/* 🌟 PEMBUNGKUS UTAMA: Mobile (Numpuk) & Desktop (Belah 2 Kiri-Kanan) */}
      {/* ==================================================== */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-14 lg:items-start w-full max-w-[1200px] xl:max-w-[1400px] mx-auto lg:px-8">
        
        {/* 1. BAGIAN KIRI: GALLERY IMAGE (Sticky di Desktop) */}
        <div className="w-full px-[5pt] lg:px-0 lg:sticky lg:top-[120px]">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* 2. BAGIAN KANAN: PRODUCT INFO, ACTIONS, & TABS */}
        <div className="w-full px-5 pt-6 lg:pt-0 mx-auto lg:mx-0 max-w-[480px] lg:max-w-full">
          
          {/* Judul & Harga (Digabung dengan harga di dalam ProductActions untuk desktop) */}
          <ProductInfo product={product} />

          {/* 🌟 ProductTabs dioper ke dalam ProductActions sebagai children agar UI presisi */}
          <Suspense fallback={<p className="text-[#EF7044] text-xs font-bold animate-pulse mt-4">Loading actions...</p>}>
            <ProductActions product={product} region={region} customer={customer}>
               
               {/* Ini adalah children (Accordion) yang diselipkan tepat di atas tombol Add to Cart */}
               <div className="mt-8 mb-8 lg:mt-10 lg:mb-8">
                 <ProductTabs product={product} />
               </div>

            </ProductActions>
          </Suspense>

        </div>

      </div>
      {/* ==================================================== */}

      {/* 5. SIMILAR PRODUCTS */}
      <div className="mt-12 lg:mt-24 w-full max-w-[1200px] xl:max-w-[1400px] mx-auto">
        <h3 className="text-center text-2xl lg:text-3xl font-black text-gray-900 mb-8">Similar Products</h3>
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