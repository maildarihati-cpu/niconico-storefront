"use client"

import React, { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default function ProductCard({ product, countryCode }: ProductCardProps) {
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Cek status wishlist saat komponen di-load
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsWishlisted(savedWishlist.includes(product.id))
  }, [product.id])

  // Fungsi Toggle Wishlist
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation() // Supaya tidak memicu klik ke halaman produk
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    
    if (isWishlisted) {
      const updated = savedWishlist.filter((id: string) => id !== product.id)
      localStorage.setItem("wishlist", JSON.stringify(updated))
      setIsWishlisted(false)
    } else {
      savedWishlist.push(product.id)
      localStorage.setItem("wishlist", JSON.stringify(savedWishlist))
      setIsWishlisted(true)
    }
  }

  // Format Harga
  const price = product.variants?.[0]?.calculated_price?.calculated_amount || 0
  const formattedPrice = new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: countryCode === "id" ? "IDR" : "USD",
    minimumFractionDigits: 0,
  }).format(countryCode === "id" ? price : price / 100)

  return (
    <div 
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={() => router.push(`/${countryCode}/products/${product.handle}`)}
    >
      {/* Thumbnail & Wishlist Button */}
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100">
        <img 
          src={product.thumbnail || ""} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={toggleWishlist}
          className="absolute bottom-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-[#EF7044] text-[#EF7044]" : "text-[#EF7044]"}`} 
          />
        </button>
      </div>

      {/* Title (Pill Border) & Price */}
      <div className="flex flex-col items-center text-center px-1">
        <div className="w-full border border-[#EF7044] rounded-full py-1 px-2 mb-1">
          <h3 className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
            {product.title}
          </h3>
        </div>
        <p className="text-[11px] sm:text-xs font-bold text-[#EF7044]">
          {formattedPrice}
        </p>
      </div>
    </div>
  )
}