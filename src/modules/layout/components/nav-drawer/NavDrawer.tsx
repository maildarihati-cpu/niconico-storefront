"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { X, Search, ChevronRight, ChevronDown, Star, Zap, Loader2 } from "lucide-react";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listProducts } from "@lib/data/products"; // 👈 Import fungsi panggil database

interface Props {
  isOpen: boolean;
  onClose: () => void;
  view: "menu" | "search";
  setView: (v: "menu" | "search") => void;
}

export default function NavDrawer({ isOpen, onClose, view, setView }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { countryCode } = useParams();

  // State untuk Menu Accordion
  const [isShopsOpen, setIsShopsOpen] = useState(true);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);

  // State untuk Data Database
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Autofocus ke input kalau tab search sedang aktif
  useEffect(() => {
    if (isOpen && view === "search") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, view]);

  // FUNGSI TARIK DATA DARI MEDUSA
  useEffect(() => {
    async function fetchRecommendations() {
      // Biar nggak narik data berkali-kali kalau udah ada
      if (!isOpen || view !== "search" || bestSellers.length > 0) return; 

      setIsLoadingData(true);
      try {
        const data = await listProducts({
          queryParams: {
            limit: 5, // Ambil 5 produk
            order: "-created_at", // Urutkan dari yang paling baru
            fields: "*variants,*variants.prices",
          },
          countryCode: countryCode as string,
        });

        if (data && data.response) {
          const products = data.response.products;
          // Kita pecah: 2 buat Best Seller, sisanya buat New Arrival
          setBestSellers(products.slice(0, 2));
          setNewArrivals(products.slice(2, 5));
        }
      } catch (error) {
        console.error("Gagal ambil rekomendasi:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchRecommendations();
  }, [isOpen, view, countryCode]);

  // Fungsi Format Harga
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProductPrice = (product: any) => {
    const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
    return countryCode === "id" ? price : price / 100;
  };

  return (
    <>
      <div className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />

      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[380px] bg-white z-[101] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* HEADER DRAWER */}
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <div className="flex gap-4">
            <button onClick={() => setView("menu")} className={`text-xs font-bold tracking-widest uppercase transition-all ${view === "menu" ? "text-[#ef7044] border-b-2 border-[#ef7044]" : "text-gray-400 hover:text-gray-600"}`}>Menu</button>
            <button onClick={() => setView("search")} className={`text-xs font-bold tracking-widest uppercase transition-all ${view === "search" ? "text-[#ef7044] border-b-2 border-[#ef7044]" : "text-gray-400 hover:text-gray-600"}`}>Search</button>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 hover:text-[#ef7044] transition-colors group">
            <X className="w-4 h-4 text-gray-500 group-hover:text-[#ef7044]" />
          </button>
        </div>

        {/* KONTEN DRAWER */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          {view === "menu" ? (
            /* --- TAB: HAMBURGER MENU --- */
            <div className="flex flex-col gap-5 pt-1 animate-in fade-in slide-in-from-left-4 duration-300">
              
              {/* SECTION: FEATURED */}
              <div>
                <p className="text-[#ef7044] text-[13px] font-medium mb-3">Featured</p>
                <div className="grid grid-cols-2 gap-3">
                  <LocalizedClientLink href="/store" onClick={onClose} className="relative h-14 rounded-xl overflow-hidden group block shadow-sm">
                    <Image src="/bikini-cat.jpg" alt="Today's Offers" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                      <span className="text-white text-xs font-bold">Today's Offers</span>
                    </div>
                  </LocalizedClientLink>
                  <LocalizedClientLink href="/store" onClick={onClose} className="relative h-14 rounded-xl overflow-hidden group block shadow-sm">
                    <Image src="/resort-cat.jpg" alt="Make Your Own Brand" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                      <span className="text-white text-xs font-bold text-center leading-tight">Make Your<br/>Own Brand</span>
                    </div>
                  </LocalizedClientLink>
                </div>
              </div>

              <hr className="border-gray-100 my-1" />

              <LocalizedClientLink href="/store" onClick={onClose} className="flex justify-between items-center text-[#ef7044] font-medium text-[13px] uppercase tracking-wide group">
                NEW RELEASE.!
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LocalizedClientLink>

              {/* ACCORDION: SHOPS */}
              <div>
                <button onClick={() => setIsShopsOpen(!isShopsOpen)} className="w-full flex justify-between items-center text-[#ef7044] font-medium text-[13px] uppercase tracking-wide mb-3">
                  SHOPS
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isShopsOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex flex-col gap-3.5 pl-4 overflow-hidden transition-all duration-300 origin-top ${isShopsOpen ? "max-h-[500px] opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"}`}>
                  {["Bikini", "Swimsuit", "Resort Wear", "Men's Wear", "Accesories"].map(item => (
                    <LocalizedClientLink key={item} href="/store" onClick={onClose} className="text-[13px] text-gray-900 font-medium hover:text-[#ef7044] transition-colors">{item}</LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* ACCORDION: TOP COLLECTIONS */}
              <div>
                <button onClick={() => setIsCollectionsOpen(!isCollectionsOpen)} className="w-full flex justify-between items-center text-[#ef7044] font-medium text-[13px] uppercase tracking-wide mb-3">
                  TOP COLLECTIONS
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollectionsOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`flex flex-col gap-3.5 pl-4 overflow-hidden transition-all duration-300 origin-top ${isCollectionsOpen ? "max-h-[500px] opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"}`}>
                  {["Signature", "Island Escape", "Bali Summer"].map(item => (
                    <LocalizedClientLink key={item} href="/store" onClick={onClose} className="text-[13px] text-gray-900 font-medium hover:text-[#ef7044] transition-colors">{item}</LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* MENU LINKS BAWAH */}
              <div className="flex flex-col gap-4 mt-2">
                {["BEST SELLER", "MAKE YOUR OWN BRAND", "OUR STORE", "ABOUT US", "CONTACT US"].map(item => (
                  <LocalizedClientLink key={item} href="/store" onClick={onClose} className="flex justify-between items-center text-[#ef7044] font-medium text-[13px] uppercase tracking-wide group">
                    {item}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </LocalizedClientLink>
                ))}
              </div>

            </div>
          ) : (
            /* --- TAB: SEARCH & REKOMENDASI --- */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative mb-10">
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full border-b-2 border-gray-100 py-3 pl-10 focus:outline-none focus:border-[#ef7044] text-lg transition-all placeholder:text-gray-300 font-medium"
                />
                <Search className="absolute left-0 top-4 w-6 h-6 text-gray-300" />
              </div>

              {isLoadingData ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                   <Loader2 className="w-8 h-8 text-[#ef7044] animate-spin mb-4" />
                   <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Loading Products...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {/* Bagian Best Seller (DARI DATABASE) */}
                  {bestSellers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-[#ef7044] fill-[#ef7044]" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Best Sellers</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {bestSellers.map((product) => (
                          <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} onClick={onClose} className="group cursor-pointer block">
                            <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-2">
                               <Image src={product.thumbnail || "/placeholder.png"} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-900 truncate group-hover:text-[#ef7044] transition-colors">{product.title}</p>
                            <p className="text-[9px] text-[#ef7044] font-black">{formatPrice(getProductPrice(product))}</p>
                          </LocalizedClientLink>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bagian New Arrivals (DARI DATABASE) */}
                  {newArrivals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-[#ef7044] fill-[#ef7044]" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">New Arrivals</h4>
                      </div>
                      <div className="flex flex-col gap-3">
                        {newArrivals.map((product) => (
                          <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} onClick={onClose} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm flex-shrink-0">
                               <Image src={product.thumbnail || "/placeholder.png"} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#ef7044] transition-colors line-clamp-1">{product.title}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#ef7044] transition-colors flex-shrink-0" />
                          </LocalizedClientLink>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER DRAWER */}
        <div className="p-8 bg-gray-50 mt-auto border-t border-gray-100 flex-shrink-0">
          <p className="text-[10px] text-gray-400 text-center italic">© 2026 Niconico Resort. Crafted for your island escape.</p>
        </div>
      </div>
    </>
  );
}