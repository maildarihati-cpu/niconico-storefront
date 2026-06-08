"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
// 🌟 PERBAIKAN 1: Ganti ikon jadi serong kanan atas
import { ArrowUpRight } from "lucide-react"; 

export default function HeroSection() {
  const [slides, setSlides] = useState<any[]>([]);
  const [globalTitle, setGlobalTitle] = useState("Simply Be Your Own\nKind Of Confidence");
  const [heroIndex, setHeroIndex] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/hero`, {
          cache: "no-store",
          next: { revalidate: 0 }
        });
        
        if (!res.ok) throw new Error("Gagal tarik data");
        
        const data = await res.json();
        
        if (data.heroes && data.heroes.length > 0) {
          setSlides(data.heroes);
        }
        if (data.setting && data.setting.global_title) {
          setGlobalTitle(data.setting.global_title);
        }
      } catch (error) {
        console.error("Error Hero:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return; 
    
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[100vh] bg-gray-900 flex flex-col items-center justify-center">
         <div className="w-8 h-8 border-2 border-white/20 border-t-[#EF7044] rounded-full animate-spin mb-4"></div>
         {/* 🌟 Font kecil diganti dari font-bold ke font-normal (regular) */}
         <p className="text-[10px] font-normal tracking-[0.2em] text-white/40 uppercase animate-pulse">
           Loading Niconico...
         </p>
      </section>
    );
  }

  const totalDots = slides.length > 0 ? slides.length : 3;

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-gray-900">
      
      {/* BACKGROUND IMAGES */}
      {slides.length > 0 ? (
        slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === heroIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image 
              src={slide.image_url} 
              alt="Niconico Hero Campaign" 
              fill 
              className="object-cover" 
              priority={index === 0} 
              unoptimized
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0">
          <Image src="/hero-1.png" alt="Niconico Hero Campaign" fill className="object-cover" priority />
        </div>
      )}

      {/* OVERLAY HITAM 30% */}
      <div className="absolute inset-0 bg-black/30 z-[5] pointer-events-none" />
      
      {/* KONTEN TEKS & TOMBOL */}
      <div className="absolute inset-0 flex flex-col justify-end pb-24 px-8 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        
        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center lg:items-start text-center lg:text-left mb-4 lg:mb-12">
          
          {/* 🌟 Font judul besar diganti ke font-heavy */}
          <h1 className="text-[32px] md:text-[42px] lg:text-[56px] font-black leading-[1.1] text-white mb-3 tracking-tight whitespace-pre-line drop-shadow-md">
            {globalTitle}
          </h1>
          
          {/* 🌟 Font kecil diganti dari font-bold ke font-normal (regular) */}
          <p className="text-[10px] lg:text-xs font-regular tracking-[0.2em] text-white/90 uppercase mb-8 drop-shadow-md">
            Resort & Swimwear Est. 2004
          </p>
          
          <Link href="/store" className="w-full max-w-[280px]">
<<<<<<< HEAD
            {/* 🌟 PERUBAHAN 2: Button diubah strukturnya. Pakai justify-between, ikon dipindah ke kanan, padding disesuaikan */}
            <button className="group w-full bg-[#EF7044] text-white py-2 px-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:bg-white hover:text-[#EF7044] grid grid-cols-[32px_1fr_32px] items-center">
  
              {/* Panah di kolom kiri (kolom ke-1) */}
              <div className="w-8 h-8 rounded-full bg-white text-[#EF7044] flex items-center justify-center group-hover:bg-[#EF7044] group-hover:text-white transition-colors shadow-sm">
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              </div>

              {/* Teks di tengah (kolom ke-2) */}
              <span className="justify-self-center -ml-8">SHOP NOW</span>
              
              {/* Kosongkan kolom ke-3 agar seimbang */}
              <div className="w-8" />
              
            </button>
=======
            {/* 🌟 PERUBAHAN UTAMA BUTTON: Menggunakan relative & justify-center supaya teks 'SHOP NOW' presisi di tengah layar mobile/desktop. Panah dipisah pakai absolute khusus desktop (lg:flex) */}
            <button className="group w-full bg-[#EF7044] text-white h-12 rounded-full font-heavy text-sm md:text-lg tracking-widest uppercase transition-all shadow-lg hover:bg-white hover:text-[#EF7044] relative flex items-center justify-center px-6">
            <span>SHOP NOW</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full bg-white text-[#EF7044] items-center justify-center group-hover:bg-[#EF7044] group-hover:text-white transition-colors shrink-0 shadow-sm absolute right-2 top-1/2 -translate-y-1/2">
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
            </div>
</button>
>>>>>>> dev
          </Link>

        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div 
              key={i} 
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === heroIndex ? "w-8 bg-[#EF7044]" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}