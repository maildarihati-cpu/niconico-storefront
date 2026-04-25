"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ChevronLeft, Loader2, LogOut, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile" | "address" | "reset-password") => void;
  customer: any; 
  onSuccess?: () => Promise<void>; // Tambahin ini biar bisa lapor ke induk
}

export default function ProfileView({ onClose, setView, customer, onSuccess }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const token = getCookie('_medusa_jwt');

      const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Update failed" }));
        throw new Error(err.message || "Update failed");
      }

      // JURUS ANTI CACHE & ANTI RELOAD
      setShowSuccess(true);
      
      // 1. Lapor ke induk buat download data terbaru secara diam-diam (tanpa reload)
      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setIsEditOpen(false); // Balik ke halaman ProfileView (kartu detail)
        router.refresh(); // Beresin cache server-side Next.js
      }, 2000);

    } catch (error: any) {
      console.error("💥 Error Update:", error);
      setErrorMessage(error.message || "Gagal simpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    document.cookie = "_medusa_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await fetch(`${BACKEND_URL}/store/auth`, { method: "DELETE" }).catch(() => null);
    window.location.reload(); 
  };

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const defaultAddress = customer?.addresses?.[0];

  if (!customer) return null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col font-sans antialiased">
      
      {/* --- VIEW UTAMA PROFILE --- */}
      <div className="flex flex-col h-full px-6 pt-8 pb-6 overflow-y-auto scrollbar-hide">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setView("menu")} className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#ef7044] border border-gray-100 rounded-full transition-all group">
            <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#ef7044]" />
          </button>
          
          <div className="relative w-32 h-10">
            <Image src="/logo-niconico-black.png" alt="niconico" fill className="object-contain" priority />
          </div>

          <button onClick={onClose} className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#ef7044] border border-gray-100 rounded-full transition-all group">
            <X className="w-4 h-4 text-gray-500 group-hover:text-[#ef7044]" />
          </button>
        </div>

        {/* ACCOUNT DETAILS CARD */}
        <div className="mb-6">
          <h2 className="text-[#ef7044] text-base font-medium mb-3">Account Details</h2>
          
          <div className="border border-gray-100 rounded-[24px] p-6 shadow-sm bg-white space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                <p className="text-[9px] text-gray-400 italic mb-0.5 uppercase tracking-wider">Name</p>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{customer.first_name} {customer.last_name}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 italic mb-0.5 uppercase tracking-wider">Phone</p>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{customer.phone || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-[9px] text-gray-400 italic mb-0.5 uppercase tracking-wider">E-Mail Address</p>
              <p className="text-xs font-semibold text-gray-900 leading-tight">{customer.email}</p>
            </div>

            {/* KOLOM ALAMAT */}
            <div className="pt-1 border-t border-gray-50 mt-2">
              <p className="text-[9px] text-gray-400 italic mb-1 uppercase tracking-wider">Primary Address</p>
              {defaultAddress ? (
                <p className="text-[10px] text-gray-700 leading-relaxed font-medium">
                  {defaultAddress.address_1}, {defaultAddress.city}, {defaultAddress.province}
                </p>
              ) : (
                <p className="text-[10px] text-gray-300 italic">No address saved yet, say.</p>
              )}
            </div>

            {/* BUTTONS INSIDE CARD */}
            <div className="flex flex-row gap-2 pt-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="bg-[#ef7044] text-white text-[8px] font-bold py-2 px-3 flex-1 rounded-lg border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all whitespace-nowrap uppercase tracking-widest"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setView("address")} 
                className="bg-[#ef7044] text-white text-[8px] font-bold py-2 px-3 flex-1 rounded-lg border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all whitespace-nowrap uppercase tracking-widest"
              >
                Address
              </button>
              <button 
                onClick={() => setView("reset-password")}
                className="bg-[#ef7044] text-white text-[8px] font-bold py-2 px-3 flex-1 rounded-lg border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all whitespace-nowrap uppercase tracking-widest"
              >
                Password
              </button>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION BUTTONS */}
        <div className="flex flex-col gap-2.5 mb-10 mt-4">
          {["My Cart", "My Order", "My Wishlist"].map((item, idx) => (
            <button 
              key={item}
              onClick={() => item === "My Cart" && navigateTo("/cart")}
              className={`w-full bg-[#ef7044] text-white py-3 rounded-xl font-bold tracking-wide border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all flex justify-between px-6 items-center ${idx === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm">{item}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-white border border-[#ef7044] text-[#ef7044] py-3 rounded-xl font-bold text-xs hover:bg-[#ef7044] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
            <span className="uppercase tracking-widest">Logout Account</span>
          </button>
        </div>
      </div>

      {/* --- DRAWER EDIT PROFILE --- */}
      <div className={`absolute inset-0 z-[60] bg-white transition-transform duration-500 ease-in-out flex flex-col ${isEditOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="flex justify-between items-center px-6 pt-10 pb-6 border-b border-gray-50">
          <button onClick={() => setIsEditOpen(false)} className="p-2 bg-gray-50 rounded-full border border-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-[#ef7044] text-base font-medium">Edit Your Profile</h2>
          <div className="w-8"></div>
        </div>

        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-10 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
            <p className="text-xs text-gray-400 text-center font-medium">Updated! Data sudah aman di database Medusa, say.</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col px-8 pt-6 pb-10 overflow-y-auto">
            <div className="space-y-6 flex-1">
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-xl flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">First Name</label>
                <input 
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#ef7044] transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#ef7044] transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#ef7044] transition-all"
                />
              </div>

              <div className="opacity-50">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">E-mail (Read Only)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="mt-8 w-full bg-[#ef7044] text-white py-3.5 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}