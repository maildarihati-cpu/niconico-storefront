"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function FloatingButtons() {
  const pathname = usePathname()
  
  // 1. Deteksi Posisi Halaman
  const isHomePage = pathname === '/' || pathname === '/id' || pathname === '/en'
  const isStorePage = pathname.includes('/store')
  const isProductPage = pathname.includes('/products/')
  
  // Tombol Shop Now SELALU SEMBUNYI kalau kustomer lagi di halaman Store atau Product Detail
  const hideShopNowBase = isStorePage || isProductPage

  // 2. State untuk mendeteksi apakah layar sudah melewati 50% section pertama (Hero)
  const [isPastHero, setIsPastHero] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 🌟 LOGIC SAKTI 50%:
      // window.innerHeight adalah tinggi layar kustomer. 
      // Kalau scrollY sudah melebihi 50% tinggi layarnya, tombol dimunculkan.
      if (window.scrollY > window.innerHeight * 0.5) {
        setIsPastHero(true)
      } else {
        setIsPastHero(false)
      }
    }

    // Hanya butuh sensor scroll ini kalau posisinya di Homepage
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll)
      handleScroll() // Cek posisi saat web baru dimuat
      return () => window.removeEventListener("scroll", handleScroll)
    } else {
      // Kalau di halaman lain (Misal: About Us / Contact), tombol Shop Now langsung dimunculkan saja
      setIsPastHero(true)
    }
  }, [isHomePage])

  // 3. Keputusan Final: Boleh muncul?
  const shouldShowShopNow = !hideShopNowBase && isPastHero

  return (
    // z-40 memastikan dia aman berlindung di belakang drawer/laci yang z-index nya 50+
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-center">
      
      {/* ======================================================= */}
      {/* 🌟 TOMBOL SHOP NOW (Punya Animasi Sembunyi/Muncul) */}
      {/* ======================================================= */}
      <div 
        className={`transition-all duration-500 ease-in-out origin-bottom ${
          shouldShowShopNow 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-50 translate-y-10 pointer-events-none absolute bottom-0" 
        }`}
      >
        <LocalizedClientLink 
          href="/store"
          className="flex items-center justify-center w-14 h-14 bg-transparent outline-none focus:outline-none ring-0 hover:scale-110 transition-transform duration-300 drop-shadow-lg"
        >
          <div className="relative w-full h-full">
            <Image 
              src="/shop-now.png" 
              alt="Shop Now" 
              fill 
              className="object-contain" 
            />
          </div>
        </LocalizedClientLink>
      </div>

      {/* ======================================================= */}
      {/* 🌟 TOMBOL WHATSAPP (Selalu Bagaikan Batu Karang) */}
      {/* ======================================================= */}
      <a
        href="https://wa.me/6282140663494" 
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all duration-300 relative group"
        aria-label="Chat with Customer Service"
      >
        <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping"></span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" height="28" 
          fill="currentColor" 
          viewBox="0 0 16 16"
          className="relative z-10"
        >
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>

    </div>
  )
}