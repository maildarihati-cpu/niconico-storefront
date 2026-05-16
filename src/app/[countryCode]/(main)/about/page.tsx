"use client"

import React, { useState } from "react"
import Image from "next/image"

// 🌟 SILAKAN SESUAIKAN JALUR IMPORT COMPONENT BERIKUT DENGAN PROJECT KAMU
// import Reviews from "@modules/home/components/reviews"
// import StoreLocations from "@modules/store/components/store-locations"

// Mock Placeholder jika komponen asli belum di-import
const ReviewsPlaceholder = () => (
  <div className="py-16 text-center bg-gray-50 border-t border-b text-gray-400">
    [Section Reviews dari Components Muncul di Sini]
  </div>
)
const StoreLocationsPlaceholder = () => (
  <div className="py-16 text-center bg-white text-gray-400">
    [Section Store Locations dari Components Muncul di Sini]
  </div>
)

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("our-story")

  // 🌟 DAFTAR LOGO DINAMIS
  // Kamu bebas menambah, mengurangi, atau mengganti source image di array ini.
  // Layout akan otomatis menyesuaikan diri dan tetap rapi berkat grid & flexbox flex-wrap.
  const brandLogos = [
    { src: "/images/logo-1.png", alt: "Brand Partner 1" },
    { src: "/images/logo-2.png", alt: "Brand Partner 2" },
    { src: "/images/logo-3.png", alt: "Brand Partner 3" },
    { src: "/images/logo-4.png", alt: "Brand Partner 4" },
    { src: "/images/logo-5.png", alt: "Brand Partner 5" },
  ]

  const tabs = [
    { id: "our-story", label: "Our Story" },
    { id: "the-craft", label: "The Craft" },
    { id: "the-spirit", label: "The Spirit" },
    { id: "our-heritage", label: "Our Heritage" },
  ]

  return (
    <main className="w-full min-h-screen bg-white text-[#111111]">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Image
            src="/images/about-hero.jpg" // Jalur image local kamu
            alt="Niconico Resort Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-light tracking-widest text-white uppercase mb-4">
            Niconico Resort
          </h1>
          <p className="text-sm md:text-lg text-gray-200 tracking-wide max-w-xl mx-auto font-light leading-relaxed">
            A sanctuary where luxury meets nature, creating unforgettable timeless stories.
          </p>
        </div>
      </section>

      {/* ================= TAB NAVIGATION ================= */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex justify-center border-b border-gray-200 overflow-x-auto no-scrollbar mb-12">
          <div className="flex space-x-8 md:space-x-16 whitespace-nowrap px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-xs md:text-sm tracking-widest uppercase transition-all duration-300 relative focus:outline-none ${
                  activeTab === tab.id
                    ? "text-[#EF7044] font-medium"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#EF7044] animate-fade-in" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT VIEW ================= */}
        <div className="w-full transition-all duration-500">
          
          {activeTab === "our-story" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-gray-900">
                  Where It All Began
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Founded with a vision to redefine island hospitality, Niconico Resort began as a hidden coastal retreat. Over the years, we have preserved the raw charm of our surroundings while weaving architectural wonders into the landscape.
                </p>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Every corner tells a tale of discovery, passion, and an unyielding commitment to creating an extraordinary escape from the ordinary world.
                </p>
              </div>
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/our-story.jpg"
                  alt="Our Story Section"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {activeTab === "the-craft" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] w-full order-last md:order-first rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/the-craft.jpg"
                  alt="The Craft Section"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-gray-900">
                  Architectural Precision
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  We believe that true luxury lies in the details. From local hand-carved stone pillars to meticulously selected interior fabrics, our design fuses traditional indigenous artistry with contemporary modern structures.
                </p>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Collaborating with top-tier master artisans, every villa and lounge area is shaped to harmonize with the elements of light, wind, and open space.
                </p>
              </div>
            </div>
          )}

          {activeTab === "the-spirit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-gray-900">
                  Soulful Hospitality
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Hospitality at Niconico is not a set of rules—it is an innate spirit. We welcome you not just as travelers, but as family coming home. Our team anticipates your needs before they arise, crafting curated personal experiences.
                </p>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  It is the genuine warmth of a smile, the attention to your preferences, and the quiet dedication to making your stay seamless and meaningful.
                </p>
              </div>
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/the-spirit.jpg"
                  alt="The Spirit Section"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {activeTab === "our-heritage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] w-full order-last md:order-first rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/our-heritage.jpg"
                  alt="Our Heritage Section"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-gray-900">
                  A Legacy of Excellence
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Passing down through generations a commitment to ecological preservation and high-end cultural protection, Niconico stands strong as a cultural landmark of luxury.
                </p>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  We look forward to sharing our deeply rooted traditions and future horizons with global travelers for decades to come.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= DYNAMIC LOGO SECTION ================= */}
      {/* Kunci Auto-Rapi: Menggunakan flex-wrap bersamaitems-center dan justify-center.
        Ukuran luar logo dibatasi oleh max-w dan h-16 dengan object-contain, sehingga ukuran
        asli image berapapun tidak akan menghancurkan struktur baris grid halaman!
      */}
      <section className="w-full bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-8 font-medium">
            Trusted & Featured Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {brandLogos.map((logo, index) => (
              <div 
                key={index} 
                className="relative h-12 w-32 md:w-40 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMPONENTS SECTIONS ================= */}
      {/* Silakan ganti placeholder ini dengan tag komponen asli kamu jika sudah di-import */}
      <section className="w-full">
        <ReviewsPlaceholder />
        {/* <Reviews /> */}
      </section>

      <section className="w-full">
        <StoreLocationsPlaceholder />
        {/* <StoreLocations /> */}
      </section>

    </main>
  )
}