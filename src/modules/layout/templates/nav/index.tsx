"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation"; 
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import CartPreview from "@modules/cart/templates/preview"
import { useCart } from "@/context/cart-context";

import ProfileContent from "../../components/profile-drawer/ProfileContent";
import NavDrawer from "../../components/nav-drawer/NavDrawer"; 
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [navView, setNavView] = useState<"menu" | "search">("menu");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState<any>("menu");
  
  // 🌟 SENSOR 1: Deteksi apakah layar sudah di-scroll melewati area Hero
  const [isPastHero, setIsPastHero] = useState(false);
  
  const pathname = usePathname(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { cart, cartCount, isCartBouncing, showPreview } = useCart();

  // Listener URL Flag
  useEffect(() => {
    const authFlag = searchParams?.get("auth");
    if (authFlag === "login") {
      setProfileView("login"); 
      setIsProfileOpen(true); 
      router.replace(pathname || "/", { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // 🌟 SENSOR SCROLL HERO: Aktif kalau kustomer scroll ke bawah
  useEffect(() => {
    const handleScroll = () => {
      // Kita set batas 500px (Kira-kira seukuran Hero Image HP)
      if (window.scrollY > 500) {
        setIsPastHero(true);
      } else {
        setIsPastHero(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Tembak sekali saat web pertama kali dibuka
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🌟 SENSOR 2: Apakah ada Drawer yang sedang terbuka?
  const isDrawerOpen = isNavOpen || isProfileOpen;

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
        <div className="flex items-center gap-4 -ml-1">
          <button onClick={() => { setNavView("menu"); setIsNavOpen(true); }} className="p-1 hover:opacity-70 transition-opacity">
            <Menu className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
          <button onClick={() => { setNavView("search"); setIsNavOpen(true); }} className="p-1 hover:opacity-70 transition-opacity">
            <Search className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
        
        <Link href="/" className="relative flex items-center justify-center w-28 h-8 md:w-36 md:h-10 hover:scale-105 transition-transform">
          <Image src={logoSrc} alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

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

      {/* FLOATING BUTTONS (WhatsApp & Shop Now) */}
      {/* Tombol hanya muncul jika TIDAK ada drawer yang terbuka */}
      {!isDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
          
          {/* SHOP NOW BUTTON */}
          <div className={`transition-all duration-500 ${!isPastHero ? "translate-y-10 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto" : "translate-y-0 opacity-100 pointer-events-auto"}`}>
            <LocalizedClientLink 
              href="/store"
              className="bg-[#EF7044] text-white px-5 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-[0_10px_30px_rgba(239,112,68,0.3)] hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </LocalizedClientLink>
          </div>

          {/* WHATSAPP BUTTON */}
          <a 
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:scale-110 transition-transform flex items-center justify-center"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
        </div>
      )}

      {/* Profile Drawer */}
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

      <NavDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} view={navView} setView={setNavView} />
    </>
  );
};

export default Navbar;