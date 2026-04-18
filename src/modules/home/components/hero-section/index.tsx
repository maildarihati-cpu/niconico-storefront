"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [slides, setSlides] = useState<any[]>([]);
  const [globalTitle, setGlobalTitle] = useState("Simply Be Your Own\nKind Of Confidence");
  const [heroIndex, setHeroIndex] = useState(0);
  
  // 1. TAMBAH STATE LOADING DI SINI BOS
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
        // 2. MATIKAN LOADING SETELAH SELESAI (Berhasil ataupun Gagal)
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

  // 3. TAMPILAN LOADING ELEGAN (Mencegah gambar lama bocor)
  if (isLoading) {
    return (
      <section className="relative w-full h-[100vh] bg-gray-900 flex flex-col items-center justify-center">
         {/* Spinner simpel ala Niconico */}
         <div className="w-8 h-8 border-2 border-white/20 border-t-[#ED5725] rounded-full animate-spin mb-4"></div>
         <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase animate-pulse">
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
        // Gambar default ini HANYA akan muncul jika Backend benar-benar kosong melompong
        <div className="absolute inset-0">
          <Image src="/hero-1.png" alt="Niconico Hero Campaign" fill className="object-cover" priority />
        </div>
      )}

      {/* OVERLAY HITAM 30% */}
      <div className="absolute inset-0 bg-black/30 z-[5] pointer-events-none" />
      
      {/* KONTEN TEKS & TOMBOL */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 text-center z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        
        <h1 className="text-[32px] font-bold leading-[1.1] text-white mb-3 tracking-tight whitespace-pre-line drop-shadow-md">
          {globalTitle}
        </h1>
        
        <p className="text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase mb-8 drop-shadow-md">
          Resort & Swimwear Est. 2004
        </p>
        
        <Link href="/collections" className="w-full max-w-[280px] mb-8">
          <button className="w-full bg-[#ED5725] text-white py-4 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:bg-white hover:text-[#ED5725]">
            SHOP NOW
          </button>
        </Link>

        {/* HERO DOTS */}
        <div className="flex gap-2">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div 
              key={i} 
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === heroIndex ? "w-8 bg-[#ED5725]" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}