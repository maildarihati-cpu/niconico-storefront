"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
  customer: any;
}

export default function MenuView({ onClose, setView, customer }: Props) {
  
  // Logic Pintu Masuk: Ke Profile kalau sudah login, ke Login kalau belum
  const handleProfileClick = () => {
    if (customer) {
      setView("profile");
    } else {
      setView("login");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white antialiased overflow-hidden">
      
      {/* --- BAGIAN ATAS (PUTIH) --- */}
      <div className="bg-white px-8 pt-10 pb-12 flex-shrink-0">
        
        {/* Header Drawer */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative">
            <h2 className="text-[#ED5725] text-xl font-medium tracking-wide">Account Details</h2>
            {/* Garis bawah tipis sesuai desain */}
            <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#ED5725]/30"></div>
          </div>
          <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Daftar Menu List */}
        <div className="flex flex-col gap-7">
          
          {/* Menu My Profile (Logic Login/Profile) */}
          <button 
            onClick={handleProfileClick}
            className="flex justify-between items-center w-full group transition-all"
          >
            <span className="text-[#ED5725] text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
              My Profile
            </span>
            <ChevronRight className="w-5 h-5 text-[#ED5725]" />
          </button>

          {/* Menu Order */}
          <LocalizedClientLink 
            href="/account/orders" 
            onClick={onClose}
            className="flex justify-between items-center w-full group transition-all"
          >
            <span className="text-[#ED5725] text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
              Order
            </span>
            <ChevronRight className="w-5 h-5 text-[#ED5725]" />
          </LocalizedClientLink>

          {/* Menu Cart */}
          <LocalizedClientLink 
            href="/cart" 
            onClick={onClose}
            className="flex justify-between items-center w-full group transition-all"
          >
            <span className="text-[#ED5725] text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
              Cart
            </span>
            <ChevronRight className="w-5 h-5 text-[#ED5725]" />
          </LocalizedClientLink>

          {/* Menu Wishlist */}
          <LocalizedClientLink 
            href="/wishlist" 
            onClick={onClose}
            className="flex justify-between items-center w-full group transition-all"
          >
            <span className="text-[#ED5725] text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
              Wishlist
            </span>
            <ChevronRight className="w-5 h-5 text-[#ED5725]" />
          </LocalizedClientLink>

          {/* Menu FAQ */}
          <LocalizedClientLink 
            href="/faq" 
            onClick={onClose}
            className="flex justify-between items-center w-full group transition-all"
          >
            <span className="text-[#ED5725] text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
              FAQ
            </span>
            <ChevronRight className="w-5 h-5 text-[#ED5725]" />
          </LocalizedClientLink>

        </div>
      </div>

      {/* --- BAGIAN BAWAH (ORANGE SOLID) --- */}
      <div className="flex-1 bg-[#EF7044] flex flex-col items-center justify-center p-12 relative overflow-hidden">
        
        {/* Konten Logo Niconico Putih */}
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-2">
            <Image 
              src="/logo-pineapple-white.png" // Pastikan kamu punya file pineapple putih di folder public
              alt="Pineapple Logo" 
              fill 
              className="object-contain"
            />
          </div>
          
          <div className="text-white text-center">
            <h3 className="text-4xl md:text-5xl font-serif tracking-[0.2em] mb-1">niconico</h3>
            <p className="text-xs md:text-sm tracking-[0.4em] font-light uppercase opacity-90">resort</p>
          </div>
        </div>

        {/* Dekorasi tipis agar tidak kaku (Opsional) */}
        <div className="absolute bottom-10 text-white/20 text-[10px] font-bold tracking-[0.5em] uppercase">
          Est. 2026
        </div>
      </div>

    </div>
  );
}