import React from "react"

export default async function PreviewPrice({ price }: { price: any }) {
  // Kalau belum ada harga yang di-set di admin
  if (!price) {
    return <span className="text-[13px] text-[#EF7044] font-medium">Price on options</span>
  }

  return (
    <div className="flex items-center gap-x-2 mt-1">
      {/* Harga Utama (Calculated Price) */}
      <span
        className={`text-[13px] font-medium ${
          price.price_type === "sale" ? "text-[#EF7044]" : "text-[#EF7044]"
        }`}
      >
        {price.calculated_price}
      </span>
      
      {/* Harga Asli yang dicoret (Muncul kalau lagi diskon / sale) */}
      {price.price_type === "sale" && (
        <span className="text-[12px] text-gray-400 line-through">
          {price.original_price}
        </span>
      )}
    </div>
  )
}