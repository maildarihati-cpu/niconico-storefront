"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, Heart } from "lucide-react"
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

  if (!images?.length) return null

  return (
    // PERHATIKAN BARIS INI SAY: rounded-b-[40px] diganti jadi rounded-[5pt]
    <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden rounded-[10pt]">
      
      {/* FLOATING BUTTONS (BACK & WISHLIST) */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-800 hover:bg-white transition-colors">
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>
        <button className="w-10 h-10 bg-[#EF7044] rounded-full flex items-center justify-center shadow-md text-white hover:bg-[#d65f36] transition-colors">
          <Heart className="w-5 h-5 fill-current" />
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
            <Image 
              src={image.url} 
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover object-top"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* DOTS INDICATOR */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-[#EF7044] w-4" : "bg-white/60 w-2"}`}
          />
        ))}
      </div>
      
    </div>
  )
}

export default ImageGallery