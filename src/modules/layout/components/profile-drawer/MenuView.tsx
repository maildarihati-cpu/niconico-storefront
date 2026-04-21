"use client";

import React from "react";
import { X, User } from "lucide-react";

interface Props {
  onClose: () => void;
  setView: (view: any) => void;
  customer: any; // Tambahkan props customer di sini
}

export default function MenuView({ onClose, setView, customer }: Props) {
  
  const handleProfileClick = () => {
    if (customer) {
      // Kalau sudah login, arahkan ke ProfileView
      setView("profile");
    } else {
      // Kalau belum, baru ke LoginView
      setView("login");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <span className="font-bold uppercase tracking-widest text-sm">Menu</span>
        <X onClick={onClose} className="w-6 h-6 cursor-pointer text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Tombol My Profile yang sekarang sudah pintar */}
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-4 w-full text-left group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#EF7044] transition-colors">
            <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">My Profile</p>
            <p className="text-[11px] text-gray-400">
              {customer ? `Logged in as ${customer.first_name}` : "Login or Register"}
            </p>
          </div>
        </button>

        {/* Menu lainnya... */}
      </div>
    </div>
  );
}