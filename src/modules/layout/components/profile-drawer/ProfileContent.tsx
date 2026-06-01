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
import { listOrders } from "@lib/data/orders";

interface ProfileContentProps {
  onClose: () => void;
  view: string;
  setView: (view: string) => void;
}

export default function ProfileContent({ onClose, view, setView }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null); 

  const fetchCustomerData = async () => {
    const customer = await retrieveCustomer().catch(() => null);
    if (customer) {
      // 🌟 PERBAIKAN: Panggil dengan urutan yang benar (limit: 100, offset: 0).
      // Data alamat & resi otomatis ikut karena sudah kita seting di orders.ts
      const ordersResponse: any = await listOrders(100, 0).catch(() => []);
      const ordersData = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []);
      setCustomerData({ ...customer, orders: ordersData });
    }
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const customer = await retrieveCustomer().catch(() => null);
      if (customer) {
        
        // 🌟 PERBAIKAN: Sama seperti di atas
        const ordersResponse: any = await listOrders(100, 0).catch(() => []);
        const ordersData = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []);
        
        setCustomerData({ ...customer, orders: ordersData });
        
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

  if (view === "menu") return <MenuView onClose={onClose} setView={setView} customer={customerData} />;
  if (view === "login") return <LoginView onClose={onClose} setView={setView} onSuccess={fetchCustomerData} />;
  if (view === "signup") return <SignupView onClose={onClose} setView={setView} />;
  if (view === "address") return <AddressView onClose={onClose} setView={setView} customer={customerData} onSuccess={fetchCustomerData} />;
  if (view === "profile") return <ProfileView onClose={onClose} setView={setView} customer={customerData} onSuccess={fetchCustomerData} />;
  if (view === "reset-password") return <ResetPasswordView onClose={onClose} setView={setView} customer={customerData} />;
  
  if (view === "orders") return (
    <OrderHistory 
      orders={customerData?.orders || []} 
      setView={setView} 
      onClose={onClose} 
    />
  );
  
  return null;
}