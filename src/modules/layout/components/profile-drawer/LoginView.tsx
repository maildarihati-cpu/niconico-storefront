"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import { X, Loader2, ChevronLeft } from "lucide-react";
import { login } from "@lib/data/customer";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile" | "reset-password") => void;
  onSuccess?: () => Promise<void>; 
}

export default function LoginView({ onClose, setView, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const resultError = await login(null, formData);

      if (resultError) {
        throw new Error("Invalid email or password.");
      }

      // 🌟 [MULAI] SINKRONISASI WISHLIST (GUEST KE USER) 🌟
      try {
        const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";

        const customerRes = await fetch(`${backendUrl}/store/customers/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include" 
        });

        if (customerRes.ok) {
          const { customer } = await customerRes.json();
          const backendWishlist = customer?.metadata?.wishlist || [];

          const mergedWishlist = Array.from(new Set([...localWishlist, ...backendWishlist]));

          await fetch(`${backendUrl}/store/customers/me`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              metadata: {
                ...customer.metadata, 
                wishlist: mergedWishlist
              }
            })
          });

          localStorage.setItem("wishlist", JSON.stringify(mergedWishlist));
        }
      } catch (syncErr) {
        console.error("Sinkronisasi wishlist gagal, tapi login jalan terus:", syncErr);
      }
      // 🌟 [AKHIR] SINKRONISASI WISHLIST 🌟

      if (onSuccess) {
        await onSuccess(); 
      }
      
      setView("profile");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 FUNGSI GOOGLE AUTH DENGAN MEMORI POSISI
  const handleGoogleAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 💡 REKAM POSISI KUSTOMER SEBELUM LOMPAT KE GOOGLE
    if (typeof window !== "undefined") {
      // Menyimpan path dan query parameters (misal: /products/coral-bikini?size=M)
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem("redirect_after_login", currentUrl);
      console.log("Posisi direkam sebelum Google Auth:", currentUrl);
    }

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dev.niconicoresort.com";
    
    const callbackUrl = `${baseUrl}/google-callback`; 
    
    try {
      const response = await fetch(`${backendUrl}/auth/customer/google?redirect_to=${encodeURIComponent(callbackUrl)}`, {
        method: "GET"
      });
      
      const data = await response.json();

      if (data.location) {
        // Lompat ke Google Consent Screen
        window.location.href = data.location;
      } else {
        console.error("Gagal mendapatkan link Google:", data);
        alert("Terjadi kesalahan saat menghubungi server.");
      }
    } catch (error) {
      console.error("Error Auth:", error);
      alert("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setView("menu")} className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#EF7044] border border-gray-100 rounded-full transition-all group">
          <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#EF7044]" />
        </button>
        <button onClick={onClose} className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#EF7044] border border-gray-100 rounded-full transition-all group">
          <X className="w-4 h-4 text-gray-500 group-hover:text-[#EF7044]" />
        </button>
      </div>

      <div className="text-center mb-10 flex flex-col items-center">
        <div className="relative w-36 h-10 mb-6">
          <Image 
            src="/logo-niconico-black.png" 
            alt="Niconico Resort Logo" 
            fill 
            className="object-contain" 
            priority
          />
        </div>
        <h2 className="text-2xl font-bold text-black uppercase tracking-widest">Log In</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-[10px] rounded-lg border border-red-100 text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Email address</label>
          <input
            required
            type="email"
            placeholder="yourname@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#EF7044] text-sm transition-colors placeholder:text-gray-200"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Password</label>
          <input
            required
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#EF7044] text-sm transition-colors placeholder:text-gray-200"
          />
        </div>

        <div className="flex justify-end mt-[-10px]">
          <button type="button" onClick={() => setView("reset-password")} className="text-[10px] text-gray-400 hover:text-[#EF7044] transition-colors italic font-medium">
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-[#EF7044] text-white rounded-xl py-3.5 font-bold mt-2 border border-[#EF7044] hover:bg-white hover:text-[#EF7044] transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Authenticating...</>
          ) : (
            "Log In Account"
          )}
        </button>
      </form>

      {/* 🌟 TOMBOL GOOGLE LOGIN */}
      <div className="w-full mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
          <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Icon" 
            className="w-4 h-4" 
          />
          GOOGLE
        </button>
      </div>

      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Don't have an account?{" "}
          <button onClick={() => setView("signup")} className="text-[#EF7044] font-bold hover:underline uppercase tracking-wider ml-1">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}