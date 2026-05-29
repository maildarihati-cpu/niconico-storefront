"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string;
  image_main: string;
  image_sub1: string;
  image_sub2: string;
  maps_link: string;
  wa_link: string;
}

interface StoreSectionProps {
  layout?: "slider" | "grid";
}

export default function StoreSection({ layout = "slider" }: StoreSectionProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store-location`);
        if (!response.ok) throw new Error("API Connection Failed");
        const data = await response.json();
        if (data.store_locations) setStores(data.store_locations);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading) return <div className="h-[500px] w-full animate-pulse bg-gray-50" />;
  if (stores.length === 0) return null;

  // ==========================================
  // 1. GRID LAYOUT (Untuk halaman /our-store)
  // ==========================================
  if (layout === "grid") {
    return (
      <div className="flex flex-col gap-24 w-full">
        {stores.map((store, index) => (
          <article key={store.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start group">
            {/* 60% Kiri: Main Image */}
            <div className="lg:col-span-7 relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] overflow-hidden bg-gray-50">
              {store.image_main && (
                <Image
                  src={store.image_main}
                  alt={store.name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  priority={index === 0}
                />
              )}
            </div>

            {/* 40% Kanan: Text & Sub-images */}
            <div className="lg:col-span-5 flex flex-col h-full justify-between pt-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-light text-black mb-6 uppercase tracking-[0.15em]">
                  {store.name}
                </h2>
                <div className="flex items-start gap-3 text-sm text-gray-500 font-light leading-relaxed mb-8">
                  <MapPin className="w-5 h-5 text-[#ED5725] shrink-0 mt-0.5" />
                  <p className="max-w-sm">{store.address}</p>
                </div>
                {store.maps_link && (
                  <a href={store.maps_link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs uppercase tracking-widest text-black border-b border-black pb-1 hover:text-[#ED5725] hover:border-[#ED5725] transition-colors duration-300">
                    Get Directions
                  </a>
                )}
              </div>

              {/* Sub-images Grid (Mengikuti image_sub1 & image_sub2) */}
              <div className="grid grid-cols-2 gap-4 mt-12 lg:mt-24">
                {store.image_sub1 && (
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image src={store.image_sub1} alt={`${store.name} detail`} fill className="object-cover transition-opacity duration-500 hover:opacity-80" />
                  </div>
                )}
                {store.image_sub2 && (
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image src={store.image_sub2} alt={`${store.name} detail`} fill className="object-cover transition-opacity duration-500 hover:opacity-80" />
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  // ==========================================
  // 2. SLIDER LAYOUT (Untuk Homepage - Default)
  // ==========================================
  return (
    <section className="py-24 bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl font-light text-black uppercase tracking-[0.2em]">
            Our Locations
          </h2>
          <div className="w-12 h-[1px] bg-[#ED5725] mt-6" />
        </div>

        {/* Carousel Container */}
        <div className="flex overflow-x-auto gap-8 pb-12 snap-x snap-mandatory scrollbar-hide">
          
          {stores.map((store) => (
            <div key={store.id} className="snap-start shrink-0 w-[320px] md:w-[400px] group cursor-pointer">
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-2 aspect-[4/5] mb-6">
                <div className="relative overflow-hidden bg-gray-100">
                  {store.image_main && <Image src={store.image_main} alt={store.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <div className="grid grid-rows-2 gap-2">
                  <div className="relative overflow-hidden bg-gray-100">
                    {store.image_sub1 && <Image src={store.image_sub1} alt={store.name} fill className="object-cover" />}
                  </div>
                  <div className="relative overflow-hidden bg-gray-100">
                    {store.image_sub2 && <Image src={store.image_sub2} alt={store.name} fill className="object-cover" />}
                  </div>
                </div>
              </div>

              {/* Text Info */}
              <h3 className="text-xl font-light text-black mb-2 uppercase tracking-wide">{store.name}</h3>
              <p className="text-sm text-gray-500 font-light mb-6 leading-relaxed line-clamp-2">{store.address}</p>
              
              <a href={store.maps_link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs uppercase tracking-widest text-[#ED5725] border-b border-[#ED5725] pb-1 hover:opacity-70 transition-opacity">
                Get Directions
              </a>
            </div>
          ))}

          {/* View All */}
          <a href="/id/our-store" className="snap-start shrink-0 w-[200px] flex flex-col items-center justify-center border border-gray-200 hover:border-black transition-colors duration-500 group">
            <ArrowRight className="w-6 h-6 mb-4 text-gray-400 group-hover:text-black transition-colors duration-500" />
            <span className="text-sm text-gray-500 group-hover:text-black uppercase tracking-widest transition-colors duration-500">View All</span>
          </a>

        </div>
      </div>
    </section>
  );
}