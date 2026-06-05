"use client";

import React, { useActionState, useEffect } from "react";
import Image from "next/image"; // 🌟 DITAMBAH UNTUK OPTIMASI LOGO
import { X, Loader2 } from "lucide-react";
import { signup } from "@lib/data/customer"; 

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
}

export default function SignupView({ onClose, setView }: Props) {
  const [message, formAction, isPending] = useActionState(signup, null);

  useEffect(() => {
    if (message && typeof message === "object" && "id" in message) {
      alert("Registration Successful! Please login.");
      setView("login");
    }
  }, [message, setView]);

  const errorMessage = typeof message === "string" ? message : null;

  // 🌟 FUNGSI GOOGLE AUTH
  const handleGoogleAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dev.niconicoresort.com";
    
    // 🌟 PERBAIKAN: Arahkan ke rute file google-callback Bos!
    // Asumsi rute callback Bos ada di "/google-callback" atau "/api/auth/callback"
    const callbackUrl = `${baseUrl}/google-callback`; 
    
    try {
      const response = await fetch(`${backendUrl}/auth/customer/google?redirect_to=${encodeURIComponent(callbackUrl)}`, {
        method: "GET"
      });
      
      const data = await response.json();

      if (data.location) {
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
      <div className="flex justify-end mb-4">
        <button onClick={() => setView("login")} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="text-center mb-8 flex flex-col items-center">
        {/* 🌟 LOGO MENGGANTIKAN TEKS */}
        <div className="relative w-36 h-10 mb-6">
          <Image 
            src="/logo-niconico-black.png" 
            alt="Niconico Resort Logo" 
            fill 
            className="object-contain" 
            priority
          />
        </div>
        <h2 className="text-2xl font-bold text-black">Create Your Account</h2>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <input
          required
          type="text"
          name="first_name" 
          placeholder="First Name"
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />
        <input
          required
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="Email address"
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />
        {/* INI DIA TAMBAHANNYA BOS 👇 */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />
        <input
          required
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#ED5725] text-white rounded-full py-3.5 font-bold mt-4 hover:bg-[#d64a1d] transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              PROCESSING...
            </>
          ) : (
            "SIGN UP"
          )}
        </button>
      </form>

      {/* 🌟 TOMBOL GOOGLE SIGN UP DI SINI */}
      <div className="w-full mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or sign up with</span>
          <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Icon" 
            className="w-4 h-4" 
          />
          GOOGLE
        </button>
      </div>

      <div className="mt-8 pb-4 text-center">
        <p className="text-sm text-[#ED5725] font-medium">
          Already have account?{" "}
          <button onClick={() => setView("login")} className="font-bold hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}