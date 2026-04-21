"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, Loader2, LogOut, CheckCircle2, ChevronRight } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
  customer: any; 
}

export default function ProfileView({ onClose, setView, customer }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // === STATE UNTUK EDIT PROFILE DRAWER ===
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  });

  // 1. LOGIC UPDATE PROFILE (Database Medusa)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const token = getCookie('_medusa_jwt');

      const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
        })
      });

      if (!response.ok) throw new Error("Update failed");

      // Sukses! (Email otomatis dikirim oleh Backend Subscriber kamu)
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditOpen(false);
        window.location.reload(); // Refresh data customer
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("Gagal update profil say.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. LOGIC LOGOUT
  const handleLogout = async () => {
    setIsLoggingOut(true);
    document.cookie = "_medusa_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await fetch(`${BACKEND_URL}/store/auth`, { method: "DELETE" }).catch(() => null);
    window.location.reload(); 
  };

  // 3. NAVIGASI KE PAGE LAIN
  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!customer) return null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col">
      
      {/* --- VIEW UTAMA PROFILE --- */}
      <div className="flex flex-col h-full px-6 pt-8 pb-6 overflow-y-auto scrollbar-hide antialiased">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setView("menu")} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-black text-center flex flex-col items-center mt-2">
            <h1 className="text-2xl font-serif tracking-widest mb-0.5">niconico</h1>
            <p className="text-[9px] tracking-[0.3em] font-light uppercase">resort</p>
          </div>

          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ACCOUNT DETAILS CARD */}
        <div className="mb-6">
          <h2 className="text-[#ED5725] text-lg font-medium mb-4">Account Details</h2>
          
          <div className="border border-gray-200 rounded-[32px] p-7 shadow-sm bg-white space-y-5">
            <div>
              <p className="text-[10px] text-gray-400 italic mb-1">Name</p>
              <p className="text-sm font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 italic mb-1">E-Mail</p>
              <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 italic mb-1">Phone Number</p>
              <p className="text-sm font-semibold text-gray-900">{customer.phone || "-"}</p>
            </div>

            {/* BUTTONS INSIDE CARD */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="bg-[#ED5725] text-white text-[10px] font-bold py-3 px-4 flex-1 rounded-xl hover:bg-[#d64a1d] transition-colors"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => alert("Page ganti alamat sedang disiapkan say!")}
                className="bg-[#ED5725] text-white text-[10px] font-bold py-3 px-4 flex-1 rounded-xl hover:bg-[#d64a1d] transition-colors"
              >
                Change Address
              </button>
              <button 
                className="bg-[#ED5725] text-white text-[10px] font-bold py-3 px-4 flex-1 rounded-xl hover:bg-[#d64a1d] transition-colors opacity-50 cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION BUTTONS */}
        <div className="flex flex-col gap-3 mb-10 mt-6">
          <button onClick={() => navigateTo("/cart")} className="w-full bg-[#E58962] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#ED5725] transition-all flex justify-between px-6 items-center">
            <span>My Cart</span>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>
          <button className="w-full bg-[#E58962] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#ED5725] transition-all flex justify-between px-6 items-center opacity-50 cursor-not-allowed">
            <span>My Order</span>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>
          <button onClick={() => navigateTo("/wishlist")} className="w-full bg-[#E58962] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#ED5725] transition-all flex justify-between px-6 items-center">
            <span>My Wishlist</span>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>
        </div>

        {/* LOGOUT */}
        <div className="mt-auto pt-6">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full border-2 border-[#ED5725] text-[#ED5725] py-4 rounded-2xl font-bold text-sm hover:bg-[#ED5725] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Logout Account
          </button>
        </div>
      </div>

      {/* --- DRAWER EDIT PROFILE (SLIDE FROM RIGHT) --- */}
      <div className={`absolute inset-0 z-[60] bg-white transition-transform duration-500 ease-in-out flex flex-col ${isEditOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header Edit */}
        <div className="flex justify-between items-center px-6 pt-10 pb-6 border-b border-gray-50">
          <button onClick={() => setIsEditOpen(false)} className="p-2 bg-gray-50 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-[#ED5725] text-lg font-medium">Edit Your Profile</h2>
          <div className="w-9"></div>
        </div>

        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Updated!</h3>
            <p className="text-sm text-gray-400">Data kamu sudah aman di database, say. Cek email juga ya!</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col px-8 pt-8 pb-10 overflow-y-auto">
            <div className="space-y-6 flex-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block italic">First Name</label>
                <input 
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#ED5725]/20 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block italic">Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#ED5725]/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block italic">E-mail Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#ED5725]/20 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block italic">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#ED5725]/20 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="mt-10 w-full bg-[#ED5725] text-white py-5 rounded-[24px] font-bold tracking-widest text-sm shadow-xl shadow-[#ED5725]/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "SAVE CHANGES"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}