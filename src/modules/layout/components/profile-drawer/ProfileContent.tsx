"use client";

import React, { useState, useEffect } from "react";
import MenuView from "./MenuView";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import ProfileView from "./ProfileView";
import AddressView from "./AddressView";
import ResetPasswordView from "./ResetPasswordView";
import OrderHistory from "./OrderHistory"; 
import { retrieveCustomer } from "@lib/data/customer"; 

// 🌟 Pastikan URL Backend terbaca
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface ProfileContentProps {
  onClose: () => void;
  view: string;
  setView: (view: string) => void;
}

export default function ProfileContent({ onClose, view, setView }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null); 

  // ==========================================
  // 🌟 PIPA DATA RAHASIA: TARIK ORDER FULL DETAIL DARI DASHBOARD ADMIN
  // ==========================================
  const fetchFullOrders = async () => {
    try {
      // Ambil kunci rahasia (token) dari Cookie HP Kustomer
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const token = getCookie('_medusa_jwt');
      if (!token) return []; // Kalau belum login, kosongin

      // Parameter fields ini WAJIB di Medusa v2 biar detail barang & resi ikut ketarik!
      const params = new URLSearchParams({
        fields: "*items,*items.variant,*shipping_address,*fulfillments",
        expand: "items,items.variant,shipping_address,fulfillments" // Fallback buat v1
      });

      const response = await fetch(`${BACKEND_URL}/store/orders?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.orders || [];
      }
      return [];
    } catch (error) {
      console.error("Gagal mengambil data detail orders:", error);
      return [];
    }
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const customer = await retrieveCustomer().catch(() => null);
      if (customer) {
        
        // 🌟 EKSEKUSI PIPA DATA SEBELUM RENDER KE LAYAR
        const fullOrders = await fetchFullOrders();
        setCustomerData({ ...customer, orders: fullOrders }); // Gabungin order utuh ke data kustomer
        
        if (view === "login") {
          setView("profile");
        }
      }
    } catch (error) {
      console.error("Gagal cek sesi:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  const fetchCustomerData = async () => {
    const customer = await retrieveCustomer().catch(() => null);
    if (customer) {
      // 🌟 EKSEKUSI JUGA PAS RE-FETCH (Misal pas habis edit profile)
      const fullOrders = await fetchFullOrders();
      setCustomerData({ ...customer, orders: fullOrders });
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

  // 🌟 SEKARANG ORDERHISTORY AKAN NERIMA DATA FULL 100% DARI ADMIN DASHBOARD
  if (view === "orders") return (
    <OrderHistory 
      orders={customerData?.orders || []} 
      setView={setView} 
      onClose={onClose} 
    />
  );
  
  return null;
}