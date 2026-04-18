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
        const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/make-your-own-brand`, { 
          cache: 'no-store',
          next: { revalidate: 0 } 
        });
        
        const data = await res.json();

        if (data && data.myob_content) {
          setContent(data.myob_content);
        }
      } catch (error) {
        console.error("Gagal menarik data MYOB:", error);
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
    <section className="py-16 px-4 md:px-8 max-w-[900px] mx-auto bg-white flex flex-col items-center">
      
      {/* 1. HEADING */}
      <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-8 text-center uppercase">
        {content.heading}
      </h2>

      {/* 2. MEDIA CARD (Otomatis menyesuaikan Gambar/Video tanpa ikon Play) */}
      <div className="w-full aspect-video rounded-3xl md:rounded-[2rem] overflow-hidden relative shadow-md mb-8 bg-black group cursor-pointer">
        {hasVideo ? (
          /* --- JIKA VIDEO --- */
          <video 
            src={content.mediaUrl}
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
          />
        ) : (
          /* --- JIKA GAMBAR --- */
          <div className="relative w-full h-full">
            <Image
              src={content.mediaUrl} 
              alt={content.heading}
              fill
              unoptimized 
              priority
              sizes="(max-width: 768px) 100vw, 900px"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
            />
          </div>
        )}
      </div>

      {/* 3. QUOTE TEXT */}
      <p className="text-black text-sm md:text-base font-medium max-w-3xl leading-relaxed text-center mb-10">
        {content.quoteVerbatim}
      </p>

      {/* 4. CTA BUTTON */}
      <Link 
        href={content.buttonLink || "#"}
        className="px-8 py-3.5 bg-[#ED5725] text-white font-bold tracking-wide rounded-full uppercase italic flex items-center justify-center gap-3 shadow-md hover:shadow-lg border-2 border-transparent hover:bg-white hover:text-[#ED5725] hover:border-[#ED5725] transition-all duration-300 group active:scale-[0.98]"
      >
         <div className="w-6 h-6 rounded-full bg-white text-[#ED5725] flex items-center justify-center group-hover:bg-[#ED5725] group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z"/>
            </svg>
         </div>
         <span>{content.buttonText}</span>
      </Link>
      
    </section>
  );
}