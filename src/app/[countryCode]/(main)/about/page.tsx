"use client"

import React, { useState } from "react"
import Image from "next/image"

// 🌟 UPDATE THESE COMPONENT IMPORTS WITH THE CORRECT PATHS FROM YOUR PROJECT
import OurStoryTeller from "@modules/home/components/our-story-teller";
import StoreSection from "@modules/home/components/store-location";

// Placeholder components if the real ones are not imported
const ReviewsPlaceholder = () => (
  <div className="py-20 text-center bg-gray-50 border-t border-b border-gray-200 text-gray-400">
    [Reviews section from components will appear here]
  </div>
)
const StoreLocationsPlaceholder = () => (
  <div className="py-20 text-center bg-white text-gray-400">
    [Store Locations section from components will appear here]
  </div>
)

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("our-story")

  // 🌟 DYNAMIC LOGO LIST
  // Add, remove, or change your local image sources here.
  // The layout will remain clean and automatically adjust.
  const brandLogos = [
    { src: "/images/logo-condenast.png", alt: "Condé Nast Traveler" },
    { src: "/images/logo-afar.png", alt: "AFAR" },
    { src: "/images/logo-ad.png", alt: "AD" },
    { src: "/images/logo-travel-leisure.png", alt: "travel+leisure" },
    { src: "/images/logo-departures.png", alt: "departures" },
    { src: "/images/logo-forbes.png", alt: "FORBES" },
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
      {/* Centered background image, text, and overlay */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Image
            src="/images/about-hero.jpg" // Local image source
            alt="About Us Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-widest text-white uppercase centered-text">
            ABOUT US
          </h1>
        </div>
      </section>

      {/* ================= TAB NAVIGATION ================= */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex justify-center border-b border-gray-200 overflow-x-auto no-scrollbar mb-16">
          <div className="flex space-x-12 md:space-x-20 whitespace-nowrap px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-5 text-xs tracking-widest uppercase transition-all duration-300 relative focus:outline-none ${
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
          
          {/* OUR STORY TAB - Content from image_1.png */}
          {activeTab === "our-story" && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-light tracking-widest uppercase text-gray-900 left-aligned-title">
                  WHERE IT ALL BEGAN
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Niconico started with a small team who had big ambitions. Our story is not one of rapid expansion, but of focused growth driven by passion.
                </p>
              </div>
              <div className="flex-1 relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/our-story.jpg" // Local image source
                  alt="Where It All Began"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* THE CRAFT TAB - Following alternate pattern (Image L, Text R) */}
          {activeTab === "the-craft" && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 relative aspect-[4/3] w-full order-last md:order-first rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/the-craft.jpg" // Local image source
                  alt="Precision and Process"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-light tracking-widest uppercase text-gray-900 left-aligned-title">
                  PRECISION & PROCESS
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  Every element at Niconico is crafted with meticulous attention to detail. We collaborate with master artisans to create timeless spaces.
                </p>
              </div>
            </div>
          )}

          {/* THE SPIRIT TAB - Content from image_2.png */}
          {activeTab === "the-spirit" && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/the-spirit.jpg" // Local image source
                  alt="The Niconico Spirit"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-light tracking-widest uppercase text-gray-900 left-aligned-title">
                  THE SPIRIT
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  At the heart of Niconico lies a commitment to creating an unforgettable experience. Our spirit is one of warmth, passion, and creativity.
                </p>
              </div>
            </div>
          )}

          {/* OUR HERITAGE TAB - Following alternate pattern (Text L, Image R) */}
          {activeTab === "our-heritage" && (
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-light tracking-widest uppercase text-gray-900 left-aligned-title">
                  A RICH HERITAGE
                </h2>
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                  We are deeply rooted in our community and dedicated to preserving the culture. Our heritage shapes everything we do.
                </p>
              </div>
              <div className="flex-1 relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
                <Image
                  src="/images/our-heritage.jpg" // Local image source
                  alt="Our Heritage"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= DYNAMIC LOGO SECTION - Content from image_3.png ================= */}
      <section className="w-full bg-gray-50 py-20 border-t border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px bg-gray-200 flex-grow max-w-40" />
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium centered-text">
              FEATURED IN
            </p>
            <div className="h-px bg-gray-200 flex-grow max-w-40" />
          </div>
          {/* Logo container: centers contents and allows wrapping */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 md:gap-x-20">
            {brandLogos.map((logo, index) => (
              /* Logo wrapper: sets a constrained max height and dynamic width, with hover effects */
              <div 
                key={index} 
                className="h-10 w-auto filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center flex-shrink-0"
              >
                {/* Image tag with object-contain ensures clean display for all aspect ratios */}
                <img
                  src={logo.src} // Local image source
                  alt={logo.alt}
                  className="max-h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMPONENTS SECTIONS ================= */}
      {/* Replaced real component tags with placeholders for now. Replace them when ready. */}
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