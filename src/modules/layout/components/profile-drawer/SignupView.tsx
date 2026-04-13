"use client";

import React, { useActionState, useEffect } from "react";
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

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex justify-end mb-4">
        <button onClick={() => setView("login")} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="text-center mb-8 flex flex-col items-center">
        <div className="text-black text-center flex flex-col items-center mb-6">
          <h1 className="text-2xl font-serif tracking-widest mb-0.5">niconico</h1>
          <p className="text-[10px] tracking-[0.3em] font-light uppercase">resort</p>
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