"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation"; 
import { Menu, Search, ShoppingBag, User, ChevronDown, X } from "lucide-react";
import CartPreview from "@modules/cart/templates/preview";
import { useCart } from "@/context/cart-context/cart-context";

import ProfileContent from "../../components/profile-drawer/ProfileContent";
import NavDrawer from "../../components/nav-drawer/NavDrawer"; 
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartTemplate from "@modules/cart/templates";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [navView, setNavView] = useState<"menu" | "search">("menu");
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState<any>("menu");
  
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // 🌟 STATE BARU UNTUK LACI KHUSUS SEARCH
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  
  const pathname = usePathname(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { cart, cartCount, isCartBouncing, showPreview } = useCart();

  // Mencegah scroll body saat laci manapun terbuka
  useEffect(() => {
    if (isProfileOpen || isCartDrawerOpen || isSearchDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isProfileOpen, isCartDrawerOpen, isSearchDrawerOpen]);

  useEffect(() => {
    const authFlag = searchParams?.get("auth");
    if (authFlag === "login") {
      setProfileView("login"); 
      setIsProfileOpen(true); 
      router.replace(pathname || "/", { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Handle tutup laci saat ganti route
  useEffect(() => {
    setIsCartDrawerOpen(false);
    setIsProfileOpen(false);
    setIsNavOpen(false);
    setIsSearchDrawerOpen(false); // 🌟 Tutup search kalau pindah halaman
  }, [pathname]);

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

  const desktopLinkClass = `text-[10px] xl:text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 py-2 ${iconColorClass}`;
  const dropdownWrapperClass = "absolute top-full left-1/2 -translate-x-1/2 pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50";
  const dropdownInnerClass = `relative flex flex-row items-center gap-6 px-8 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border ${isOrangeNav ? 'bg-white text-[#EF7044] border-gray-100' : 'bg-[#EF7044] text-white border-[#EF7044]'}`;
  const dropdownArrowClass = `absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent ${isOrangeNav ? 'border-b-white' : 'border-b-[#EF7044]'}`;
  const dropdownItemClass = "whitespace-nowrap text-[12px] font-medium hover:opacity-70 transition-opacity";

  return (
    <>
      <nav className={`fixed top-5 left-5 right-5 z-40 flex items-center justify-between px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${navBgClass}`}>
        
        {/* ========================================= */}
        {/* 📱 KIRI MOBILE: SISA MENU SAJA (Search Pindah Kanan) */}
        {/* ========================================= */}
        <div className="flex lg:hidden items-center gap-4 -ml-1">
          <button onClick={() => { setNavView("menu"); setIsNavOpen(true); }} className="p-1 hover:opacity-70 transition-opacity">
            <Menu className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>
        </div>
        
        <Link href="/" className="hidden lg:flex relative items-center justify-center w-32 h-8 xl:w-36 xl:h-10 hover:scale-105 transition-transform shrink-0">
          <Image src={logoSrc} alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

        <Link href="/" className="lg:hidden relative flex items-center justify-center w-28 h-8 hover:scale-105 transition-transform">
          <Image src={logoSrc} alt="Niconico Logo" fill className="object-contain" priority sizes="150px" />
        </Link>

        <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 flex-1 px-2">
          
          <LocalizedClientLink href="/store" className={desktopLinkClass}>
            NEW ARRIVALS
          </LocalizedClientLink>

          <div className="relative group">
            <div className={desktopLinkClass}>
              SHOPS <ChevronDown className="w-3 h-3 ml-0.5" />
            </div>
            <div className={dropdownWrapperClass}>
              <div className={dropdownInnerClass}>
                <div className={dropdownArrowClass}></div>
                <LocalizedClientLink href="/store?category=bikinis" className={dropdownItemClass}>Bikini</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=swimsuit" className={dropdownItemClass}>Swimsuit</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=resort-wear" className={dropdownItemClass}>Resort Wear</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=mens-wear" className={dropdownItemClass}>Men's Wear</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=accessories" className={dropdownItemClass}>Accessories</LocalizedClientLink>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className={desktopLinkClass}>
              TOP COLLECTION <ChevronDown className="w-3 h-3 ml-0.5" />
            </div>
            <div className={dropdownWrapperClass}>
              <div className={dropdownInnerClass}>
                <div className={dropdownArrowClass}></div>
                <LocalizedClientLink href="/store?category=carvico" className={dropdownItemClass}>Carvico</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=signature" className={dropdownItemClass}>Signature</LocalizedClientLink>
                <LocalizedClientLink href="/store?category=island-escape" className={dropdownItemClass}>Island Escape</LocalizedClientLink>
              </div>
            </div>
          </div>

          <LocalizedClientLink href="/make-your-own-brand" className={desktopLinkClass}>MAKE YOUR OWN BRAND</LocalizedClientLink>
          <LocalizedClientLink href="/our-store" className={desktopLinkClass}>OUR STORE</LocalizedClientLink>
          <LocalizedClientLink href="/about" className={desktopLinkClass}>ABOUT US</LocalizedClientLink>
          <LocalizedClientLink href="/contact" className={desktopLinkClass}>CONTACT US</LocalizedClientLink>
        </div>

        {/* ========================================= */}
        {/* KANAN: Search (Dipindah ke Sini!), Cart & Profile */}
        {/* ========================================= */}
        <div className="flex gap-3 md:gap-4 items-center -mr-1 shrink-0">
          
          {/* 🌟 SEARCH SEKARANG DI KANAN DAN BISA DI-KLIK DI MOBILE MAUPUN DESKTOP */}
          <button onClick={() => setIsSearchDrawerOpen(true)} className="flex p-1 hover:opacity-70 transition-opacity">
            <Search className={`w-5 h-5 transition-colors duration-300 ${iconColorClass}`} />
          </button>

          <div className="relative group">
            <button 
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsCartDrawerOpen(true);
                } else {
                  router.push("/cart");
                }
              }} 
              className="p-1 block"
            >
              <ShoppingBag className={`w-5 h-5 transition-all duration-300 ${isCartBouncing ? (isOrangeNav ? "scale-125 text-white" : "scale-125 text-[#EF7044]") : iconColorClass}`} />
            </button>

            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none ${isOrangeNav ? "bg-white text-[#EF7044]" : "bg-[#EF7044] text-white"}`}>
                {cartCount}
              </span>
            )}

            {showPreview && cartCount > 0 && cart && !isCartDrawerOpen && (
              <div className="hidden lg:block absolute top-12 -right-2 z-50 w-[400px] animate-in fade-in slide-in-from-top-3 duration-300">
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

      {/* ======================================================= */}
      {/* 🌟 LACI SEARCH (Murni Search Saja, Meluncur dari Kanan) */}
      {/* ======================================================= */}
      {isSearchDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity" onClick={() => setIsSearchDrawerOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-[90] shadow-2xl transform transition-transform duration-500 overflow-hidden ${isSearchDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full bg-white">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-[14px] xl:text-[15px] font-black text-[#EF7044] tracking-widest uppercase">Search Niconico</h2>
            <button onClick={() => setIsSearchDrawerOpen(false)} className="p-2 bg-gray-50 hover:bg-orange-50 rounded-full transition-colors group">
              <X className="w-5 h-5 text-gray-500 group-hover:text-[#EF7044]" />
            </button>
          </div>
          
          <div className="p-6">
            <form action={`/id/store`} className="relative w-full" onSubmit={() => setIsSearchDrawerOpen(false)}>
              <input 
                type="text" 
                name="q" 
                placeholder="Search products..." 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all text-[14px] font-medium text-gray-900"
                autoFocus
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button type="submit" className="hidden">Search</button>
            </form>
            
            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                <Link href={`/id/store?q=bikini`} onClick={() => setIsSearchDrawerOpen(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 text-gray-600 hover:text-[#EF7044] text-[11px] font-bold rounded-full transition-colors">Bikini</Link>
                <Link href={`/id/store?q=swimsuit`} onClick={() => setIsSearchDrawerOpen(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 text-gray-600 hover:text-[#EF7044] text-[11px] font-bold rounded-full transition-colors">Swimsuit</Link>
                <Link href={`/id/store?q=resort`} onClick={() => setIsSearchDrawerOpen(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 text-gray-600 hover:text-[#EF7044] text-[11px] font-bold rounded-full transition-colors">Resort Wear</Link>
                <Link href={`/id/store?q=carvico`} onClick={() => setIsSearchDrawerOpen(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 text-gray-600 hover:text-[#EF7044] text-[11px] font-bold rounded-full transition-colors">Carvico</Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================= */}
      {/* 🌟 LACI PROFILE */}
      {/* ======================================================= */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsProfileOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[480px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 overflow-hidden ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <ProfileContent 
          view={profileView} 
          setView={setProfileView} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </div>

      {/* ======================================================= */}
      {/* 🌟 LACI CART KHUSUS DESKTOP */}
      {/* ======================================================= */}
      {isCartDrawerOpen && (
        <div className="hidden lg:block fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity" onClick={() => setIsCartDrawerOpen(false)} />
      )}
      <div className={`hidden lg:block fixed top-0 right-0 h-full w-[480px] bg-white z-[90] shadow-2xl transform transition-transform duration-500 overflow-y-auto scrollbar-hide ${isCartDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
         <CartTemplate cart={cart} />
      </div>

      {/* Laci Navigasi Kiri (Hanya Menu Saja) */}
      <NavDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} view={navView} setView={setNavView} />
    </>
  );
};

export default Navbar;