import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductPrice } from "@lib/util/get-product-price" // Utility bawaan Medusa v2

export default async function ProductPreview({
  product,
  isNamedCol,
  region,
}: {
  product: HttpTypes.StoreProduct
  isNamedCol?: boolean
  region: HttpTypes.StoreRegion
}) {
  // Logic Medusa v2 untuk narik harga termurah dari varian produk
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div className="flex flex-col gap-y-2">
        {/* Gambar Thumbnail dengan rounded 5pt */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[5pt] bg-gray-100 transition-all duration-300">
          <Thumbnail thumbnail={product.thumbnail} size="full" />
        </div>
        
        {/* Judul dan Pemanggilan Komponen Price */}
        <div className="flex flex-col mt-1">
          <span className="text-[14px] font-bold text-gray-900 uppercase truncate group-hover:text-[#EF7044] transition-colors">
            {product.title}
          </span>
          <PreviewPrice price={cheapestPrice} />
        </div>
      </div>
    </LocalizedClientLink>
  )
}