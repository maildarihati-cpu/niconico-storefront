"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, Search, ShoppingBag, User, Eye, ArrowRight, Heart } from "lucide-react";
import TopCollections from "@modules/home/components/top-collections";
import InstagramFeed from "@modules/home/components/instagram-feed";
import MakeYourOwnBrand from "@modules/home/components/make-your-own-brand";
import HeroSection from "@modules/home/components/hero-section";
import OurStoryTeller from "@modules/home/components/our-story-teller"

const categories = ["NEW ARRIVAL", "BIKINI SET", "SURF", "RESORT"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("NEW ARRIVAL");
  const [products, setProducts] = useState<any[]>([]);
  const [activeNewReleaseIndex, setActiveNewReleaseIndex] = useState(0);
  
  // State untuk Dot Navigation
  const [heroIndex, setHeroIndex] = useState(0);
  const [topColIndex, setTopColIndex] = useState(0);

useEffect(() => {
    // TAMBAHKAN HEADERS DENGAN API KEY DI BAWAH INI
    fetch("http://localhost:9000/store/products", {
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
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-5 left-5 right-5 bg-white/40 backdrop-blur-md z-30 flex items-center justify-between px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        
        {/* Hamburger & Search */}
        <div className="flex items-center gap-4 -ml-1">
          <button aria-label="Menu" className="p-1">
            <Menu className="w-5 h-5 text-gray-800" />
          </button>
          <button aria-label="Search" className="p-1">
            <Search className="w-5 h-5 text-gray-800" />
          </button>
        </div>
        
        {/* Tengah: Logo */}
        <div className="relative flex items-center justify-center w-28 h-8 md:w-36 md:h-10">
          <Image
            src="/logo-niconico-black.png"
            alt="Niconico Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 150px"
          />
        </div>

        {/* Profile & Cart */}
        <div className="flex gap-4 items-center -mr-1">
          <button aria-label="Profile/Login" className="p-1">
            <User className="w-5 h-5 text-gray-800" />
          </button>
          <button aria-label="Cart" className="p-1">
            <ShoppingBag className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </nav>


      <HeroSection />
      <TopCollections />

      {/* FEATURE PRODUCTS SECTION (Edge-to-Edge) */}
      <section className="w-full pb-10">
        {/* Judul Section (Sesuai yang terlihat samar di atas layar) */}
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 py-6">
          Feature Products
        </h2>
        
        {/* Container Gambar Berjejer Vertikal */}
        <div className="flex flex-col w-full">
          {[
            { title: "BIKINIS", img: "https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=800&auto=format&fit=crop" },
            { title: "SWIMSUIT", img: "https://images.unsplash.com/photo-1602488256728-7264850fa9ac?q=80&w=800&auto=format&fit=crop" },
            { title: "RESORT WEAR", img: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop" },
            { title: "MEN'S WEAR", img: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop" },
            { title: "ACCESORIES", img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop" }
          ].map((item, idx) => (
            <div key={idx} className="relative w-full h-[130px] group cursor-pointer overflow-hidden">
              
              {/* Gambar Background (Ada efek zoom sedikit saat di-hover biar premium) */}
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* OVERLAY: Hitam 40% default -> Orange (#ED5725) 20% saat Hover */}
              <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-[#ED5725]/20"></div>
              
              {/* Teks Judul Kategori */}
              <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="font-inter text-white text-[28px] font-black italic tracking-[0.15em] drop-shadow-lg uppercase">
                {item.title}
              </h3>
            </div>
              
            </div>
          ))}
        </div>
      </section>

      <InstagramFeed />
      <MakeYourOwnBrand />
      <OurStoryTeller />

    </main>
  );
}