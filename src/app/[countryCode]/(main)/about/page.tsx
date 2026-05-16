"use client"

import React, { useState } from "react"
import Image from "next/image"

// 🌟 IMPORT COMPONENT BAWAAN SESUAI REQUEST
import OurStoryTeller from "@modules/home/components/our-story-teller";
import StoreSection from "@modules/home/components/store-location";

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("our-story")

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
    <main className="w-full min-h-screen bg-white text-[#111111]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex items-end justify-start bg-black pb-16 md:pb-24 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Image
            src="/images/about-hero.jpg"
            alt="About Us"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] text-white uppercase text-left leading-tight">
            ABOUT US
          </h1>
        </div>
      </section>

      {/* ================= TAB NAVIGATION ================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex justify-center border-b border-gray-200 overflow-x-auto no-scrollbar mb-16 md:mb-20">
          <div className="flex space-x-10 md:space-x-20 whitespace-nowrap px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[10px] md:text-xs tracking-[0.15em] uppercase transition-all duration-300 relative focus:outline-none ${
                  activeTab === tab.id
                    ? "text-[#EF7044] font-medium"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#EF7044]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT VIEW ================= */}
        <div className="w-full transition-all duration-500 min-h-[50vh]">
          
          {/* TAB 1: OUR STORY (Gambar 1:5 di atas, Teks di bawah) */}
          {activeTab === "our-story" && (
            <div className="flex flex-col gap-10 md:gap-12 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[3/1] md:aspect-[5/1] bg-gray-100 overflow-hidden">
                <Image src="/images/our-story.jpg" alt="Our Story" fill className="object-cover" />
              </div>
              <div className="w-full space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900 text-left">
                  [JUDUL TAB 1]
                </h2>
                <div className="text-gray-600 font-light leading-relaxed text-sm md:text-base text-left space-y-4 max-w-4xl">
                  <p>[PARAGRAF TAB 1]</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE CRAFT (Teks di Kiri, Gambar 2:3 di Kanan) */}
          {activeTab === "the-craft" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center animate-in fade-in duration-500">
              <div className="space-y-6 order-last md:order-first">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900 text-left">
                  [JUDUL TAB 2]
                </h2>
                <div className="text-gray-600 font-light leading-relaxed text-sm md:text-base text-left space-y-4">
                  <p>[PARAGRAF TAB 2]</p>
                </div>
              </div>
              <div className="relative w-full aspect-[2/3] bg-gray-100 overflow-hidden">
                <Image src="/images/the-craft.jpg" alt="The Craft" fill className="object-cover" />
              </div>
            </div>
          )}

          {/* TAB 3: THE SPIRIT (Gambar 2:3 di Kiri, Teks di Kanan) */}
          {activeTab === "the-spirit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center animate-in fade-in duration-500">
              <div className="relative w-full aspect-[2/3] bg-gray-100 overflow-hidden">
                <Image src="/images/the-spirit.jpg" alt="The Spirit" fill className="object-cover" />
              </div>
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900 text-left">
                  [JUDUL TAB 3]
                </h2>
                <div className="text-gray-600 font-light leading-relaxed text-sm md:text-base text-left space-y-4">
                  <p>[PARAGRAF TAB 3]</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUR HERITAGE (Gambar 1:5 di atas, Teks di bawah) */}
          {activeTab === "our-heritage" && (
            <div className="flex flex-col gap-10 md:gap-12 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[3/1] md:aspect-[5/1] bg-gray-100 overflow-hidden">
                <Image src="/images/our-heritage.jpg" alt="Our Heritage" fill className="object-cover" />
              </div>
              <div className="w-full space-y-6">
                <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-gray-900 text-left">
                  [JUDUL TAB 4]
                </h2>
                <div className="text-gray-600 font-light leading-relaxed text-sm md:text-base text-left space-y-4 max-w-4xl">
                  <p>[PARAGRAF TAB 4]</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= DYNAMIC LOGO SECTION ================= */}
      <section className="w-full py-16 mb-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-12 opacity-70">
            <span className="h-[1px] w-16 bg-gray-300"></span>
            <h3 className="px-6 text-[10px] md:text-xs tracking-widest uppercase text-gray-500">
              FEATURED IN
            </h3>
            <span className="h-[1px] w-16 bg-gray-300"></span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {brandLogos.map((logo, index) => (
              <div 
                key={index} 
                className="h-8 md:h-10 w-auto filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION BAWAH DARI COMPONENTS ================= */}
      <section className="w-full">
        <OurStoryTeller />
      </section>

      <section className="w-full">
        <StoreSection />
      </section>

    </main>
  )
}