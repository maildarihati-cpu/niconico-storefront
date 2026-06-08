"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MakeYourOwnBrandSection() {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FUNGSI SAKTI PENDETEKSI VIDEO ---
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  }

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

  if (isLoading) {
    return <div className="py-24 text-center text-gray-400 animate-pulse uppercase tracking-widest text-xs">Loading Niconico Content...</div>;
  }

  if (!content || !content.heading) {
    return null;
  }

  const hasVideo = isVideo(content.mediaUrl);

  return (
    <section className="px-4 md:px-8 max-w-[1100px] mx-auto bg-white flex flex-col lg:flex-row lg:items-center lg:gap-16">
      
      {/* 🌟 BAGIAN KIRI DI DESKTOP (Media Card) */}
      <div className="order-2 lg:order-1 w-full lg:w-1/2 aspect-video rounded-3xl md:rounded-[2rem] overflow-hidden relative shadow-md mb-8 lg:mb-0 bg-black group cursor-pointer shrink-0">
        {hasVideo ? (
          <video 
            src={content.mediaUrl}
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={content.mediaUrl} 
              alt={content.heading}
              fill
              unoptimized 
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
            />
          </div>
        )}
      </div>

      {/* 🌟 BAGIAN KANAN DI DESKTOP (Teks & Button) */}
      <div className="contents lg:flex lg:flex-col lg:w-1/2 lg:order-2 lg:items-center lg:justify-center">
        
        {/* HEADING (🌟 PERUBAHAN: Diubah menjadi text-[25px] agar konsisten di semua device) */}
        <h2 className="order-1 lg:order-none text-[25px] font-heavy text-center text-black tracking-tight mb-8 lg:mb-6 w-full">
          {content.heading}
        </h2>

        {/* QUOTE TEXT */}
        <p className="order-3 lg:order-none text-black text-sm md:text-base font-regular max-w-3xl leading-relaxed text-center mb-10 lg:mb-8 w-full px-4 lg:px-0">
          {content.quoteVerbatim}
        </p>

        {/* CTA BUTTON */}
        <div className="order-4 lg:order-none flex justify-center w-full">
          <Link 
            href={content.buttonLink || "#"}
            className="px-8 py-3.5 bg-[#EF7044] text-white font-heavy tracking-wide rounded-full uppercase italic flex items-center justify-center gap-3 shadow-md hover:shadow-lg border-2 border-transparent hover:bg-white hover:text-[#EF7044] hover:border-[#EF7044] transition-all duration-300 group active:scale-[0.98] w-fit"
          >
            <div className="w-6 h-6 rounded-full bg-white text-[#EF7044] flex items-center justify-center group-hover:bg-[#EF7044] group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z"/>
                </svg>
            </div>
            <span>{content.buttonText}</span>
          </Link>
        </div>

      </div>
      
    </section>
  );
}