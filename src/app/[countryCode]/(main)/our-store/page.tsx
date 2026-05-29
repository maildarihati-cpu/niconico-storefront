import { Metadata } from "next";

// PASTIKAN PATH IMPORT INI SESUAI DENGAN LOKASI FILE STORESECTION BOS
import StoreSection from "@modules/home/components/store-location"; 

export const metadata: Metadata = {
  title: "Our Stores | Niconico Resort",
  description: "Visit our Niconico Resort flagship locations and experience quiet luxury.",
};

export default function OurStorePage() {
  return (
    // Wrapper utama dengan padding top (pt-32/40) agar tidak tertutup navbar
    <main className="bg-white min-h-screen pt-32 lg:pt-40 pb-24 w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-0">
        
        {/* Page Header */}
        <div className="mb-8 border-b border-gray-100 pb-8 px-4 md:px-0">
          <h1 className="text-3xl md:text-4xl font-bold text-[#ED5725] uppercase tracking-wide">
            Our Stores
          </h1>
          <p className="mt-4 text-gray-500 text-sm md:text-base max-w-xl">
            Discover the physical extensions of the Niconico Resort experience. 
            Find our exclusive boutiques, explore our spaces, and plan your visit.
          </p>
        </div>
        
        {/* MEMANGGIL KOMPONEN UTAMA */}
        {/* layout="grid" akan memaksa Card yang Bos desain tadi untuk melipat ke bawah (scroll vertikal) */}
        <StoreSection layout="grid" />
        
      </div>
    </main>
  );
}