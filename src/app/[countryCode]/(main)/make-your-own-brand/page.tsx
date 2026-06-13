"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function MakeYourOwnBrandPage() {
  // ==========================================
  // 🌟 STATE UNTUK DATA DARI BACKEND
  // ==========================================
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 FUNGSI PENDETEKSI VIDEO
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  // 🌟 FETCH DATA DARI MEDUSA
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/myob`, { 
          cache: 'no-store',
          next: { revalidate: 0 } 
        });
        
        const data = await res.json();

        if (data && data.myob_content) {
          setContent(data.myob_content);
        }
      } catch (error) {
        console.error("Error fetching MYOB content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <main className="w-full min-h-screen bg-white text-[#111111]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center bg-black pb-12 md:pb-16">
        <div className="absolute inset-0 w-full h-full opacity-70">
          <Image
            src="/about/Niconico-Resort-About Us-Image-1.webp"
            alt="Make Your Own Brand Niconico Resort"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 w-full">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.1em] text-white uppercase leading-tight drop-shadow-lg">
            {/* Dinamis dari backend, kalau belum loading pakai teks default */}
            {content?.heading || "MAKE YOUR OWN BRAND"}
          </h1>
        </div>
      </section>

      {/* ================= CONTENT SECTION (SINKRON DARI MEDUSA) ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-10 md:pt-20 pb-6 md:pb-16">
        
        {isLoading ? (
          // SKELETON LOADING (Biar tetep terlihat Luxury pas loading)
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
             <div className="w-full md:w-1/2 aspect-[16/10] bg-gray-200 animate-pulse rounded-[24px] shadow-sm shrink-0"></div>
             <div className="w-full md:w-1/2 space-y-4">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-full"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-full"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-5/6"></div>
             </div>
          </div>
        ) : (
          content?.mediaUrl && (
            // 🌟 LAYOUT KIRI-KANAN UNTUK DESKTOP
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-between">
              
              {/* KIRI: MEDIA CARD (Video / Gambar) */}
              <div className="relative w-full md:w-1/2 aspect-[16/10] bg-black rounded-[24px] overflow-hidden shadow-xl group shrink-0">
                {isVideo(content.mediaUrl) ? (
                  <video 
                    src={content.mediaUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <Image 
                    src={content.mediaUrl} 
                    alt={content.heading || "MYOB Media"}
                    fill
                    unoptimized 
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
                  />
                )}
              </div>

              {/* KANAN: QUOTE TEXT DARI BACKEND */}
              <div className="w-full md:w-1/2 text-center md:text-left px-4 md:px-0">
                <p className="text-sm md:text-lg text-gray-800 font-bold leading-relaxed italic border-l-0 md:border-l-4 md:border-[#EF7044] md:pl-6 py-2">
                  "{content.quoteVerbatim}"
                </p>
              </div>

            </div>
          )
        )}
      </section>

      {/* ================= FORM SECTION (KIRIM KE EMAIL NICONICO) ================= */}
      <section className="w-full max-w-lg mx-auto px-6 pb-20">
        <h3 className="text-center font-bold text-lg md:text-xl text-gray-900 mb-6">
          Let's Start Your Own Brand
        </h3>
        
        {/* 🌟 ACTION DIARAHKAN KE FORMSUBMIT DENGAN EMAIL BOS */}
        <form 
          action="https://formsubmit.co/niconicogd@gmail.com" 
          method="POST" 
          className="flex flex-col gap-4"
        >
          {/* Hidden fields untuk pengaturan email FormSubmit */}
          <input type="hidden" name="_subject" value="🔥 NEW BRAND CREATION REQUEST from Niconico!" />
          <input type="hidden" name="_captcha" value="false" />
          
          <input 
            type="text" 
            name="Name" 
            placeholder="Name" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <input 
            type="email" 
            name="Email" 
            placeholder="E-Mail" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <input 
            type="tel" 
            name="Phone" 
            placeholder="Phone" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <input 
            type="text" 
            name="Brand Name" 
            placeholder="Brand Name" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <input 
            type="text" 
            name="Nationality / Country" 
            placeholder="Nationality / Country" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <input 
            type="text" 
            name="Address" 
            placeholder="Address" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all bg-transparent"
          />
          
          <textarea 
            name="Notes" 
            placeholder="Notes" 
            rows={5}
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all resize-none bg-transparent"
          ></textarea>

          {/* 🌟 Custom Button Sesuai Desain (Orange, Pill, Arrow, Italic) */}
          <div className="flex justify-center mt-6">
            <button 
              type="submit"
              className="flex items-center justify-center gap-3 bg-[#EF7044] text-white border-2 border-[#EF7044] px-8 py-3.5 rounded-full font-black italic text-[13px] md:text-sm tracking-widest hover:bg-white hover:text-[#EF7044] transition-all duration-300 group shadow-lg active:scale-95"
            >
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[2px] border-white flex items-center justify-center group-hover:border-[#EF7044] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="text-white group-hover:text-[#EF7044] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </div>
              {/* Dinamis dari backend, kalau belum loading/kosong pakai teks default */}
              {content?.buttonText || "CREATE MY OWN BRAND"}
            </button>
          </div>
        </form>

      </section>
    </main>
  );
}