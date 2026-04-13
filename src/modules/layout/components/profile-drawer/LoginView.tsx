"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile") => void;
}

export default function LoginView({ onClose, setView }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log("1. Tombol login diklik! Mengirim email:", email);

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

      console.log("2. Backend merespon dengan status code:", response.status);

      // Kalau ditolak server (misal salah password/email)
      if (!response.ok) {
        // Ambil pesan error aslinya dari server
        const errorText = await response.text(); 
        console.error("❌ Backend nolak karena:", errorText);
        throw new Error("Invalid email or password.");
      }

      // Kalau lolos, baru kita baca datanya
      const data = await response.json();
      console.log("3. Server kasih balasan sukses:", data);

      if (!data.token) {
        throw new Error("Aneh, sukses tapi server nggak ngasih token/tiket.");
      }

      console.log("4. Tiket aman! Masukin ke kantong (Cookie)...");
      document.cookie = `_medusa_jwt=${data.token}; path=/; max-age=2592000;`;

      console.log("5. SEMUA SUKSES! Buka laci Profile sekarang!");
      setView("profile");

    } catch (err: any) {
      console.error("💥 ERROR KESELURUHAN:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* TOMBOL CLOSE */}
      <div className="flex justify-end mb-4">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* HEADER LOGO */}
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="text-black text-center flex flex-col items-center mb-6">
          <h1 className="text-2xl font-serif tracking-widest mb-0.5">niconico</h1>
          <p className="text-[10px] tracking-[0.3em] font-light uppercase">resort</p>
        </div>
        <h2 className="text-2xl font-bold text-black">Log In</h2>
      </div>

      {/* PESAN ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center">
          {error}
        </div>
      )}

      {/* FORM LOGIN */}
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />
        
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#ED5725] text-sm transition-colors"
        />

        <div className="flex justify-end mt-[-10px]">
          <button type="button" className="text-xs text-gray-400 hover:text-[#ED5725] transition-colors italic">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ED5725] text-white rounded-full py-3.5 font-bold mt-2 hover:bg-[#d64a1d] transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AUTHENTICATING...
            </>
          ) : (
            "LOG IN"
          )}
        </button>
      </form>

      {/* LINK KE SIGN UP */}
      <div className="mt-8 pb-4 text-center">
        <p className="text-sm text-[#ED5725] font-medium">
          Don't have an account?{" "}
          <button onClick={() => setView("signup")} className="font-bold hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}