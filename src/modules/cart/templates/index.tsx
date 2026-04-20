"use client"

import { HttpTypes } from "@medusajs/types"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CartTemplateProps = {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

const CartTemplate = ({ cart, customer }: CartTemplateProps) => {
  const router = useRouter()
  const items = cart?.items || []
  
  // Logic untuk format mata uang dinamis dari backend
  const formatAmount = (amount: number | undefined | null) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart?.currency_code?.toUpperCase() || "USD",
      minimumFractionDigits: 0,
    }).format((amount || 0) / 100)
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative pb-80 bg-white">
      {/* HEADER */}
      <header className="flex items-center justify-between p-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="w-10 h-10">
          <img src="/pineapple-logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-6 mb-8 text-center">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart</h1>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-1 px-6 space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 relative border border-gray-50">
              {/* Product Image */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={item.thumbnail || ""} 
                  alt={item.title || ""} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 pr-8">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h3>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {formatAmount(item.unit_price)}
                </p>
                
                <div className="flex gap-2 text-[10px] text-gray-400 mt-1 uppercase font-semibold tracking-wider">
                  <span>{item.variant?.title}</span>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-50 rounded-full w-fit mt-3 px-2 py-1 border border-gray-100">
                  <button className="p-1 hover:text-[#EF7044] transition-colors"><Minus size={14} /></button>
                  <span className="px-3 text-xs font-bold text-gray-800">1</span>
                  <button className="p-1 hover:text-[#EF7044] transition-colors"><Plus size={14} /></button>
                </div>
              </div>

              {/* Selection Indicator (Orange Box in your design) */}
              <div className="absolute top-4 right-4">
                 <div className="w-5 h-5 rounded-md bg-[#EF7044] flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                    </svg>
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <p className="text-gray-400 font-medium">Your cart is currently empty</p>
            <LocalizedClientLink href="/store" className="mt-4 text-[#EF7044] font-bold text-sm underline">
              Continue Shopping
            </LocalizedClientLink>
          </div>
        )}
      </div>

      {/* SUMMARY BOX (STICKY FOOTER) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="bg-[#EF7044] rounded-[48px] p-8 text-white shadow-[0_20px_50px_rgba(239,112,68,0.3)]">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Total Price</span>
              <span className="font-bold text-sm">{formatAmount(cart?.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Tax</span>
              <span className="font-bold text-sm">{formatAmount(cart?.tax_total)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Shipping</span>
              <span className="font-bold text-sm">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-lg font-medium tracking-tight">Subtotal</span>
              <span className="text-3xl font-black">{formatAmount(cart?.total)}</span>
            </div>
          </div>

          <LocalizedClientLink href="/checkout">
            <button className="w-full bg-white text-[#EF7044] font-black py-5 rounded-[24px] text-sm tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-[0.98] uppercase shadow-xl">
              Checkout Now
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default CartTemplate