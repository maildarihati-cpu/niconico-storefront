"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import CartPreview from "@modules/cart/templates/preview"
import { useCart } from "@/context/cart-context";

// Import Drawer Kanan (Profile) & Drawer Kiri (Nav/Search)
import ProfileContent from "../../components/profile-drawer/ProfileContent";
import NavDrawer from "../../components/nav-drawer/NavDrawer"; // 👈 Ini import untuk drawer kiri baru
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Navbar = () => {
  // --- STATE BARU UNTUK DRAWER KIRI ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [navView, setNavView] = useState<"menu" | "search">("menu");
  
  // State Profile Drawer (Kanan) tetap aman
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Ambil rute URL saat ini
  const pathname = usePathname(); 
  
  // Ambil data dari Brankas Global
  const { cart, cartCount, isCartBouncing, showPreview } = useCart();

  // ==========================================
  // 1. LOGIC HIDE NAVBAR DI HALAMAN CART
  // ==========================================
  // Kalau URL-nya mengandung "/cart", Navbar akan mengembalikan "null" (menghilang dari layar)
  if (pathname?.includes("/cart")) {
    return null;
  }

  // 2. LOGIC CEK HALAMAN UNTUK WARNA
  const isOrangeNav = pathname?.includes("/store") || pathname?.includes("/products");

  // 3. ATUR KELAS CSS & LOGO DINAMIS
  const navBgClass = isOrangeNav 
    ? "bg-[#EF7044]/85 backdrop-blur-md border-[#EF7044]/10" 
    : "bg-white/40 backdrop-blur-md border-gray-100/50";     

  const iconColorClass = isOrangeNav ? "text-white" : "text-gray-800";
  
  // Logo dinamis: Putih saat nav orange, Hitam saat nav putih
  const logoSrc = isOrangeNav ? "/logo-niconico-white.png" : "/logo-niconico-black.png";

  return (
    <>
      <nav className={`fixed top-5 left-5 right-5 z-40 flex items-center justify-between px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${navBgClass}`}>
        
        {/* ==========================================
            KIRI: HAMBURGER & SEARCH (DIUPDATE)
            ========================================== */}
        <div className="flex items-center gap-4 -ml-1">
          <button 
            onClick={() => { setNavView("menu"); setIsNavOpen(true); }} 
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Menu className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
          <button 
            onClick={() => { setNavView("search"); setIsNavOpen(true); }} 
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Search className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
        
        {/* Tengah: Logo Dinamis */}
        <Link href="/" className="relative flex items-center justify-center w-28 h-8 md:w-36 md:h-10 hover:scale-105 transition-transform">
          <Image src={logoSrc} alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

        {/* Kanan: Cart & Profile */}
        <div className="flex gap-4 items-center -mr-1">
          <div className="relative group">
            <LocalizedClientLink href="/cart" className="p-1 block">
              <ShoppingBag 
                className={`w-5 h-5 transition-all duration-300 ${
                  isCartBouncing 
                    ? (isOrangeNav ? "scale-125 text-white" : "scale-125 text-[#ED5725]") 
                    : iconColorClass
                }`} 
              />
            </LocalizedClientLink>

            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 ${isOrangeNav ? "bg-white text-[#EF7044]" : "bg-[#ED5725] text-white"}`}>
                {cartCount}
              </span>
            )}

            {/* --- CART PREVIEW OTOMATIS --- */}
            {showPreview && cartCount > 0 && cart && (
              <div className="absolute top-12 -right-2 z-50 w-[300px] md:w-[400px] animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[24px] border border-gray-100 overflow-hidden">
                  <CartPreview cart={cart} />
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setIsProfileOpen(true)} className="p-1 hover:opacity-70 transition-opacity">
            <User className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
      </nav>

      {/* --- UI DRAWER (PROFILE KANAN) TETAP SAMA --- */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setIsProfileOpen(false)} 
        />
      )}

      {/* Profile Kanan */}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 overflow-hidden ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <ProfileContent onClose={() => setIsProfileOpen(false)} />
      </div>

      {/* ==========================================
          DRAWER KIRI (MENU & SEARCH BARU)
          ========================================== */}
      <NavDrawer 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
        view={navView} 
        setView={setNavView} 
      />
      
    </>
  );
};

export default Navbar;