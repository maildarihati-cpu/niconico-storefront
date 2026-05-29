import { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Locations | Niconico Resort",
  description: "Visit our Niconico Resort flagship locations and experience quiet luxury.",
};

// Struktur Data Store sesuai API Medusa v2
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

// Data Fetching di Server Side (SEO Friendly, No Loading Pulse)
async function getStores(): Promise<Store[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store-location`, {
      // Revalidasi setiap 60 detik (ISR) agar ringan tapi tetap update
      next: { revalidate: 60 } 
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.store_locations || [];
  } catch (error) {
    console.error("Failed to fetch stores on server:", error);
    return [];
  }
}

export default async function OurStorePage() {
  const stores = await getStores();

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
        
        {/* ========================================== */}
        {/* VERTICAL SCROLL LAYOUT (Grid 60/40) */}
        {/* ========================================== */}
        <div className="flex flex-col gap-24 w-full">
          {stores.map((store, index) => (
            <article key={store.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start group">
              
              {/* KIRI 60%: Main Image */}
              <div className="lg:col-span-7 relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] overflow-hidden bg-gray-50">
                {store.image_main && (
                  <Image
                    src={store.image_main}
                    alt={store.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    priority={index === 0} // Prioritaskan gambar pertama untuk LCP (Largest Contentful Paint)
                  />
                )}
              </div>

              {/* KANAN 40%: Text & Sub-images */}
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
                    <a 
                      href={store.maps_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block text-xs uppercase tracking-widest text-black border-b border-black pb-1 hover:text-[#ED5725] hover:border-[#ED5725] transition-colors duration-300"
                    >
                      Get Directions
                    </a>
                  )}
                </div>

                {/* Sub-images Stack (Tampil jika data ada) */}
                <div className="grid grid-cols-2 gap-4 mt-12 lg:mt-24">
                  {store.image_sub1 && (
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Image src={store.image_sub1} alt={`${store.name} interior view 1`} fill className="object-cover transition-opacity duration-500 hover:opacity-80" />
                    </div>
                  )}
                  {store.image_sub2 && (
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Image src={store.image_sub2} alt={`${store.name} interior view 2`} fill className="object-cover transition-opacity duration-500 hover:opacity-80" />
                    </div>
                  )}
                </div>
              </div>
              
            </article>
          ))}
          
          {/* Kondisi jika data kosong dari API */}
          {stores.length === 0 && (
            <div className="text-center text-gray-400 font-light py-20 uppercase tracking-widest">
              Locations updating soon.
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}