"use client"

import React, { useState } from "react"
import Image from "next/image"

// 🌟 IMPORT COMPONENT BAWAAN
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
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-end justify-center bg-black pb-16 md:pb-20">
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Image
            src="/images/about-hero.jpg"
            alt="About Us"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-6 w-full">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.2em] text-white uppercase leading-tight">
            ABOUT US
          </h1>
        </div>
      </section>

      {/* ================= TAB NAVIGATION ================= */}
      {/* Pakai flex-nowrap dan overflow-x-auto biar fix 1 baris */}
      <section className="w-full max-w-full mx-auto py-10 md:py-14">
        <div className="flex justify-center border-b border-gray-200 mb-8 md:mb-12 px-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap justify-center space-x-6 md:space-x-16 w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[10px] md:text-sm tracking-[0.15em] uppercase transition-all duration-300 relative focus:outline-none whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#EF7044] font-bold"
                    : "text-gray-400 hover:text-gray-900 font-medium"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#EF7044]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT VIEW ================= */}
        <div className="w-full transition-all duration-500">
          
          {/* TAB 1: OUR STORY */}
          {activeTab === "our-story" && (
            <div className="flex flex-col gap-10 md:gap-14 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[4/1] md:aspect-[6/1] bg-gray-100">
                <Image src="/images/our-story.jpg" alt="Our Story" fill className="object-cover" />
              </div>
              <div className="max-w-5xl mx-auto px-6 text-left space-y-6">
                <div className="text-gray-700 font-normal leading-relaxed text-base md:text-lg space-y-6">
                  <p>
                    Founded in Jakarta in 2002 by designer <strong className="font-bold border-b border-black">Nico Genze</strong>, Niconico 
                    was born from a passion for tropical living and thoughtful design.
                    After moving to Bali a year later, the brand naturally evolved into
                    a celebration of sun, sea, and coastal life.
                  </p>
                  <p>
                    What began as a small boutique has grown into a global symbol
                    of effortless island luxury, guided by a commitment to function,
                    durability, and the way a woman moves.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE CRAFT */}
          {activeTab === "the-craft" && (
            <div className="flex flex-col md:flex-row items-center animate-in fade-in duration-500">
              <div className="w-full md:w-[65%] px-6 md:pl-20 md:pr-16 py-10 order-last md:order-first">
                <div className="text-gray-700 font-normal leading-relaxed text-base md:text-lg space-y-6">
                  <p>
                    Today, Niconico remains independent and founder-led. 
                    Every piece is designed by Nico and produced entirely in-house
                    in Bali—from the initial pattern to the final hand-finished detail.
                  </p>
                  <p>
                    We prioritize responsible, long-lasting fabrics that balance
                    performance with a reduced environmental impact.
                    For us, sustainability isn't a trend; it's about making pieces that last.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-[35%] relative aspect-[2/3] bg-gray-100">
                <Image src="/images/the-craft.jpg" alt="The Craft" fill className="object-cover" />
              </div>
            </div>
          )}

          {/* TAB 3: THE SPIRIT */}
          {activeTab === "the-spirit" && (
            <div className="flex flex-col md:flex-row items-center animate-in fade-in duration-500">
              <div className="w-full md:w-[35%] relative aspect-[2/3] bg-gray-100">
                <Image src="/images/the-spirit.jpg" alt="The Spirit" fill className="object-cover" />
              </div>
              <div className="w-full md:w-[65%] px-6 md:pr-20 md:pl-16 py-10">
                <div className="text-gray-700 font-normal leading-relaxed text-base md:text-lg space-y-6">
                  <p>We design for confidence and individuality.</p>
                  <p>Our collections celebrate all body shapes, blending playful femininity with timeless island style.</p>
                  <p>Whether it’s a sunrise swim or a sunset cocktail, Niconico is made to make you feel beautiful in your own skin.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUR HERITAGE */}
          {activeTab === "our-heritage" && (
            <div className="flex flex-col gap-10 md:gap-14 animate-in fade-in duration-500">
              <div className="relative w-full aspect-[4/1] md:aspect-[6/1] bg-gray-100">
                <Image src="/images/our-heritage.jpg" alt="Our Heritage" fill className="object-cover" />
              </div>
              <div className="max-w-5xl mx-auto px-6 text-left space-y-6">
                <div className="text-gray-700 font-normal leading-relaxed text-base md:text-lg space-y-6">
                  <p>With over two decades of expertise, our roots run deep.</p>
                  <p>
                    Designer Nico Genze, whose background includes time at Victoria’s Secret in New York—has called Indonesia home for most of his life. 
                    Since 2010, we have proudly provided the swimwear for Miss Indonesia on the global stage. 
                    From the shores of Bali to beaches worldwide, Niconico continues to capture the joy of sunshine, salt water, and self-expression.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= DYNAMIC LOGO SECTION ================= */}
      {/* Menggunakan flex + gap konstan untuk tampilan mengalir dengan tinggi sama rata */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-14 opacity-60">
            <span className="h-[1px] w-20 bg-gray-300"></span>
            <h3 className="px-6 text-[10px] md:text-xs tracking-widest uppercase text-gray-500 font-bold">
              FEATURED IN
            </h3>
            <span className="h-[1px] w-20 bg-gray-300"></span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {brandLogos.map((logo, index) => (
              <div 
                key={index} 
                className="h-8 md:h-12 w-auto flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
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

      {/* ================= SECTION COMPONENTS ================= */}
      <section className="w-full">
        <OurStoryTeller />
      </section>

      <section className="w-full mt-10">
        <StoreSection />
      </section>

    </main>
  )
}