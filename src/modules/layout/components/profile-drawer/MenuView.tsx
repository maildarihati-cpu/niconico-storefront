"use client";

import React from "react";
import { X, User, Home, ShoppingBag, Heart, Package, Info, Phone } from "lucide-react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
  customer: any; // Menerima data dari ProfileContent
}

export default function MenuView({ onClose, setView, customer }: Props) {
  
  // Logic pindah halaman: kalau sudah login ke Profile, kalau belum ke Login
  const handleProfileClick = () => {
    if (customer) {
      setView("profile");
    } else {
      setView("login");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-8 pb-10 overflow-y-auto scrollbar-hide antialiased">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <span className="font-bold uppercase tracking-[0.2em] text-[11px] text-gray-400">Main Menu</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* USER SECTION (PINTAR) */}
      <div className="mb-10">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-4 w-full text-left p-4 rounded-[24px] border border-gray-100 shadow-sm hover:border-[#EF7044]/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#EF7044] transition-colors shadow-inner">
            <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">
              {customer ? `Hi, ${customer.first_name}!` : "My Profile"}
            </p>
            <p className="text-[11px] text-gray-400">
              {customer ? "Manage your account" : "Login or Register to start"}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#EF7044] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <div className="space-y-2 flex-1">
        <MenuLink href="/" icon={<Home className="w-5 h-5" />} label="Home" onClick={onClose} />
        <MenuLink href="/store" icon={<ShoppingBag className="w-5 h-5" />} label="Shop All Products" onClick={onClose} />
        <MenuLink href="/cart" icon={<Package className="w-5 h-5" />} label="My Shopping Cart" onClick={onClose} />
        
        {/* Garis Pemisah Tipis */}
        <div className="h-[1px] bg-gray-50 my-4 mx-4" />

        <p className="px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Discover</p>
        
        <MenuLink href="/collections/new-arrivals" label="New Arrivals" onClick={onClose} />
        <MenuLink href="/collections/best-seller" label="Best Sellers" onClick={onClose} />
        <MenuLink href="/about" icon={<Info className="w-5 h-5" />} label="Our Story" onClick={onClose} />
        <MenuLink href="/contact" icon={<Phone className="w-5 h-5" />} label="Customer Support" onClick={onClose} />
      </div>

      {/* FOOTER DI DALAM DRAWER */}
      <div className="mt-10 pt-6 border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-[0.3em]">
          niconico resort &copy; 2026
        </p>
      </div>
    </div>
  );
}

// Komponen Kecil buat Link biar rapi
function MenuLink({ href, icon, label, onClick }: { href: string; icon?: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <LocalizedClientLink 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 text-gray-600 hover:text-[#EF7044] transition-all group"
    >
      {icon && <span className="text-gray-400 group-hover:text-[#EF7044] transition-colors">{icon}</span>}
      <span className="text-sm font-bold tracking-wide">{label}</span>
    </LocalizedClientLink>
  );
}