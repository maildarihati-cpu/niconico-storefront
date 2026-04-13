"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronLeft, Loader2, LogOut } from "lucide-react";

// URL Backend (Sesuaikan kalau beda)
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
}

export default function ProfileView({ onClose, setView }: Props) {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // LOGIC 1: Cek Status Login & Tarik Data Kustomer
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        console.log("A. ProfileView mulai ngecek tiket...");

        // CARA BACA KANTONG YANG ANTI-GAGAL (Lebih Tangguh dari sebelumnya)
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };

        const token = getCookie('_medusa_jwt');

        if (!token) {
          console.error("Isi seluruh cookie browser:", document.cookie); // Intip isi kantong aslinya
          throw new Error("Tiket nggak ketemu di kantong");
        }
        
        console.log("B. Tiket ketemu! Buka pintu Medusa...");

        const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
          method: "GET",
          headers: {
            // SAYA MASUKIN API KEY BOS LANGSUNG DI SINI BIAR PASTI TEMBUS
            "x-publishable-api-key": "pk_53647a63ad90d08e2411598afa8faa154cefa642874b80a9a478630c50f64c4c",
            "Authorization": `Bearer ${token}` 
          },
        });

        console.log("C. Respon pintu Profile:", response.status);

        if (!response.ok) {
          const errText = await response.text();
          console.error("❌ Medusa nolak karena:", errText);
          throw new Error("Token expired or invalid");
        }

        const data = await response.json();
        console.log("✅ DATA KUSTOMER DAPET:", data);
        setCustomer(data.customer);

      } catch (error) {
        console.error("💥 ERROR DI PROFILEVIEW:", error);
        setView("login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [setView]);

  // LOGIC 2: Fungsi Logout (Tinggal buang tiketnya dari kantong)
  const handleLogout = () => {
    setIsLoading(true);
    document.cookie = "_medusa_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setView("login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white px-8 pt-8 pb-6 justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ED5725]" />
        <p className="text-sm mt-4 text-gray-500 font-medium">Processing...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-8 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden antialiased">
      
      {/* HEADER LACI (SESUAI DESAIN: BACK, LOGO, CLOSE) */}
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

      {/* JUDUL SECTION ORANYE */}
      <div className="mb-6">
        <h2 className="text-[#ED5725] text-lg font-medium mb-3">Account Details</h2>
        
        {/* KARTU PUTIH DETAIL AKUN (DENGAN BAYANGAN DAN SUDUT MELENGKUNG) */}
        <div className="border border-gray-300 rounded-2xl p-6 shadow-sm">
          
          {/* BIDANG DATA (DENGAN LABEL KECIL DI ATAS) */}
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

          {/* TOMBOL KECIL DALAM KARTU (SESUAI DESAIN, DENGAN HOVER GELAP) */}
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

      {/* TOMBOL TINDAKAN UTAMA BESAR ORANYE (DENGAN HOVER GELAP) */}
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

      {/* TOMBOL LOGOUT PUTIH DI BAWAH (SESUAI DESAIN, DENGAN HOVER PUTIH ORANYE) */}
      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full border-2 border-[#ED5725] text-[#ED5725] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ED5725] hover:text-white transition-colors flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
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