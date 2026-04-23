"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useRef } from "react"; 
import Image from "next/image";
import { Menu, Search, ShoppingBag, User, Eye, ArrowRight, Heart } from "lucide-react";
import { useCart } from "../../../context/cart-context";
import TopCollections from "@modules/home/components/top-collections";
import InstagramFeed from "@modules/home/components/instagram-feed";
import MakeYourOwnBrand from "@modules/home/components/make-your-own-brand";
import HeroSection from "@modules/home/components/hero-section";
import OurStoryTeller from "@modules/home/components/our-story-teller";
import StoreSection from "@modules/home/components/store-location";
import { Analytics } from "@vercel/analytics/react"

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
      // Durasinya diubah jadi 2000ms (2 detik) dan translate-y-16 (mulai dari lebih bawah)
      className={`transition-all duration-[2000ms] ease-in-out ${
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
        if (!res.ok) throw new Error("Gagal mengambil produk");
        return res.json();
      })
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Gagal menarik data database:", err));
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

      
      <FadeInSection>
        
        <section className="w-full bg-white">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 py-6">
            Feature Products
          </h2>
          
          <div className="flex flex-col w-full">
            {[
              { title: "BIKINIS", img: "https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=800&auto=format&fit=crop" },
              { title: "SWIMSUIT", img: "https://images.unsplash.com/photo-1520316587275-5e4f06f68971?q=80&w=800&auto=format&fit=crop" },
              { title: "RESORT WEAR", img: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop" },
              { title: "MEN'S WEAR", img: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop" },
              { title: "ACCESORIES", img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop" }
            ].map((item, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="relative w-full h-[150px] group cursor-pointer overflow-hidden">
                  
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill 
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  
                  <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-[#ED5725]/20"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-inter text-white text-[28px] font-black italic tracking-[0.15em] drop-shadow-lg uppercase">
                    {item.title}
                  </h3>
                </div>
                  
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>
      </FadeInSection>

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