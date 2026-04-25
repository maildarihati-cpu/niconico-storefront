"use client";

import React, { useState, useEffect } from "react";
import MenuView from "./MenuView";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import ProfileView from "./ProfileView";
import AddressView from "./AddressView";
import ResetPasswordView from "./ResetPasswordView";
import { retrieveCustomer } from "@lib/data/customer"; 

type ViewState = "loading" | "menu" | "login" | "signup" | "profile" | "address" | "reset-password";

export default function ProfileContent({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<ViewState>("loading");
  const [customerData, setCustomerData] = useState<any>(null); 

  // LOGIC ASLI (TIDAK DIUBAH)
  const checkSession = async () => {
    try {
      const customer = await retrieveCustomer().catch(() => null);
      if (customer) {
        setCustomerData(customer);
        // Tetap arahkan ke menu dulu agar user bisa lihat pilihan menu lain, 
        // tapi kita simpan datanya.
        setView("menu"); 
      } else {
        setView("menu");
      }
    } catch (error) {
      setView("menu");
    }
  };

  // TAMBAHAN AMAN: Fungsi ini khusus dipanggil saat login sukses
  // Biar narik data nama tanpa maksa balik ke halaman "menu"
  const fetchCustomerData = async () => {
    const customer = await retrieveCustomer().catch(() => null);
    if (customer) {
      setCustomerData(customer);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7044]"></div>
      </div>
    );
  }

  // OPER customerData ke MenuView juga
  if (view === "menu") return <MenuView onClose={onClose} setView={setView} customer={customerData} />;
  
  // POIN PENTING: Tambahkan onSuccess={fetchCustomerData} di sini
  if (view === "login") return <LoginView onClose={onClose} setView={setView} onSuccess={fetchCustomerData} />;
  
  if (view === "signup") return <SignupView onClose={onClose} setView={setView} />;
  if (view === "address") return <AddressView onClose={onClose} setView={setView} customer={customerData} onSuccess={fetchCustomerData} />;
  if (view === "profile") return (
  <ProfileView 
    onClose={onClose} 
    setView={setView} 
    customer={customerData} 
    onSuccess={fetchCustomerData} // INI WAJIB ADA SAY
  />
);
if (view === "reset-password") return (
  <ResetPasswordView 
    onClose={onClose} 
    setView={setView} 
    customer={customerData} 
  />
);
  
  return null;
}