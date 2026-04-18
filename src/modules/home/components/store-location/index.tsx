"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

// Struktur tipe data dari backend Medusa
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

export default function StoreSection() {
  const [stores, setStores] = useState<Store[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fungsi Fetching Data API (Endpoint Anti-CORS)
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Nembak ke API publik Medusa anti-CORS
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store-location`); 
        
        if (!response.ok) throw new Error("Gagal ambil data API");
        
        const data = await response.json();
        
        // Pakai kunci data yang benar dari backend
        if (data.store_locations) setStores(data.store_locations);
        if (data.count) setTotalStores(data.count); 

      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Tampilan Skeleton saat loading
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

  // Jika tidak ada data dari backend, return null biar section tidak kosong melompong
  if (stores.length === 0) return null;

  return (
    // Spasi Section Pas: pt-16 (padding-top) & pb-12 (padding-bottom)
    <section className="pt-16 pb-12 bg-white w-full">
      <div className="max-w-[1200px] mx-auto md:max-w-6xl w-full">
        
        {/* JUDUL */}
        <h2 className="text-3xl font-bold text-[#ED5725] mb-8 px-4 md:px-0 uppercase">
          Visit Our Store
        </h2>

        {/* CAROUSEL CONTAINER */}
        <div className="flex overflow-x-auto gap-6 px-4 md:px-0 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* LOOPING KARTU STORE DARI BACKEND */}
          {stores.map((store) => (
            <div 
              key={store.id} 
              className="snap-start shrink-0 w-[340px] md:w-[380px] bg-[#f8f8f8] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col transition-all duration-300"
            >
              {/* Nama & Alamat */}
              <div className="flex justify-between items-start gap-3 mb-4 h-10">
                <h3 className="text-xl md:text-2xl font-black text-[#ED5725] tracking-wide uppercase shrink-0">
                  {store.name}
                </h3>
                <p className="text-[11px] md:text-xs text-gray-700 text-right leading-snug line-clamp-2 font-medium">
                  {store.address}
                </p>
              </div>

              {/* Grid 3 Foto */}
              <div className="grid grid-cols-2 gap-2 mb-2"> 
                {/* Gambar Utama (Kiri) - Persegi */}
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
                  {store.image_main && <img src={store.image_main} alt={store.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                </div>
                {/* Gambar Sub (Kanan) */}
                <div className="grid grid-rows-2 gap-2 aspect-square"> 
                  <div className="w-full h-full overflow-hidden rounded-xl bg-gray-200">
                    {store.image_sub1 && <img src={store.image_sub1} alt={`${store.name} view 2`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-xl bg-gray-200">
                    {store.image_sub2 && <img src={store.image_sub2} alt={`${store.name} view 3`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                  </div>
                </div>
              </div>

              {/* Tombol Action - Bernapas: Ganti mt-auto dengan mt-6 */}
              <div className="grid grid-cols-2 gap-3 mt-6"> 
                <a 
                  href={store.maps_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full border-2 border-[#ED5725] text-[#ED5725] py-2.5 rounded-full text-center font-bold text-sm hover:bg-[#ED5725] hover:text-white transition-colors duration-300"
                >
                  Direction
                </a>
                <a 
                  href={store.wa_link?.startsWith('http') ? store.wa_link : `https://wa.me/${store.wa_link}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#ED5725] border-2 border-[#ED5725] text-white py-2.5 rounded-full text-center font-bold text-sm hover:bg-[#d64a1d] hover:border-[#d64a1d] transition-colors duration-300 shadow-md shadow-orange-500/20"
                >
                  Call
                </a>
              </div>
            </div>
          ))}

          {/* KARTU VIEW ALL (Card Ke-4) */}
          <a 
            href="/stores" 
            className="snap-start shrink-0 w-[340px] md:w-[380px] bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-2 border-dashed border-gray-200 hover:border-[#ED5725] hover:bg-orange-50/50 flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#ED5725] group-hover:scale-110 transition-all duration-300 shadow-sm">
              <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-[#ED5725] transition-colors duration-300">
              View All Stores
            </span>
            <span className="text-sm text-gray-500 font-medium mt-2">
              Explore all locations
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}