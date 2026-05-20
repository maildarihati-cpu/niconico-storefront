"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Loader2, Tag, CheckCircle2 } from "lucide-react"

// 🌟 IMPORT INITIATE PAYMENT
import { 
  updateCartAddressAction, 
  getShippingOptionsAction, 
  setShippingMethodAction, 
  applyPromoCodeAction,
  initiatePaymentAction 
} from "@lib/util/checkout-util"

interface CheckoutFormProps {
  cart: any;
  customer: any;
}

export default function CheckoutForm({ cart: initialCart, customer }: CheckoutFormProps) {
  const router = useRouter()
  const [cart, setCart] = useState(initialCart)
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
  const [isLoadingShipping, setIsLoadingShipping] = useState(true)
  const [showAddressList, setShowAddressList] = useState(false)

  // 1. AMBIL SHIPPING METHOD
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const options = await getShippingOptionsAction(cart.id)
        setShippingMethods(options)
        
        if (options.length > 0 && !cart.shipping_methods?.length) {
          handleSelectShipping(options[0].id)
        }
      } catch (error) {
        console.error("Gagal ambil shipping:", error)
      } finally {
        setIsLoadingShipping(false)
      }
    }
    fetchShippingMethods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.id])

  const handleSelectShipping = async (optionId: string) => {
    try {
      const updatedCart = await setShippingMethodAction(cart.id, optionId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Gagal set shipping:", error)
    }
  }

  // 2. FUNGSI GANTI ALAMAT
  const handleUpdateAddress = async (address: any) => {
    try {
      const updatedCart = await updateCartAddressAction(cart.id, address)
      setCart(updatedCart) 
      setShowAddressList(false) 
    } catch (error) {
      alert("Gagal mengganti alamat, silakan coba lagi.")
    }
  }

  // 3. FUNGSI APPLY PROMO
  const handleApplyPromo = async () => {
    if (!promoCode) return
    setIsApplyingPromo(true)
    try {
      const updatedCart = await applyPromoCodeAction(cart.id, promoCode)
      setCart(updatedCart)
      setPromoCode("")
      alert("Voucher berhasil dipasang!")
    } catch (error) {
      alert("Yah, kode vouchernya gak valid nih.")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  // 🌟 4. FUNGSI BAYAR (XENDIT REDIRECT)
  const handlePayNow = async () => {
    setIsPaying(true)
    
    try {
      if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
        alert("Pilih metode pengiriman dulu ya!")
        setIsPaying(false)
        return
      }

      // Tembak action ke backend menggunakan ID yang baru!
      const updatedCart = await initiatePaymentAction(cart.id, "xenditPaymentProvider")

      // Ekstrak URL Invoice dari response provider yang baru
      const xenditSession = updatedCart?.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === "xenditPaymentProvider"
      )
      
      const invoiceUrl = xenditSession?.data?.invoice_url

      // 🌟 PERBAIKAN TYPESCRIPT: Pakai String() untuk memastikan data adalah teks
      if (invoiceUrl) {
        window.location.href = String(invoiceUrl) 
      } else {
        console.error("Session Data Xendit Error:", xenditSession)
        alert("Gagal mendapatkan link pembayaran dari gateway. Silakan coba lagi.")
        setIsPaying(false)
      }

    } catch (error) {
      console.error("Gagal inisiasi pembayaran:", error)
      alert("Terjadi kesalahan jaringan, silakan coba lagi.")
      setIsPaying(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      
      {/* HEADER */}
      <div className="flex items-center px-6 pt-12 pb-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 pr-6 uppercase tracking-widest">
          Check Out
        </h1>
      </div>

      <div className="px-5 py-6 space-y-6 pb-32">
        
        {/* SHIPPING ADDRESS */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black text-[#DF714B] uppercase tracking-[0.2em]">Shipping Address</h3>
            <button 
              onClick={() => setShowAddressList(!showAddressList)}
              className="text-[10px] font-bold text-gray-400 hover:text-[#DF714B] underline uppercase italic"
            >
              {showAddressList ? "Cancel" : "Change Address"}
            </button>
          </div>

          {showAddressList ? (
            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {customer?.addresses?.map((addr: any) => (
                <div 
                  key={addr.id}
                  onClick={() => handleUpdateAddress(addr)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                    cart.shipping_address?.address_1 === addr.address_1 
                    ? "border-[#DF714B] bg-[#DF714B]/5 shadow-sm" 
                    : "border-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11px] font-black text-gray-800 uppercase italic">
                      {addr.first_name} {addr.last_name}
                    </p>
                    {cart.shipping_address?.address_1 === addr.address_1 && (
                      <CheckCircle2 className="w-4 h-4 text-[#DF714B]" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-medium">
                    {addr.address_1}, {addr.city}, {addr.province}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                <MapPin className="w-5 h-5 text-[#DF714B]" />
              </div>
              <div className="flex-1">
                {cart.shipping_address ? (
                  <p className="text-[11px] text-gray-600 leading-relaxed uppercase font-medium">
                    <span className="font-black text-gray-900 italic">{cart.shipping_address.first_name} {cart.shipping_address.last_name}</span><br/>
                    {cart.shipping_address.address_1}, {cart.shipping_address.city}
                  </p>
                ) : <p className="text-[11px] italic text-gray-400 font-bold">Pilih alamat pengirimanmu...</p>}
              </div>
            </div>
          )}
        </div>

        {/* ITEMS (QTY LOCKED) */}
        <div className="space-y-4 pt-2">
          {cart.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-[12px] font-black text-gray-900 uppercase italic leading-tight">{item.title}</h4>
                  <span className="text-[10px] font-black text-[#DF714B] bg-[#DF714B]/10 px-2 py-1 rounded-lg">x{item.quantity}</span>
                </div>
                <p className="text-[14px] font-black mt-2 tracking-tight">Rp {item.unit_price.toLocaleString("id-ID")}</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest">{item.variant?.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PROMO */}
        <div className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              placeholder="HAVE A PROMO CODE?" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-[10px] font-black focus:border-[#DF714B] outline-none transition-all tracking-[0.2em]"
            />
          </div>
          <button 
            onClick={handleApplyPromo}
            disabled={isApplyingPromo || !promoCode}
            className="bg-black text-white px-8 rounded-2xl text-[10px] font-black uppercase disabled:opacity-30 tracking-widest"
          >
            {isApplyingPromo ? "..." : "APPLY"}
          </button>
        </div>

        {/* SHIPPING & GATEWAY */}
        <div className="bg-[#EF7044] rounded-[15px] p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-5">Delivery Method</h4>
          {isLoadingShipping ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <div 
                  key={method.id} 
                  onClick={() => handleSelectShipping(method.id)}
                  className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                    cart.shipping_methods?.some((m: any) => m.shipping_option_id === method.id)
                    ? "bg-white text-[#EF7044] border-white shadow-md font-black"
                    : "border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className="text-[10px] uppercase font-black tracking-wider">{method.name}</span>
                  <span className="text-[12px] font-black">Rp {method.amount?.toLocaleString("id-ID") || 0}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-7 mt-7 border-t border-white/20">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payment Gateway</h4>
              <span className="text-[9px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/30 uppercase tracking-tighter">XENDIT SECURE</span>
            </div>
            <p className="text-[10px] opacity-70 mt-3 leading-relaxed italic font-medium">Click "Pay Now" to choose your bank, QRIS, or Card via Xendit.</p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="pt-6 space-y-4 border-t border-gray-100">
          <div className="flex justify-between text-[11px] text-gray-400 font-black uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-gray-900">Rp {(cart.subtotal || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 font-black uppercase tracking-widest">
            <span>Shipping</span>
            <span className="text-gray-900">Rp {(cart.shipping_total || 0).toLocaleString("id-ID")}</span>
          </div>
          {cart.discount_total > 0 && (
            <div className="flex justify-between text-[11px] text-green-600 font-black uppercase tracking-widest">
              <span>Promo applied</span>
              <span>-Rp {cart.discount_total.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <span className="text-[15px] font-black uppercase italic tracking-tighter text-gray-400">Total amount</span>
            <span className="text-2xl font-black text-[#EF7044] tracking-tighter">Rp {(cart.total || 0).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <button 
          onClick={handlePayNow}
          disabled={isPaying}
          className="w-full bg-[#EF7044] text-white py-5 rounded-full font-black text-[15px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
        >
          {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
        </button>
      </div>
    </div>
  )
}