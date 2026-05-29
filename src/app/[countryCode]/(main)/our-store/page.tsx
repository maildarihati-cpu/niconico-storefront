import { Metadata } from "next";
// Sesuaikan path import ini dengan lokasi file StoreSection Bos
import StoreSection from "@modules/home/components/store-location"; 

export const metadata: Metadata = {
  title: "Our Locations | Niconico Resort",
  description: "Visit our Niconico Resort flagship locations and experience quiet luxury.",
};

export default function OurStorePage() {
  return (
    // Wrapper utama: min-h-screen dan pt-32/pt-40 untuk memberi ruang bagi transparent/fixed navbar
    <main className="bg-white min-h-screen pt-32 lg:pt-40 pb-24 w-full">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        
        {/* Page Header: Quiet Luxury aesthetic */}
        <div className="mb-16 lg:mb-24 border-b border-gray-100 pb-12">
          <h1 className="text-4xl md:text-5xl font-light text-black tracking-[0.2em] uppercase">
            Sanctuaries
          </h1>
          <div className="w-12 h-[1px] bg-[#ED5725] mt-8 mb-8" />
          <p className="text-gray-500 font-light text-sm md:text-base max-w-xl leading-relaxed">
            Discover the physical extensions of the Niconico Resort experience. 
            Find our exclusive boutiques, explore our spaces, and plan your visit.
          </p>
        </div>
        
        {/* Memanggil komponen StoreSection dan MEMAKSA mode Grid 60/40 */}
        <StoreSection layout="grid" />
        
      </div>
    </main>
  );
}