"use client";

import React, { useState, useEffect } from "react";
import MenuView from "./MenuView";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import ProfileView from "./ProfileView";
import AddressView from "./AddressView";
import ResetPasswordView from "./ResetPasswordView";
// 🌟 PERBAIKAN 1: Import komponen OrderHistory yang tadi kita buat
import OrderHistory from "./OrderHistory"; 
import { retrieveCustomer } from "@lib/data/customer"; 

interface ProfileContentProps {
  onClose: () => void;
  view: string;
  setView: (view: string) => void;
}

export default function ProfileContent({ onClose, view, setView }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null); 

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const customer = await retrieveCustomer().catch(() => null);
      if (customer) {
        setCustomerData(customer);
        // Jika statusnya sudah login tapi Navbar menyuruh buka halaman "login",
        // kita arahkan ke "profile" saja biar logis (mencegah user login 2x)
        if (view === "login") {
          setView("profile");
        }
      }
    } catch (error) {
      console.error("Gagal cek sesi:", error);
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  const fetchCustomerData = async () => {
    const customer = await retrieveCustomer().catch(() => null);
    if (customer) {
      setCustomerData(customer);
    }
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7044]"></div>
      </div>
    );
  }

  // OPER DATA & VIEW KE KOMPONEN ANAK
  if (view === "menu") return <MenuView onClose={onClose} setView={setView} customer={customerData} />;
  
  if (view === "login") return <LoginView onClose={onClose} setView={setView} onSuccess={fetchCustomerData} />;
  
  if (view === "signup") return <SignupView onClose={onClose} setView={setView} />;
  
  if (view === "address") return <AddressView onClose={onClose} setView={setView} customer={customerData} onSuccess={fetchCustomerData} />;
  
  if (view === "profile") return (
    <ProfileView 
      onClose={onClose} 
      setView={setView} 
      customer={customerData} 
      onSuccess={fetchCustomerData} 
    />
  );
  
  if (view === "reset-password") return (
    <ResetPasswordView 
      onClose={onClose} 
      setView={setView} 
      customer={customerData} 
    />
  );

  // 🌟 PERBAIKAN 2: Tambahkan logika render untuk "orders" di sini!
  if (view === "orders") return (
    <OrderHistory 
      orders={customerData?.orders || []} 
      setView={setView} 
      onClose={onClose} // 🌟 JANGAN LUPA TAMBAH BARIS INI BOS!
    />
  );
  
  return null;
}