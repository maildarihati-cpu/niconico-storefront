"use client";

import React, { useState } from "react";
import { X, ChevronLeft, Loader2, LogOut } from "lucide-react";
// Import fungsi signout bawaan kalau ada, kalau nggak kita pakai manual
// import { signOut } from "@modules/account/actions"; 

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
  customer: any; // Menerima data dari ProfileContent
}

export default function ProfileView({ onClose, setView, customer }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // LOGIC LOGOUT (Aman & Bersih)
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Cara 1: Bersihkan cookie manual (seperti kodemu sebelumnya)
    document.cookie = "_medusa_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Cara 2: Tembak endpoint auth delete milik Medusa (opsional, biar server juga tahu)
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    await fetch(`${BACKEND_URL}/store/auth`, { method: "DELETE" }).catch(() => null);

    // Refresh halaman biar seluruh state (termasuk keranjang) bersih
    window.location.reload(); 
  };

  // Kalau aneh-aneh datanya kosong, langsung buang ke login
  if (!customer) {
    setView("login");
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-8 pb-6 overflow-y-auto scrollbar-hide antialiased">
      
      {/* HEADER LACI */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => setView("menu")} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-black text-center flex flex-col items-center mt-2">
          <h1 className="text-2xl font-serif tracking-widest mb-0.5">niconico</h1>
          <p className="text-[9px] tracking-[0.3em] font-light uppercase">resort</p>
        </div>

        <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* DETAIL AKUN */}
      <div className="mb-6">
        <h2 className="text-[#ED5725] text-lg font-medium mb-3">Account Details</h2>
        
        <div className="border border-gray-300 rounded-2xl p-6 shadow-sm bg-white">
          <div className="mb-5">
            <p className="text-[10px] text-gray-400 italic mb-0.5">Name</p>
            <p className="text-sm font-semibold text-gray-900">
              {customer.first_name} {customer.last_name}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-[10px] text-gray-400 italic mb-0.5">Address</p>
            <p className="text-sm font-semibold text-gray-900 leading-relaxed">
              {customer.addresses?.length > 0 
                ? `${customer.addresses[0].address_1}, ${customer.addresses[0].city}` 
                : "No address added yet"}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-[10px] text-gray-400 italic mb-0.5">E-Mail</p>
            <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
          </div>

          <div className="mb-7">
            <p className="text-[10px] text-gray-400 italic mb-0.5">Phone Number</p>
            <p className="text-sm font-semibold text-gray-900">{customer.phone || "-"}</p>
          </div>

          <div className="flex gap-2 justify-between">
            <button className="bg-[#ED5725] text-white text-[10px] font-semibold py-2.5 px-3 flex-1 rounded-lg hover:bg-[#d64a1d] transition-colors">
              Edit Profile
            </button>
            <button className="bg-[#ED5725] text-white text-[10px] font-semibold py-2.5 px-3 flex-1 rounded-lg hover:bg-[#d64a1d] transition-colors">
              Change Address
            </button>
            <button className="bg-[#ED5725] text-white text-[10px] font-semibold py-2.5 px-3 flex-1 rounded-lg hover:bg-[#d64a1d] transition-colors">
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* TOMBOL UTAMA */}
      <div className="flex flex-col gap-3 mb-10 mt-auto">
        <button className="w-full bg-[#E58962] text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#ED5725] transition-colors text-sm">
          My Cart
        </button>
        <button className="w-full bg-[#E58962] text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#ED5725] transition-colors text-sm">
          My Order
        </button>
        <button className="w-full bg-[#E58962] text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#ED5725] transition-colors text-sm">
          My Wishlist
        </button>
      </div>

      {/* TOMBOL LOGOUT */}
      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full border-2 border-[#ED5725] text-[#ED5725] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ED5725] hover:text-white transition-colors flex items-center justify-center gap-2 group"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#ED5725] group-hover:text-white" />
              Processing...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 text-[#ED5725] group-hover:text-white transition-colors" />
              Logout
            </>
          )}
        </button>
      </div>

    </div>
  );
}