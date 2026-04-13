"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import Image from "next/image";


interface Props {
  onClose: () => void;
  // Tambahkan | "profile" di dalam setView supaya TypeScript nggak ngamuk
  setView: (view: "menu" | "login" | "signup" | "profile") => void; 
}

export default function MenuView({ onClose, setView }: Props) {
  const router = useRouter();

  // Variabel penentu kustomer udah login atau belum
  const isLoggedIn = false; // Set true untuk ngetes tampilan profil

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setView("profile"); // Sekarang dia ganti view ke profil di dalam laci
    } else {
      setView("login");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* --- BAGIAN ATAS (MENU PUTIH) --- */}
      <div className="bg-white pt-10 pb-8 px-8">
        
        {/* Header: Account Details */}
        <div className="flex justify-between items-center mb-12">
          {/* Tambahan garis bawah (underline) persis kayak di gambar bos */}
          <h2 className="text-[#ED5725] text-[17px] font-small underline underline-offset-8 decoration-1">
            Account Details
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-black" strokeWidth={1.5} />
          </button>
        </div>

        {/* List Menu (Jarak / gap diperbesar jadi lebih lega) */}
        <div className="flex flex-col gap-8">
          
          <button onClick={handleProfileClick} className="flex justify-between items-center group w-full">
            <span className="text-[#ED5725] font-medium text-[17px] group-hover:text-black transition-colors">My Profile</span>
            <ChevronRight className="w-5 h-5 text-[#ED5725] group-hover:text-black transition-colors" strokeWidth={1.5} />
          </button>

          <Link href="/account/orders" onClick={onClose} className="flex justify-between items-center group w-full">
            <span className="text-[#ED5725] font-medium text-[17px] group-hover:text-black transition-colors">Order</span>
            <ChevronRight className="w-5 h-5 text-[#ED5725] group-hover:text-black transition-colors" strokeWidth={1.5} />
          </Link>
          
          <Link href="/cart" onClick={onClose} className="flex justify-between items-center group w-full">
            <span className="text-[#ED5725] font-medium text-[17px] group-hover:text-black transition-colors">Cart</span>
            <ChevronRight className="w-5 h-5 text-[#ED5725] group-hover:text-black transition-colors" strokeWidth={1.5} />
          </Link>
          
          <Link href="/wishlist" onClick={onClose} className="flex justify-between items-center group w-full">
            <span className="text-[#ED5725] font-medium text-[17px] group-hover:text-black transition-colors">Wishlist</span>
            <ChevronRight className="w-5 h-5 text-[#ED5725] group-hover:text-black transition-colors" strokeWidth={1.5} />
          </Link>
          
          <Link href="/faq" onClick={onClose} className="flex justify-between items-center group w-full">
            <span className="text-[#ED5725] font-medium text-[17px] group-hover:text-black transition-colors">FAQ</span>
            <ChevronRight className="w-5 h-5 text-[#ED5725] group-hover:text-black transition-colors" strokeWidth={1.5} />
          </Link>

        </div>
      </div>

      {/* --- BAGIAN BAWAH (ORANGE AREA) --- */}
      <div className="flex-1 bg-[#EF7044] flex flex-col items-center justify-center relative p-6">
        
        {/* LOGO AREA */}
        <div className="text-white text-center flex flex-col items-center opacity-90 hover:scale-105 transition-transform duration-300">
          
          <Image 
            src="/logo-niconico-white.png" 
            alt="Niconico" 
            width={140} 
            height={140} // Kasih angka yang sama dulu nggak apa-apa
            className="object-contain w-auto h-auto" // Pakai Tailwind buat paksa auto
            priority // Tambahin ini biar logonya di-load duluan (penting buat branding)
/>
        </div>

        

      </div>
    </div>
  );
}