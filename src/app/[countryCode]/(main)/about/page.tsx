"use client"

import React, { useState } from "react"
import Image from "next/image"
import OurStoryTeller from "@modules/home/components/our-story-teller";
import StoreSection from "@modules/home/components/store-location";

// Placeholder sementara
const ReviewsPlaceholder = () => (
  <div className="py-20 text-center bg-gray-50 border-t border-b text-gray-400 text-sm">
    [Section Reviews Muncul di Sini]
  </div>
)
const StoreLocationsPlaceholder = () => (
  <div className="py-20 text-center bg-white text-gray-400 text-sm">
    [Section Store Locations Muncul di Sini]
  </div>
)

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("our-story")

  // DAFTAR LOGO DINAMIS
  const brandLogos = [
    { src: "/images/logo-1.png", alt: "Brand 1" },
    { src: "/images/logo-2.png", alt: "Brand 2" },
    { src: "/images/logo-3.png", alt: "Brand 3" },
    { src: "/images/logo-4.png", alt: "Brand 4" },
    { src: "/images/logo-5.png", alt: "Brand 5" },
  ]

  const tabs = [
    { id: "our-story", label: "OUR STORY" },
    { id: "the-craft", label: "THE CRAFT" },
    { id: "the-spirit", label: "THE SPIRIT" },
    { id: "our-heritage", label: "OUR HERITAGE" },
  ]

  return (
    <main className="w-full min-h-screen bg-white text-[#111111]">
      
      {/* ================= HERO SECTION ================= */}
      {/* Sesuai gambar 21.00.18: Teks di bawah (items-end) */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex items-end justify-center bg-black pb-12 md:pb-16">
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Image
            src="/images/about-hero.jpg"
            alt="About Us"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.2em] text-white uppercase">
            ABOUT US
          </h1>
        </div>
      </section>

      {/* ================= TAB NAVIGATION ================= */}
      {/* Sesuai gambar: Tab menu dengan garis bawah saat aktif */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="flex justify-center border-b border-gray-200 overflow-x-auto no-scrollbar mb-16 md:mb-24">
          <div className="flex space-x-10 md:space-x-20 whitespace-nowrap px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[10px] md:text-xs tracking-[0.15em] uppercase transition-all duration-300 relative focus:outline-none ${
                  activeTab === tab.id
                    ? "text-[#111111] font-medium"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111111]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT VIEW ================= */}
        <div className="w-full transition-all duration-500">
          
          {/* TAB 1: OUR STORY (Gambar 21.00.39 - Gambar lebar di atas, teks di bawah) */}
          {activeTab === "our-story" && (
            <div className="flex flex-col gap-12 md:gap-16 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[16/7] md:aspect-[21/9] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/our-story.jpg"
                  alt="Our Story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900">
                  WHERE IT ALL BEGAN
                </h2>
                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                  Niconico started with a small team who had big ambitions. Our story is not one of rapid expansion, but of focused growth driven by passion. We believe in preserving the raw charm of our surroundings while weaving architectural wonders into the landscape.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: THE CRAFT (Gambar 21.00.53 - Teks Kiri, Gambar Kanan) */}
          {activeTab === "the-craft" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center animate-in fade-in duration-500">
              <div className="space-y-6 order-last md:order-first">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900">
                  PRECISION & PROCESS
                </h2>
                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                  Every element at Niconico is crafted with meticulous attention to detail. We collaborate with master artisans to create timeless spaces. From local hand-carved stone pillars to meticulously selected interior fabrics, our design fuses traditional indigenous artistry with contemporary modern structures.
                </p>
              </div>
              <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/the-craft.jpg"
                  alt="The Craft"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* TAB 3: THE SPIRIT (Gambar 21.01.05 - Gambar Kiri, Teks Kanan) */}
          {activeTab === "the-spirit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center animate-in fade-in duration-500">
              <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/the-spirit.jpg"
                  alt="The Spirit"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900">
                  THE SPIRIT
                </h2>
                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                  At the heart of Niconico lies a commitment to creating an unforgettable experience. Our spirit is one of warmth, passion, and creativity. We welcome you not just as travelers, but as family coming home. Our team anticipates your needs before they arise, crafting curated personal experiences.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: OUR HERITAGE (Kembali ke pola gambar lebar di atas) */}
          {activeTab === "our-heritage" && (
            <div className="flex flex-col gap-12 md:gap-16 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[16/7] md:aspect-[21/9] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/our-heritage.jpg"
                  alt="Our Heritage"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900">
                  A RICH HERITAGE
                </h2>
                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                  We are deeply rooted in our community and dedicated to preserving the culture. Our heritage shapes everything we do. Passing down through generations a commitment to ecological preservation and high-end cultural protection, Niconico stands strong as a cultural landmark of luxury.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= DYNAMIC LOGO SECTION ================= */}
      <section className="w-full py-16 mb-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center mb-12 opacity-70">
            <span className="h-[1px] w-16 bg-gray-300"></span>
            <h3 className="px-6 text-[10px] md:text-xs tracking-widest uppercase text-gray-500">
              FEATURED IN
            </h3>
            <span className="h-[1px] w-16 bg-gray-300"></span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {brandLogos.map((logo, index) => (
              <div 
                key={index} 
                className="h-6 md:h-8 w-auto filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center flex-shrink-0"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION BAWAH (Reviews & Store) ================= */}
      <section className="w-full">
        <OurStoryTeller />
        {/* <Reviews /> */}
      </section>

      <section className="w-full">
        <StoreSection />
        {/* <StoreLocations /> */}
      </section>

    </main>
  )
}