"use client";

import React, { useState } from "react";
import { X, Loader2, ChevronLeft } from "lucide-react"; // Tambahin ChevronLeft

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

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
      const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error("Invalid email or password.");
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error("Aneh, sukses tapi server nggak ngasih token/tiket.");
      }

      document.cookie = `_medusa_jwt=${data.token}; path=/; max-age=2592000;`;

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

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* HEADER BUTTONS (BACK & CLOSE) */}
      <div className="flex justify-between items-center mb-4">
        {/* TOMBOL BACK */}
        <button 
          onClick={() => setView("menu")} 
          className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#ED5725] border border-gray-100 rounded-full transition-all group"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#ED5725]" />
        </button>

        {/* TOMBOL CLOSE */}
        <button 
          onClick={onClose} 
          className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#ED5725] border border-gray-100 rounded-full transition-all group"
        >
          <X className="w-4 h-4 text-gray-500 group-hover:text-[#ED5725]" />
        </button>
      </div>

      {/* HEADER LOGO */}
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="text-black text-center flex flex-col items-center mb-6">
          <h1 className="text-2xl font-serif tracking-widest mb-0.5">niconico</h1>
          <p className="text-[10px] tracking-[0.3em] font-light uppercase">resort</p>
        </div>
        <h2 className="text-2xl font-bold text-black uppercase tracking-widest">Log In</h2>
      </div>

      {/* PESAN ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-[10px] rounded-lg border border-red-100 text-center font-medium">
          {error}
        </div>
      )}

      {/* FORM LOGIN */}
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Email address</label>
          <input
            required
            type="email"
            placeholder="yourname@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors placeholder:text-gray-200"
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
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors placeholder:text-gray-200"
          />
        </div>

        <div className="flex justify-end mt-[-10px]">
          <button 
            type="button" 
            onClick={() => setView("reset-password")} // 👈 Tambahin onClick ini
            className="text-[10px] text-gray-400 hover:text-[#ED5725] transition-colors italic font-medium"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ED5725] text-white rounded-xl py-3.5 font-bold mt-2 border border-[#ED5725] hover:bg-white hover:text-[#ED5725] transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Log In Account"
          )}
        </button>
      </form>

      {/* LINK KE SIGN UP */}
      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Don't have an account?{" "}
          <button onClick={() => setView("signup")} className="text-[#ED5725] font-bold hover:underline uppercase tracking-wider ml-1">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}