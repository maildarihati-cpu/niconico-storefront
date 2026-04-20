"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import ProfileContent from "../../components/profile-drawer/ProfileContent";
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Ambil data dari Brankas Global
  const { cartCount, isCartBouncing } = useCart();

  return (
    <>
      <nav className="fixed top-5 left-5 right-5 bg-white/40 backdrop-blur-md z-40 flex items-center justify-between px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        
        {/* Kiri: Hamburger & Search */}
        <div className="flex items-center gap-4 -ml-1">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:opacity-70 transition-opacity">
            <Menu className="w-5 h-5 text-gray-800" />
          </button>
          <Link href="/search" className="p-1 hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5 text-gray-800" />
          </Link>
        </div>
        
        {/* Tengah: Logo */}
        <Link href="/" className="relative flex items-center justify-center w-28 h-8 md:w-36 md:h-10 hover:scale-105 transition-transform">
          <Image src="/logo-niconico-black.png" alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

        {/* Kanan: Cart & Profile (Posisi Ditukar) */}
        <div className="flex gap-4 items-center -mr-1">
          {/* Ikon Keranjang dengan Badge & Animasi */}
          <div className="relative">
          {/* Ganti Link biasa dengan LocalizedClientLink */}
          <LocalizedClientLink href="/cart" className="p-1 block">
            <ShoppingBag 
              className={`w-5 h-5 transition-all duration-300 ${
                isCartBouncing ? "scale-125 text-[#ED5725]" : "text-gray-800"
              }`} 
            />
          </LocalizedClientLink>

          {/* Badge jumlah item di keranjang */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ED5725] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              {cartCount}
            </span>
          )}
        </div>
          
          <button onClick={() => setIsProfileOpen(true)} className="p-1 hover:opacity-70 transition-opacity">
            <User className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </nav>

      {/* --- UI DRAWER (MENU & PROFILE) --- */}
      {(isMenuOpen || isProfileOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => { setIsMenuOpen(false); setIsProfileOpen(false); }} />
      )}

      {/* Menu Kiri */}
      <div className={`fixed top-0 left-0 h-full w-[90%] max-w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex justify-between items-center border-b">
          <span className="font-bold uppercase tracking-widest">Menu</span>
          <X onClick={() => setIsMenuOpen(false)} className="w-6 h-6 cursor-pointer" />
        </div>
        <div className="p-6">
           {/* Konten menu bos di sini */}
        </div>
      </div>

      {/* Profile Kanan */}
      {/* Profile Kanan */}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-hidden ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <ProfileContent onClose={() => setIsProfileOpen(false)} />
        
      </div>
    </>
  );
};

export default Navbar;