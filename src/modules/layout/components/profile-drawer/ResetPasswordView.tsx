"use client";

import React, { useState } from "react";
import { ChevronLeft, Loader2, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile" | "address" | "reset-password") => void;
  customer?: any; // Opsional, kalau user udah login dan iseng klik reset
}

type Step = "request" | "reset" | "success";

export default function ResetPasswordView({ onClose, setView, customer }: Props) {
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState(customer?.email || "");
  const [token, setToken] = useState(""); // Biasanya dari URL email, ini disimulasi input manual buat testing
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- API LOGIC (MEDUSA V2) ---

  // STEP 1: Minta Token Reset Password ke Email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // ⚠️ DI MEDUSA V2 RUTENYA BERUBAH JADI INI:
      const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ⚠️ DI MEDUSA V2, PARAMETERNYA NAMANYA 'identifier', BUKAN 'email'
        body: JSON.stringify({ identifier: email }),
      });

      if (!response.ok) throw new Error("Gagal mengirim email reset password.");

      setStep("reset");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Ganti Password dengan Token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok say!");
      setIsLoading(false);
      return;
    }

    try {
      // ⚠️ DI MEDUSA V2 RUTENYA PAKE '/update'
      const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass/update`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // ⚠️ TOKEN SEKARANG WAJIB DIKIRIM LEWAT HEADER 'Authorization'
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          password: newPassword, // Password baru
        }),
      });

      if (!response.ok) throw new Error("Token salah atau sudah kedaluwarsa.");

      setStep("success");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SLIDE ANIMATION CLASSES ---
  const getSlideClass = (targetStep: Step) => {
    if (step === targetStep) return "translate-x-0";
    if (step === "request") return "translate-x-full";
    if (step === "reset" && targetStep === "request") return "-translate-x-full";
    if (step === "reset" && targetStep === "success") return "translate-x-full";
    if (step === "success") return "-translate-x-full";
    return "translate-x-full";
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col font-sans antialiased z-[60]">
      
      {/* HEADER UMUM */}
      <div className="flex justify-between items-center px-6 pt-10 pb-4 shadow-sm z-10 border-b border-gray-50 relative bg-white">
        {step !== "success" ? (
           <button 
             onClick={() => {
               if (step === "reset") setStep("request");
               else setView("profile"); // Balik ke profile kalau di step 1
             }} 
             className="p-1.5 bg-gray-50 hover:bg-white hover:border-[#ef7044] border border-gray-100 rounded-full transition-all group"
           >
             <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#ef7044]" />
           </button>
        ) : <div className="w-8"></div>}
        
        <h2 className="text-[#ef7044] text-sm font-bold tracking-widest uppercase">Reset Password</h2>
        <div className="w-8"></div>
      </div>

      {/* ========================================================= */}
      {/* SCREEN 1: INPUT EMAIL (REQUEST LINK) */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 top-[72px] bg-white flex flex-col px-8 pt-10 pb-6 transition-transform duration-500 ease-in-out ${getSlideClass("request")}`}>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
             <Mail className="w-6 h-6 text-[#ef7044]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot Password?</h3>
          <p className="text-xs text-gray-500 leading-relaxed px-4">
            Jangan panik say! Masukkan email yang terdaftar, kami akan kirimkan link untuk membuat password baru.
          </p>
        </div>

        {errorMsg && step === "request" && (
           <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-xl flex gap-2">
             <AlertCircle className="w-4 h-4 shrink-0" /> <p>{errorMsg}</p>
           </div>
        )}

        <form onSubmit={handleRequestReset} className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Email address</label>
            <input
              required
              type="email"
              placeholder="yourname@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ef7044] text-sm transition-colors placeholder:text-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-[#ef7044] text-white rounded-xl py-3.5 font-bold mt-4 border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      </div>


      {/* ========================================================= */}
      {/* SCREEN 2: CREATE NEW PASSWORD */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 top-[72px] bg-white flex flex-col px-8 pt-10 pb-6 transition-transform duration-500 ease-in-out ${getSlideClass("reset")}`}>
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
             <Lock className="w-6 h-6 text-[#ef7044]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Password</h3>
          <p className="text-xs text-gray-500 leading-relaxed px-4">
            Email terkirim ke <span className="font-bold text-[#ef7044]">{email}</span>. Masukkan token dari email dan buat password baru kamu.
          </p>
        </div>

        {errorMsg && step === "reset" && (
           <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-xl flex gap-2">
             <AlertCircle className="w-4 h-4 shrink-0" /> <p>{errorMsg}</p>
           </div>
        )}

        <form onSubmit={handleResetPassword} className="flex flex-col gap-5 flex-1 overflow-y-auto">
           <div className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Verification Token</label>
            <input
              required
              type="text"
              placeholder="Paste token dari email..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ef7044] text-sm transition-colors placeholder:text-gray-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">New Password</label>
            <input
              required
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ef7044] text-sm transition-colors placeholder:text-gray-200"
            />
          </div>

           <div className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Confirm Password</label>
            <input
              required
              type="password"
              placeholder="Ketik ulang password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#ef7044] text-sm transition-colors placeholder:text-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token || !newPassword || !confirmPassword}
            className="w-full bg-[#ef7044] text-white rounded-xl py-3.5 font-bold mt-6 border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password"}
          </button>
        </form>
      </div>


      {/* ========================================================= */}
      {/* SCREEN 3: SUCCESS NOTIFICATION */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 top-[72px] bg-white flex flex-col justify-center items-center px-8 transition-transform duration-500 ease-in-out ${getSlideClass("success")}`}>
        
        <div className="animate-in zoom-in duration-300 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Yeay, Berhasil!</h3>
          <p className="text-xs text-gray-500 text-center leading-relaxed mb-10 max-w-[250px]">
            Password kamu sudah berhasil diperbarui, say. Sekarang kamu bisa login menggunakan password baru.
          </p>

          <button
            onClick={() => {
               // Logout paksa buat suruh dia login pakai pass baru
               document.cookie = "_medusa_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
               window.location.reload(); 
            }}
            className="w-full min-w-[250px] bg-[#ef7044] text-white rounded-xl py-3.5 font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all flex justify-center items-center gap-2 text-xs tracking-widest uppercase"
          >
            Back to Login
          </button>
        </div>
      </div>

    </div>
  );
}