import { HttpTypes } from "@medusajs/types"

const ProductPrice = ({ variant }: { variant?: HttpTypes.StoreProductVariant | any }) => {
  if (!variant) return null

  // Ambil harga dari Medusa v2 calculated_price
  const price = variant.calculated_price?.calculated_amount || 0
  
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)

  return (
    <div className="flex flex-col text-[#EF7044]">
      <span className="text-xl md:text-2xl font-black">{formattedPrice}</span>
    </div>
  )
}

export default ProductPrice