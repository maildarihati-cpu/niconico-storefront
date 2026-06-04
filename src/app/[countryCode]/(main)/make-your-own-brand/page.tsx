"use client";

import React from "react";
import Image from "next/image";

export default function MakeYourOwnBrandPage() {
  return (
    <main className="w-full min-h-screen bg-white text-[#111111]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center bg-black pb-12 md:pb-16">
        <div className="absolute inset-0 w-full h-full opacity-70">
          {/* 🌟 Ganti src ini dengan gambar kapal Niconico yang asli */}
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
            MAKE YOUR OWN BRAND
          </h1>
        </div>
      </section>

      {/* ================= CONTENT SECTION (VIDEO & QUOTE) ================= */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-10 md:pt-16 pb-6">
        
        {/* Thumbnail Video Mockup */}
        <div className="relative w-full aspect-[16/10] md:aspect-video bg-gray-200 rounded-[24px] md:rounded-[32px] overflow-hidden mb-8 shadow-lg group cursor-pointer">
          {/* 🌟 Ganti src ini dengan gambar thumbnail sketsa bikini yang asli */}
          <Image 
            src="/sketch-thumbnail.webp" 
            alt="Designing swimwear"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Overlay Gelap Tipis & Tombol Play */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors group-hover:bg-black/30">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="ml-1 md:ml-2 w-8 h-8 md:w-10 md:h-10">
                <path d="M5 3l14 9-14 9V3z" />
                </svg>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 px-2">
            "We Believe True Luxury Lies in The Details and in Authenticity"
          </h2>
          <p className="text-sm md:text-base text-gray-800 leading-relaxed px-4 md:px-0">
            Our velvet swimwear collection is the living embodiment of that belief. Watch as our design vision is brought to life by the masterful, from the careful selection of premium, buttery-soft velvet to the rhythmic heartbeat of a vintage sewing machine, every step is infused with precision and pride.
          </p>
        </div>
      </section>

      {/* ================= FORM SECTION (KIRIM KE EMAIL) ================= */}
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
              CREATE MY OWN BRAND
            </button>
          </div>
        </form>

      </section>
    </main>
  );
}