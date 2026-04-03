import Image from "next/image";

export default function InstagramFeed() {
  return (
    <section className="py-12 px-4 md:px-8 max-w-[1000px] mx-auto bg-white">
      
      {/* HEADER TITLE */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#ED5725]">
          #niconiconfidence
        </h2>
      </div>

      {/* BINGKAI ORANYE TIPIS (Container Utama) */}
      <div className="p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_20px_rgba(237,87,37,0.15)] bg-white mb-4">
        
        {/* --- BARIS ATAS --- */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-2 md:mb-4">
          <a href="#" className="col-span-2 relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group block shadow-sm">
            <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop" alt="UGC 1" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </a>
          <a href="#" className="col-span-2 relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group block shadow-sm">
            <img src="https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=600&auto=format&fit=crop" alt="UGC 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </a>
          <div className="col-span-1 flex flex-col gap-2 md:gap-4">
            <a href="#" className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden group block shadow-sm">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop" alt="UGC 3" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
            <a href="#" className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden group block shadow-sm">
              <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600&auto=format&fit=crop" alt="UGC 4" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
          </div>
        </div>

        {/* --- BARIS BAWAH --- */}
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          <a href="#" className="col-span-2 relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group block shadow-sm">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop" alt="UGC 5" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </a>
          <div className="col-span-1 flex flex-col gap-2 md:gap-4">
            <a href="#" className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden group block shadow-sm">
              <img src="https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=600&auto=format&fit=crop" alt="UGC 6" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
            <a href="#" className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden group block shadow-sm">
              <img src="https://images.unsplash.com/photo-1602498456745-e9503b30470b?q=80&w=600&auto=format&fit=crop" alt="UGC 7" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
          </div>
          <a href="#" className="col-span-2 relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group block shadow-sm">
            <img src="https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=600&auto=format&fit=crop" alt="UGC 8" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </a>
        </div>
      </div>

      {/* FOOTER TEXT & SOCIAL ICONS (Diperbaiki: Teks di atas, Ikon mengecil, Rata Kanan semua) */}
      <div className="flex flex-col items-end mt-4 pr-2 md:pr-4">
        
        <p className="text-xs md:text-sm font-medium text-gray-800 text-right mb-3">
          Share your confidence moment with niconico resort
        </p>
        
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {/* Facebook */}
          <a href="#" className="hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          
          {/* Instagram */}
          <a href="#" className="hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.98a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a href="#" className="hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-2.03 1.73-4.8 2.45-7.4 1.94-2.58-.51-4.87-2.18-5.96-4.55-1.03-2.22-1.05-4.9-.04-7.14 1.05-2.31 3.23-4.05 5.76-4.57 1.34-.28 2.73-.24 4.05.08v4.06c-1.15-.31-2.4-.23-3.48.24-1.05.46-1.9 1.3-2.27 2.37-.36 1.03-.27 2.24.23 3.19.49.91 1.41 1.58 2.44 1.8.98.21 2.04.14 2.94-.3 1.05-.51 1.83-1.44 2.15-2.56.24-.86.24-1.78.25-2.67.01-6.45.01-12.91.02-19.36z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a href="#" className="hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      </div>

    </section>
  );
}