"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string;
  image_main: string;
  image_sub1: string;
  image_sub2: string;
  maps_link: string;
  wa_link: string;
  is_featured?: boolean;
}

interface StoreSectionProps {
  layout?: "slider" | "grid";
}

export default function StoreSection({ layout = "slider" }: StoreSectionProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store-location`); 
        if (!response.ok) throw new Error("Failed to fetch store locations");
        
        const data = await response.json();
        
        if (data.store_locations) {
          const allStoresFromBackend = data.store_locations;
          
          // 1. Ambil yang featured (maksimal 3)
          const featuredStores = allStoresFromBackend
            .filter((store: Store) => store.is_featured === true)
            .slice(0, 3);
            
          // 2. Ambil sisanya (yang tidak masuk ke featured)
          const otherStores = allStoresFromBackend.filter(
            (store: Store) => !featuredStores.some((featured: Store) => featured.id === store.id)
          );
          
          // 3. Gabungkan: Featured di paling atas/kiri, sisanya mengikuti di belakang
          const finalDisplayStores = [...featuredStores, ...otherStores];

          if (layout === "slider") {
            setStores(featuredStores.length > 0 ? featuredStores : finalDisplayStores.slice(0, 3));
          } else {
            setStores(finalDisplayStores);
          }
        }
        
        if (data.count) setTotalStores(data.count); 

      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [layout]); 

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center bg-white w-full">
        <div className="animate-pulse flex gap-6 overflow-hidden w-full max-w-[1200px] px-4 md:px-0">
           {[1, 2, 3].map((i) => (
             <div key={i} className="shrink-0 w-[340px] md:w-[380px] h-[400px] bg-gray-100 rounded-[24px]"></div>
           ))}
        </div>
      </div>
    );
  }

  if (stores.length === 0) return null;
  
  return (
    <section className="pt-16 pb-12 bg-white w-full">
      <div className="max-w-[1200px] mx-auto md:max-w-6xl w-full">
        
        {/* 🌟 KOMENTAR RUSAK SUDAH DICABUT, COMPILER AMAN */}
        {layout === "slider" && (
          <h2 className="text-3xl font-bold text-[#EF7044] mb-8 px-4 md:px-0">
            Visit Our Store
          </h2>
        )}

        {/* 🌟 PERUBAHAN DESKTOP: Menggunakan md:grid agar desktop jadi grid 3 kolom, mobile tetap flex overflow */}
        <div className={
          layout === "slider" 
            ? "flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 px-4 md:px-0 pb-8 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0"
        }>
          
          {stores.map((store) => (
            <div 
              key={store.id} 
              // 🌟 PERUBAHAN DESKTOP: Menggunakan md:w-full agar card mengikuti lebar grid di desktop
              className={`bg-[#f8f8f8] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg ${
                layout === "slider" ? "snap-start shrink-0 w-[340px] md:w-full" : "w-full"
              }`}
            >
              
              <div className="flex flex-col items-start gap-1 mb-4 min-h-[4rem]">
                {/* 🌟 BERSIH: Tanpa uppercase dan ukuran font proporsional */}
                <h3 className="text-base md:text-lg font-black text-[#EF7044] tracking-wide w-full">
                  {store.name}
                </h3>
                <p className="text-[11px] md:text-xs text-gray-600 text-left leading-relaxed font-medium w-full break-words pr-2">
                  {store.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2"> 
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
                  {store.image_main && <img src={store.image_main} alt={store.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="grid grid-rows-2 gap-2 aspect-square"> 
                  <div className="w-full h-full overflow-hidden rounded-xl bg-gray-200">
                    {store.image_sub1 && <img src={store.image_sub1} alt={`${store.name} view 2`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-xl bg-gray-200">
                    {store.image_sub2 && <img src={store.image_sub2} alt={`${store.name} view 3`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6"> 
                <a 
                  href={store.maps_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full border-2 border-[#EF7044] text-[#EF7044] py-2.5 rounded-full text-center font-bold text-sm hover:bg-[#EF7044] hover:text-white transition-colors duration-300"
                >
                  Direction
                </a>
                <a 
                  href={store.wa_link?.startsWith('http') ? store.wa_link : `https://wa.me/${store.wa_link}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#EF7044] border-2 border-[#EF7044] text-white py-2.5 rounded-full text-center font-bold text-sm hover:bg-[#d65f36] hover:border-[#d65f36] transition-colors duration-300 shadow-md shadow-orange-500/20"
                >
                  Call
                </a>
              </div>
            </div>
          ))}

          {/* 🌟 PERUBAHAN DESKTOP: Menyembunyikan Card View All di Desktop (menggunakan md:hidden) */}
          {layout === "slider" && (
            <a 
              href="/our-store" 
              className="md:hidden snap-start shrink-0 w-[340px] bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-2 border-dashed border-gray-200 hover:border-[#EF7044] hover:bg-orange-50/50 flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#EF7044] group-hover:scale-110 transition-all duration-300 shadow-sm">
                <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xl font-bold text-gray-800 group-hover:text-[#EF7044] transition-colors duration-300">
                View All Stores
              </span>
              <span className="text-sm text-gray-500 font-medium mt-2">
                Explore all locations
              </span>
            </a>
          )}

        </div>

        {/* 🌟 PERUBAHAN DESKTOP: Menambahkan Button View All yang HANYA muncul di Desktop (menggunakan hidden md:flex) */}
        {layout === "slider" && (
          <div className="hidden md:flex justify-center mt-10 w-full">
            <a 
              href="/our-store"
              className="bg-[#EF7044] border-2 border-[#EF7044] text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-white hover:text-[#EF7044] transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg uppercase tracking-wider"
            >
              View All Stores <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

      </div>
    </section>
  );
}