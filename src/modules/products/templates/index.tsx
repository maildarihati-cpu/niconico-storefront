import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import StoreSection from "@modules/home/components/store-location"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"

type ProductTemplateProps = {
  product: any // Sesuaikan dengan tipe Medusa v2 kamu
  region: any
  countryCode: string
}

const customer = await retrieveCustomer()
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    // Tambahkan pb-24 agar konten tidak tertutup tombol Sticky "BUY NOW" di bawah
    <div className="relative w-full pt-[85px] md:pt-24 pb-24 bg-white">
      
      {/* 1. GALLERY IMAGE (Swipeable) */}
      <div className="w-full px-[5pt]">
        <ImageGallery images={product?.images || []} />
      </div>

      <div className="container mx-auto px-5 pt-6 max-w-[480px]">
        {/* 2. PRODUCT INFO (Title & Price) */}
        <ProductInfo product={product} />

        {/* 3. PRODUCT ACTIONS (Color, Size, Varian Set/Top/Bottom, Add to Cart) */}
        <Suspense fallback={<p>Loading...</p>}>
          <ProductActions product={product} region={region} customer={customer} />
        </Suspense>

        {/* 4. ACCORDION DESCRIPTION & SHIPPING */}
        <div className="mt-8">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* 5. SIMILAR PRODUCTS */}
      <div className="mt-12">
        <Suspense fallback={<p>Loading...</p>}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>

      {/* 6. VISIT OUR STORE (Sesuai Request) */}
      <div className="mt-12 mb-8">
        
        <StoreSection />
      </div>

    </div>
  )
}

export default ProductTemplate