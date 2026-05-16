"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { X, Search, ChevronRight, ChevronDown, Star, Zap, Loader2 } from "lucide-react";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listProducts } from "@lib/data/products";
// ❌ IMPORT listCategories SUDAH DIHAPUS AGAR TIDAK ERROR SERVER-ONLY DI VERCEL

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

  // FUNGSI TARIK DATA DARI MEDUSA (REKOMENDASI SEARCH)
  useEffect(() => {
    async function fetchRecommendations() {
      // Biar nggak narik data berkali-kali kalau udah ada
      if (!isOpen || view !== "search" || (bestSellers.length > 0 && newArrivals.length > 0)) return; 

      setIsLoadingData(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

        // 🌟 1. Tarik Category ID pakai Native Fetch (Bypass "Server-Only" Error)
        const fetchCategory = async (handle: string) => {
          const res = await fetch(`${backendUrl}/store/product-categories?handle=${handle}`, {
            headers: { "x-publishable-api-key": apiKey }
          }).catch(() => null);
          
          if (!res) return null;
          const data = await res.json();
          return data.product_categories?.[0];
        };

        const bsCategory = await fetchCategory("best-seller");
        const naCategory = await fetchCategory("new-arrivals");

        // 🌟 2. Jika ketemu, tarik produk berdasarkan CATEGORY_ID
        if (bsCategory) {
          const bsData = await listProducts({
            queryParams: { category_id: [bsCategory.id], limit: 2, fields: "*variants,*variants.prices" },
            countryCode: countryCode as string,
          }).catch(() => null);
          if (bsData && bsData.response) setBestSellers(bsData.response.products);
        }

        if (naCategory) {
          const naData = await listProducts({
            queryParams: { category_id: [naCategory.id], limit: 3, fields: "*variants,*variants.prices" },
            countryCode: countryCode as string,
          }).catch(() => null);
          if (naData && naData.response) setNewArrivals(naData.response.products);
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
        <div className="p-6 flex justify-between items-center border-b border-gray-50 flex-shrink-0">
          <div className="flex gap-4">
            <button onClick={() => setView("menu")} className={`text-xs font-bold tracking-widest uppercase transition-all ${view === "menu" ? "text-[#ef7044] border-b-2 border-[#ef7044]" : "text-gray-400 hover:text-gray-600"}`}>Menu</button>
            <button onClick={() => setView("search")} className={`text-xs font-bold tracking-widest uppercase transition-all ${view === "search" ? "text-[#ef7044] border-b-2 border-[#ef7044]" : "text-gray-400 hover:text-gray-600"}`}>Search</button>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 hover:text-[#ef7044] transition-colors group">
            <X className="w-4 h-4 text-gray-500 group-hover:text-[#ef7044]" />
          </button>
        </div>

        {/* KONTEN DRAWER */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-20">
          {view === "menu" ? (
            /* --- TAB: HAMBURGER MENU --- */
            <div className="flex flex-col gap-5 pt-1 animate-in fade-in slide-in-from-left-4 duration-300">
              
              {/* SECTION: FEATURED */}
              <div>
                <p className="text-[#ef7044] text-[13px] font-medium mb-3">Featured</p>
                <div className="grid grid-cols-2 gap-3">
                  <LocalizedClientLink href="/store?category=discount" onClick={onClose} className="relative h-14 rounded-xl overflow-hidden group block shadow-sm">
                    <Image src="/today-offer.png" alt="Today's Offers" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                      <span className="text-white text-xs font-bold">Today's Offers</span>
                    </div>
                  </LocalizedClientLink>
                  <LocalizedClientLink href="/make-your-own-brand" onClick={onClose} className="relative h-14 rounded-xl overflow-hidden group block shadow-sm">
                    <Image src="/myob.png" alt="Make Your Own Brand" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                      <span className="text-white text-xs font-bold text-center leading-tight">Make Your<br/>Own Brand</span>
                    </div>
                  </LocalizedClientLink>
                </div>
              </div>

              <hr className="border-gray-100 my-1" />

              <LocalizedClientLink href="/store?category=new-arrivals" onClick={onClose} className="flex justify-between items-center text-[#ef7044] font-medium text-[13px] uppercase tracking-wide group mb-2">
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
                  {[
                    { label: "Bikini", handle: "bikinis" },
                    { label: "Swimsuit", handle: "swimsuit" },
                    { label: "Resort Wear", handle: "resort-wear" },
                    { label: "Men's Wear", handle: "mens-wear" },
                    { label: "Accesories", handle: "accesories" }
                  ].map(item => (
                    <LocalizedClientLink key={item.handle} href={`/store?category=${item.handle}`} onClick={onClose} className="text-[13px] text-gray-900 font-medium hover:text-[#ef7044] transition-colors">{item.label}</LocalizedClientLink>
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
                  {[
                    { label: "Best Seller", handle: "best-seller" },
                    { label: "New Arrivals", handle: "new-arrivals" },
                    { label: "Signature", handle: "signature" },
                    { label: "Island Escape", handle: "island-escape" }
                  ].map(item => (
                    <LocalizedClientLink key={item.handle} href={`/collections/${item.handle}`} onClick={onClose} className="text-[13px] text-gray-900 font-medium hover:text-[#ef7044] transition-colors">{item.label}</LocalizedClientLink>
                  ))}
                </div>
              </div>

              {/* MENU LINKS BAWAH */}
              <div className="flex flex-col gap-5 mt-2">
                {[
                  { label: "MAKE YOUR OWN BRAND", link: "/make-your-own-brand" },
                  { label: "OUR STORE", link: "/our-store" },
                  { label: "ABOUT US", link: "/about" },
                  { label: "CONTACT US", link: "/contact" }
                ].map(item => (
                  <LocalizedClientLink key={item.label} href={item.link} onClick={onClose} className="block text-[#ef7044] font-medium text-[13px] uppercase tracking-wide group">
                    {item.label}
                  </LocalizedClientLink>
                ))}
              </div>

            </div>
          ) : (
            /* --- TAB: SEARCH & REKOMENDASI --- */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative mb-10 flex-shrink-0">
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
                               <Image src={product.thumbnail || "/placeholder.png"} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#ef7044] transition-colors line-clamp-1">{product.title}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#ef7044] transition-colors flex-shrink-0" />
                          </LocalizedClientLink>
                        ))}
                      </div>
                    </div>
                  )}

                  {bestSellers.length === 0 && newArrivals.length === 0 && (
                    <div className="text-center py-10 text-gray-400 italic text-sm">
                      Mulai mengetik untuk mencari produk...
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER DRAWER */}
        <div className="p-8 bg-gray-50 mt-auto border-t border-gray-100 flex-shrink-0 absolute bottom-0 left-0 w-full z-10">
          <p className="text-[10px] text-gray-400 text-center italic">© 2026 Niconico Resort. Crafted for your island escape.</p>
        </div>
      </div>
    </>
  );
}