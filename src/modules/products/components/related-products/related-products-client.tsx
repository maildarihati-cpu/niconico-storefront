"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Heart } from "lucide-react"

type Props = {
  products: any[]
  countryCode: string
}

export default function RelatedProductsClient({ products, countryCode }: Props) {
  // Desktop memori: Mulai dari 5 produk
  const [visibleDesktop, setVisibleDesktop] = useState(5)
  
  const getProductPrice = (p: any) => {
    const price = p.variants?.[0]?.calculated_price?.calculated_amount || p.variants?.[0]?.prices?.[0]?.amount || 0
    const finalPrice = countryCode === "id" ? price : price / 100
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency", 
      currency: "IDR", 
      minimumFractionDigits: 0,
    }).format(finalPrice)
  }

  // Fungsi saat tombol View More diklik (tambah 5 produk lagi)
  const loadMore = () => setVisibleDesktop(prev => prev + 5)

  // Potong array sesuai batasan layar
  const mobileProducts = products.slice(0, 6) // Mobile tetap mentok 6 biar gak kepanjangan
  const desktopProducts = products.slice(0, visibleDesktop)
  const hasMore = visibleDesktop < products.length

  return (
    <div className="container mx-auto px-5 lg:px-0 max-w-[480px] lg:max-w-full">
      
      {/* Judul Mobile (Desktop disembunyikan karena sudah ada dari file Template) */}
      <h2 className="text-[17px] font-bold text-gray-900 mb-4 lg:hidden">Similar Products</h2>
      
      {/* ==================================================== */}
      {/* 📱 MOBILE VIEW (Horizontal Scroll - Tetap Sesuai Asli) */}
      {/* ==================================================== */}
      <div className="flex lg:hidden gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
        {mobileProducts.map((item) => (
          <LocalizedClientLink 
            key={item.id} 
            href={`/products/${item.handle}`} 
            className="flex flex-col min-w-[140px] w-[140px] snap-start group"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
              <Image src={item.thumbnail || "/placeholder.png"} alt={item.title || "Product"} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              <button className="absolute bottom-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-[#EF7044] transition-colors z-10">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            <div className="border border-[#EF7044] rounded-full py-1.5 px-2 text-center mb-1.5 transition-colors group-hover:bg-[#EF7044]">
              <h3 className="text-[10px] font-bold text-[#EF7044] group-hover:text-white truncate">{item.title}</h3>
            </div>
            <p className="text-[11px] text-[#EF7044] font-black text-center">{getProductPrice(item)}</p>
          </LocalizedClientLink>
        ))}
      </div>

      {/* ==================================================== */}
      {/* 💻 DESKTOP VIEW (Grid 5 Kolom & Tombol View More)  */}
      {/* ==================================================== */}
      <div className="hidden lg:flex flex-col items-center w-full">
        
        <div className="grid grid-cols-5 gap-x-5 gap-y-10 w-full mb-12">
          {desktopProducts.map((item) => (
            <LocalizedClientLink 
              key={item.id} 
              href={`/products/${item.handle}`} 
              className="flex flex-col group animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="relative aspect-[3/4] bg-gray-50 rounded-[20px] overflow-hidden mb-3 border border-gray-100 shadow-sm">
                <Image src={item.thumbnail || "/placeholder.png"} alt={item.title || "Product"} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all bg-white/80 backdrop-blur-sm text-gray-400 hover:text-[#EF7044]">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="absolute bottom-3 right-3 w-9 h-9 bg-[#EF7044] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-transform z-10">
                  +
                </button>
              </div>

              <div className="border border-[#EF7044] rounded-full text-center py-1.5 px-2 mx-1 mb-1.5 flex items-center justify-center h-8 transition-colors group-hover:bg-[#EF7044]">
                <h3 className="text-[11px] font-bold text-[#EF7044] group-hover:text-white truncate w-full px-1">{item.title}</h3>
              </div>
              <p className="text-[#EF7044] text-xs font-black text-center">{getProductPrice(item)}</p>
            </LocalizedClientLink>
          ))}
        </div>

        {/* 🌟 TOMBOL VIEW MORE */}
        {hasMore && (
          <button 
            onClick={loadMore}
            className="border-2 border-[#EF7044] text-[#EF7044] hover:bg-[#EF7044] hover:text-white px-10 py-3.5 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-sm active:scale-95"
          >
            View More
          </button>
        )}
      </div>

    </div>
  )
}