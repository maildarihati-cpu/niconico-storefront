"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react" 
import { useRouter } from "next/navigation"

const ImageGallery = ({ images }: { images: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleScroll = () => {
    if (!scrollRef.current) return
    const scrollPosition = scrollRef.current.scrollLeft
    const width = scrollRef.current.clientWidth
    const index = Math.round(scrollPosition / width)
    setActiveIndex(index)
  }

  const scrollToImage = (index: number) => {
    setActiveIndex(index)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      })
    }
  }

  if (!images?.length) return null

  return (
    <div className="flex flex-col gap-3 lg:gap-4 w-full lg:h-[calc(100vh-180px)] lg:max-h-[780px]">
      
      {/* ======================================================= */}
      {/* WADAH GAMBAR UTAMA */}
      {/* ======================================================= */}
      <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:flex-1 lg:min-h-0 bg-gray-100 overflow-hidden rounded-[10pt] lg:rounded-[20px] shadow-sm">
        
        {/* PANAH NAVIGASI DESKTOP (Kiri & Kanan) */}
        <div className="hidden lg:flex absolute inset-y-0 left-4 items-center z-10">
          <button 
            onClick={() => scrollToImage((activeIndex - 1 + images.length) % images.length)} 
            className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
        </div>
        <div className="hidden lg:flex absolute inset-y-0 right-4 items-center z-10">
          <button 
            onClick={() => scrollToImage((activeIndex + 1) % images.length)} 
            className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md text-gray-800 hover:bg-white hover:scale-105 transition-all"
          >
            <ChevronRight className="w-5 h-5 -mr-0.5" />
          </button>
        </div>

        {/* FLOATING BUTTON BACK (HANYA MOBILE) */}
        <div className="absolute top-5 left-5 right-5 flex lg:hidden justify-between items-center z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-white transition-colors">
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>
        </div>

        {/* HORIZONTAL SCROLL CAROUSEL */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
              {/* 🌟 PERBAIKAN SAKTI: object-contain memastikan baju tidak kepotong */}
              <Image 
                src={image.url} 
                alt={`Product image ${index + 1}`}
                fill
                className="object-contain object-center"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* DOTS INDICATOR (HANYA MUNCUL DI MOBILE) */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 lg:hidden">
          {images.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-[#EF7044] w-4" : "bg-white/60 w-2"}`}
            />
          ))}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 🌟 THUMBNAILS ROW (DESKTOP ONLY) */}
      {/* ======================================================= */}
      <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-3 h-[90px] xl:h-[110px] shrink-0">
        {images.map((image, index) => (
          <button 
            key={index}
            onClick={() => scrollToImage(index)}
            className={`relative w-full h-full rounded-[10px] overflow-hidden border-2 transition-all ${
              index === activeIndex ? "border-[#EF7044] shadow-md scale-[0.98]" : "border-transparent hover:border-gray-300"
            }`}
          >
            {/* 🌟 Note: Thumbnail sengaja dibiarkan object-cover object-top agar kotaknya rapi penuh */}
            <Image 
              src={image.url} 
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover object-top"
              sizes="150px"
            />
          </button>
        ))}
      </div>

    </div>
  )
}

export default ImageGallery