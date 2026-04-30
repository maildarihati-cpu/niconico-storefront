import { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: { product: HttpTypes.StoreProduct }) => {
  return (
    <div className="flex flex-col mb-1">
      {/* JUDUL PRODUK ASLI DARI DATABASE */}
      <h1 className="text-xl md:text-2xl font-black text-[#EF7044] uppercase tracking-wide">
        {product.title}
      </h1>
    </div>
  )
}

export default ProductInfo