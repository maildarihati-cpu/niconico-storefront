"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useRef } from "react"; 
import Image from "next/image";
import { Menu, Search, ShoppingBag, User, Eye, ArrowRight, Heart } from "lucide-react";
import { useCart } from "../../../context/cart-context/cart-context";
import TopCollections from "@modules/home/components/top-collections";
import InstagramFeed from "@modules/home/components/instagram-feed";
import MakeYourOwnBrand from "@modules/home/components/make-your-own-brand";
import HeroSection from "@modules/home/components/hero-section";
import OurStoryTeller from "@modules/home/components/our-story-teller";
import StoreSection from "@modules/home/components/store-location";
import { Analytics } from "@vercel/analytics/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link";

// --- MESIN TRANSISI (DIPERLAMBAT JADI 2 DETIK) ---
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.1 } 
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[2000ms] ease-in-out h-full ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
// ---------------------------------------------------------

const categories = ["NEW ARRIVAL", "BIKINI SET", "SURF", "RESORT"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("NEW ARRIVAL");
  const [products, setProducts] = useState<any[]>([]);
  const [activeNewReleaseIndex, setActiveNewReleaseIndex] = useState(0);
  
  // State untuk Dot Navigation
  const [heroIndex, setHeroIndex] = useState(0);
  const [topColIndex, setTopColIndex] = useState(0);

useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": "pk_53647a63ad90d08e2411598afa8faa154cefa642874b80a9a478630c50f64c4c"
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const formatPrice = (product: any) => {
    const amount = product?.variants?.[0]?.prices?.[0]?.amount || 0;
    return `$ ${(amount / 100).toFixed(2)}`;
  };

  return (
    <main className="font-sans pb-20 overflow-x-hidden antialiased">
      
        <Analytics /> 

      <FadeInSection>
        <HeroSection />
      </FadeInSection>

      <FadeInSection>
        <TopCollections />
      </FadeInSection>

      {/* 🌟 PERUBAHAN: Menghapus padding dan menambahkan mt-12 (Margin Top 48px) */}
      <section className="w-full mt-12 mb-8 bg-white">
        <h2 className="text-center text-3xl font-heavy text-[25px] tracking-tight text-gray-900 py-3">
          Feature Products
        </h2>
        
        {/* flex-col untuk mobile, grid-cols-5 untuk desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 w-full">
          {[
            { title: "BIKINIS", img: "/bikinis.png", handle: "bikinis" },
            { title: "SWIMSUIT", img: "/swimsuit.png", handle: "swimsuit" },
            { title: "RESORT WEAR", img: "/resort-wear.png", handle: "resort-wear" },
            { title: "MEN'S WEAR", img: "/mens-wear.png", handle: "mens-wear" },
            { title: "ACCESSORIES", img: "/accessories.png", handle: "accessories" }
          ].map((item, idx) => (
            <FadeInSection key={idx} delay={idx * 150}>
              <LocalizedClientLink 
                href={`/store?category=${item.handle}`} 
                className="relative w-full h-[150px] lg:h-[500px] xl:h-[600px] group cursor-pointer overflow-hidden block"
              >
                
                <Image 
                  src={item.img} 
                  alt={item.title} 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-[#EF7044]/20"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-inter text-white text-[28px] lg:text-[22px] xl:text-[28px] text-center px-2 font-heavy italic tracking-[0.15em] drop-shadow-lg uppercase">
                    {item.title}
                  </h3>
                </div>
          
              </LocalizedClientLink>
            </FadeInSection>
          ))}
        </div>
      </section>

      <FadeInSection>
        <InstagramFeed />
      </FadeInSection>

      <FadeInSection>
        <MakeYourOwnBrand />
      </FadeInSection>

      <FadeInSection>
        <OurStoryTeller />
      </FadeInSection>

      <FadeInSection>
        <div className="mt-0"> 
          <StoreSection />
        </div>
      </FadeInSection>

    </main>
  );
}