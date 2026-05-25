"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ShoppingBag, CheckCircle2 } from "lucide-react"
import { cleanUpMainCartAction } from "@lib/util/checkout-util" 

export default function OrderSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const cleanCart = async () => {
      const pendingStr = localStorage.getItem("niconico_purchased_variants");
      if (pendingStr) {
        try {
          const purchasedVariants = JSON.parse(pendingStr);
          await cleanUpMainCartAction(purchasedVariants);
          localStorage.removeItem("niconico_purchased_variants");
        } catch (error) {
          console.error("Gagal membersihkan keranjang utama:", error);
        }
      }
    }
    cleanCart();
  }, [])

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="flex items-center px-6 pt-12 pb-4 border-b border-gray-100">
        <button 
          onClick={() => router.push("/")} 
          className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-6 uppercase tracking-widest">
          Check Out
        </h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        
        <h2 className="text-2xl font-black mb-10 uppercase italic">Order Complete</h2>
        
        {/* CUSTOM ICON STACKING (Tas Belanja + Centang) */}
        <div className="relative mb-8 animate-in zoom-in duration-500">
          <ShoppingBag className="w-24 h-24 text-gray-800 stroke-[1.5]" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-[#EF7044] fill-white stroke-[2]" />
          </div>
        </div>

        {/* TEXT MESSAGES */}
        <p className="text-center text-[12px] font-black uppercase tracking-widest text-gray-600 mb-2">
          Thank you for your purchase.
        </p>
        <p className="text-center text-[11px] font-medium leading-relaxed text-gray-400 uppercase">
          You can view your order in 'My Orders'<br />section.
        </p>

        {/* BUTTON */}
        <button 
          onClick={() => router.push("/store")}
          className="w-full max-w-sm mt-16 bg-[#EF7044] text-white py-5 rounded-full font-black text-[13px] tracking-[0.2em] uppercase hover:bg-[#d66139] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center"
        >
          Continue Shopping
        </button>
      </div>
      
    </div>
  )
}