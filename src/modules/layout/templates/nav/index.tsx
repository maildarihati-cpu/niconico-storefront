"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation"; 
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import CartPreview from "@modules/cart/templates/preview";
import { useCart } from "@/context/cart-context";

import ProfileContent from "../../components/profile-drawer/ProfileContent";
import NavDrawer from "../../components/nav-drawer/NavDrawer"; 
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [navView, setNavView] = useState<"menu" | "search">("menu");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState<any>("menu");
  
  const pathname = usePathname(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { cart, cartCount, isCartBouncing, showPreview } = useCart();

  // 🌟 Listener URL Flag untuk otomatis buka Profile Drawer setelah login
  useEffect(() => {
    const authFlag = searchParams?.get("auth");
    if (authFlag === "login") {
      setProfileView("login"); 
      setIsProfileOpen(true); 
      router.replace(pathname || "/", { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // 🌟 Halaman Cart: Navbar atas di-hide, tapi Drawer Profile tetap berfungsi (z-index disesuaikan)
  if (pathname?.includes("/cart")) {
    return (
      <>
        {isProfileOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity" onClick={() => setIsProfileOpen(false)} />
        )}
        <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 overflow-hidden ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <ProfileContent 
            view={profileView} 
            setView={setProfileView} 
            onClose={() => setIsProfileOpen(false)} 
          />
        </div>
      </>
    );
  }

  // 🌟 Logika Warna Navbar: Transparan vs Orange
  const isOrangeNav = 
    pathname?.includes("/store") || 
    pathname?.includes("/products") || 
    pathname?.includes("/collections");

  const navBgClass = isOrangeNav 
    ? "bg-[#EF7044]/85 backdrop-blur-md border-[#EF7044]/10" 
    : "bg-white/40 backdrop-blur-md border-gray-100/50";     

  const iconColorClass = isOrangeNav ? "text-white" : "text-gray-800";
  const logoSrc = isOrangeNav ? "/logo-niconico-white.png" : "/logo-niconico-black.png";

  return (
    <>
      <nav className={`fixed top-5 left-5 right-5 z-40 flex items-center justify-between px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${navBgClass}`}>
        
        {/* Kiri: Menu & Search */}
        <div className="flex items-center gap-4 -ml-1">
          <button onClick={() => { setNavView("menu"); setIsNavOpen(true); }} className="p-1 hover:opacity-70 transition-opacity">
            <Menu className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
          <button onClick={() => { setNavView("search"); setIsNavOpen(true); }} className="p-1 hover:opacity-70 transition-opacity">
            <Search className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
        
        {/* Tengah: Logo */}
        <Link href="/" className="relative flex items-center justify-center w-28 h-8 md:w-36 md:h-10 hover:scale-105 transition-transform">
          <Image src={logoSrc} alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

        {/* Kanan: Cart & Profile */}
        <div className="flex gap-4 items-center -mr-1">
          <div className="relative group">
            <LocalizedClientLink href="/cart" className="p-1 block">
              <ShoppingBag className={`w-5 h-5 transition-all duration-300 ${isCartBouncing ? (isOrangeNav ? "scale-125 text-white" : "scale-125 text-[#ED5725]") : iconColorClass}`} />
            </LocalizedClientLink>

            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 ${isOrangeNav ? "bg-white text-[#EF7044]" : "bg-[#ED5725] text-white"}`}>
                {cartCount}
              </span>
            )}

            {/* Cart Dropdown Preview */}
            {showPreview && cartCount > 0 && cart && (
              <div className="absolute top-12 -right-2 z-50 w-[300px] md:w-[400px] animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[24px] border border-gray-100 overflow-hidden">
                  <CartPreview cart={cart} />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setProfileView("menu"); setIsProfileOpen(true); }} 
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <User className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
      </nav>

      {/* 🌟 Profile Drawer (z-60 akan menutupi Navbar dan Floating Buttons yang z-40) */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsProfileOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 overflow-hidden ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <ProfileContent 
          view={profileView} 
          setView={setProfileView} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </div>

      {/* 🌟 Navigasi Drawer */}
      <NavDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} view={navView} setView={setNavView} />
    </>
  );
};

export default Navbar;