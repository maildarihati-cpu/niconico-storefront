"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default function WishlistPage() {
  const router = useRouter()
  const { countryCode } = useParams()
  
  const [wishlistItems, setWishlistItems] = useState<HttpTypes.StoreProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 1. Ambil ID dari LocalStorage & Tarik Data dari Medusa
  const fetchWishlistProducts = async () => {
    setIsLoading(true)
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      
      if (savedWishlist.length === 0) {
        setWishlistItems([])
        setIsLoading(false)
        return
      }

      // Ambil detail produk dari Medusa berdasarkan list ID
      const { response } = await listProducts({
        queryParams: { id: savedWishlist, fields: "*variants.calculated_price" },
        countryCode: countryCode as string,
      })

      setWishlistItems(response.products)
    } catch (error) {
      console.error("Gagal mengambil wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlistProducts()
  }, [countryCode])

  // 2. Hapus dari Wishlist
  const removeFromWishlist = (productId: string) => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const updatedWishlist = savedWishlist.filter((id: string) => id !== productId)
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    
    // Update state biar langsung hilang dari layar
    setWishlistItems(prev => prev.filter(p => p.id !== productId))
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency: countryCode === "id" ? "IDR" : "USD",
      minimumFractionDigits: 0,
    }).format(countryCode === "id" ? amount : amount / 100)
  }

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-[1200px] mx-auto md:max-w-md font-sans">
      
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 relative flex flex-col items-center">
        <button 
          onClick={() => router.back()} 
          className="absolute left-6 top-14 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="w-32 h-10 relative mb-6">
          <Image src="/logo-niconico-black.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-2xl font-medium text-gray-900">My Wishlist</h1>
      </div>

      {/* LIST CONTENT */}
      <div className="px-5 space-y-4 flex-1 pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-3">
             <div className="w-8 h-8 border-4 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-400 text-sm">Loading your favorites...</p>
          </div>
        ) : wishlistItems.length > 0 ? (
          wishlistItems.map((product) => {
            const price = product.variants?.[0]?.calculated_price?.calculated_amount || 0
            
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-[24px] p-3 flex gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 relative group"
              >
                {/* Product Thumbnail */}
                <div 
                  className="w-[100px] h-[120px] rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                  onClick={() => router.push(`/${countryCode}/products/${product.handle}`)}
                >
                  <img src={product.thumbnail || ""} alt={product.title} className="w-full h-full object-cover" />
                </div>

                {/* Product Info */}
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[15px] text-gray-900 leading-tight mb-1">{product.title}</h3>
                    <p className="font-bold text-[15px] text-[#EF7044]">{formatPrice(price)}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button 
                      onClick={() => router.push(`/${countryCode}/products/${product.handle}`)}
                      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-[11px] font-bold hover:bg-[#EF7044] transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> SELECT OPTIONS
                    </button>
                    
                    <button 
                      onClick={() => removeFromWishlist(product.id!)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-medium mb-6">Your wishlist is empty.</p>
            <button 
              onClick={() => router.push(`/${countryCode}/store`)}
              className="bg-[#EF7044] text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-orange-100"
            >
              START SHOPPING
            </button>
          </div>
        )}
      </div>
    </div>
  )
}