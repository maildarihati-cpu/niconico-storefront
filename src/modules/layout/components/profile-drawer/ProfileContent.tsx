"use client";

import React, { useState, useEffect } from "react";
import MenuView from "./MenuView";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import ProfileView from "./ProfileView";
import { retrieveCustomer } from "@lib/data/customer"; 

type ViewState = "loading" | "menu" | "login" | "signup" | "profile";

interface ProfileContentProps {
  onClose: () => void;
}

export default function ProfileContent({ onClose }: ProfileContentProps) {
  const [view, setView] = useState<ViewState>("loading");
  // TAMBAHIN STATE INI BUAT NYIMPEN DATA KUSTOMER
  const [customerData, setCustomerData] = useState<any>(null); 

  const checkSession = async () => {
    try {
      const customer = await retrieveCustomer().catch(() => null);

      if (customer) {
        setCustomerData(customer); // Simpan datanya di sini
        setView("profile");
      } else {
        setView("menu");
      }
    } catch (error) {
      console.error("Session check error:", error);
      setView("menu");
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

  if (view === "menu") return <MenuView onClose={onClose} setView={setView} />;
  if (view === "login") return <LoginView onClose={onClose} setView={setView} />;
  if (view === "signup") return <SignupView onClose={onClose} setView={setView} />;
  
  // OPER DATANYA KE PROFILEVIEW
  if (view === "profile") return <ProfileView onClose={onClose} setView={setView} customer={customerData} />;
  
  return null;
}