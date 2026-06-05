"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Loader2, Tag, CheckCircle2, Mail, Plus, AlertCircle } from "lucide-react"

// 🌟 PERBAIKAN: Import aksi untuk menyimpan alamat permanen ke profil user
import { saveAddressServerAction } from "@/lib/address-actions";

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
  
  const [email, setEmail] = useState(initialCart?.email || customer?.email || "")
  
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
  const [isLoadingShipping, setIsLoadingShipping] = useState(true)
  const [showAddressList, setShowAddressList] = useState(false)
  
  // 🌟 STATE UNTUK FORM TAMBAH ALAMAT MANUAL
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    first_name: customer?.first_name || "No addresses found",
    last_name: customer?.last_name || "No addresses found",
    phone: customer?.phone || "No addresses found",
    address_1: "No addresses found",
    city: "No addresses found",
    province: "No addresses found",
    postal_code: "No addresses found",
    country_code: "id", // Default Indonesia
  })

  // 1. FUNGSI SHIPPING (DIPISAH AGAR BISA DIPANGGIL ULANG SAAT GANTI NEGARA)
  const fetchShippingMethods = async (currentCartId: string) => {
    setIsLoadingShipping(true)
    try {
      const options = await getShippingOptionsAction(currentCartId)
      setShippingMethods(options)
      
      // Auto-select kurir pertama jika belum ada yang dipilih
      if (options.length > 0) {
        await handleSelectShipping(options[0].id, currentCartId)
      }
    } catch (error) {
      console.error("Error fetching shipping options:", error)
    } finally {
      setIsLoadingShipping(false)
    }
  }

  // Panggil saat komponen pertama kali dimuat
  useEffect(() => {
    fetchShippingMethods(cart.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.id])

  const handleSelectShipping = async (optionId: string, currentCartId: string = cart.id) => {
    try {
      const updatedCart = await setShippingMethodAction(currentCartId, optionId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error selecting shipping method:", error)
    }
  }

  // 2. FUNGSI GANTI ALAMAT SEKALIGUS SUNTIK EMAIL & RE-FETCH SHIPPING
  const handleUpdateAddress = async (address: any) => {
    try {
      setIsLoadingShipping(true) // Loading kurir nyala saat ganti alamat
      const targetEmail = email || customer?.email || "";
      
      // Update alamat di Cart (Otomatis mendeteksi Region/Negara di Backend Medusa)
      const updatedCart = await updateCartAddressAction(cart.id, address, targetEmail)
      setCart(updatedCart) 
      setShowAddressList(false) 
      setIsAddingAddress(false) // Tutup form tambah alamat jika terbuka
      
      // 🌟 TARIK ULANG KURIR BERDASARKAN NEGARA YANG BARU DIPILIH!
      await fetchShippingMethods(updatedCart.id)
    } catch (error) {
      console.error("Error updating address:", error)
      alert("Failed to update address. Please try again.")
      setIsLoadingShipping(false)
    }
  }

  // 🌟 FUNGSI SIMPAN ALAMAT MANUAL (FULL SYNC KE DATABASE & CART)
  const handleSaveNewAddress = async () => {
    if (!newAddress.first_name || !newAddress.address_1 || !newAddress.city) {
      return alert("Please complete your Name, Address, and City.")
    }
    
    try {
      setIsLoadingShipping(true) // Nyalakan loading biar user tidak klik 2x

      // 1. SINKRON KE ADDRESS VIEW (SIMPAN PERMANEN KE PROFIL USER)
      await saveAddressServerAction(newAddress, customer.id) 

      // 2. SINKRON KE CART CHECKOUT (Otomatis panggil ulang kurir setelahnya)
      await handleUpdateAddress(newAddress)
      
    } catch (error) {
      console.error("Gagal menyimpan alamat:", error)
      alert("Gagal menyimpan alamat ke profil. Pastikan data sudah benar.")
      setIsLoadingShipping(false)
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
      alert("Yeay, voucher applied!")
    } catch (error) {
      alert("Failed to apply promo code. Please check the code and try again.")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  // 4. FUNGSI BAYAR
  const handlePayNow = async () => {
    setIsPaying(true)
    
    try {
      if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
        alert("Please select a delivery method first!")
        setIsPaying(false)
        return
      }

      const updatedCart = await initiatePaymentAction(cart.id, "pp_xendit_xendit")

      const xenditSession = updatedCart?.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === "pp_xendit_xendit"
      )
      
      const sessionData: any = xenditSession?.data || {}

      if (sessionData.error) {
        alert(`Error: ${sessionData.error}`)
        setIsPaying(false)
        return
      }

      const invoiceUrl = sessionData.invoice_url || sessionData.invoiceUrl || sessionData.data?.invoice_url; 

      if (invoiceUrl) {
        const purchasedVariants = cart.items.map((item: any) => item.variant_id);
        localStorage.setItem("niconico_purchased_variants", JSON.stringify(purchasedVariants));

        window.location.href = String(invoiceUrl) 
      } else {
        alert("Failed to initiate payment. Please try again.")
        setIsPaying(false)
      }

    } catch (error) {
      console.error("Error initiating payment:", error)
      alert("Failed to initiate payment. Please try again.")
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

        {/* CONTACT INFO */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-[#EF7044] uppercase tracking-[0.2em] px-1">Contact Info</h3>
          <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center gap-4 transition-all focus-within:border-[#EF7044] focus-within:bg-white">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm">
              <Mail className="w-5 h-5 text-[#EF7044]" />
            </div>
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[11px] font-black text-gray-900 outline-none uppercase tracking-widest placeholder:text-gray-300"
            />
          </div>
        </div>
        
        {/* SHIPPING ADDRESS */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black text-[#EF7044] uppercase tracking-[0.2em]">Shipping Address</h3>
            <button 
              onClick={() => {
                setShowAddressList(!showAddressList)
                setIsAddingAddress(false) // Reset form saat tutup/buka
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-[#EF7044] underline uppercase italic"
            >
              {showAddressList ? "Cancel" : "Change Address"}
            </button>
          </div>

          {showAddressList ? (
            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              
              {/* 🌟 FORM TAMBAH ALAMAT MANUAL */}
              {isAddingAddress ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-4">
                    <h4 className="text-sm font-bold text-gray-900 tracking-wide">Detail Address</h4>
                    <button onClick={() => setIsAddingAddress(false)} className="p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-800" />
                    </button>
                  </div>

                  <div className="border border-[#ef7044]/20 rounded-xl p-4 relative bg-gray-50 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 max-w-[75%]">
                      <div className="p-2 bg-orange-100 rounded-lg text-[#ef7044]"><MapPin size={16}/></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-900 truncate">Delivery Location</p>
                        <p className="text-[9px] text-gray-500 truncate">
                          {newAddress.address_1 ? newAddress.address_1 : "Menyesuaikan detail alamat..."}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-200 text-gray-500 text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      Auto
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Address Detail/Street Name</label>
                    <textarea 
                      rows={3}
                      required
                      value={newAddress.address_1}
                      onChange={(e) => setNewAddress({...newAddress, address_1: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
                      placeholder="Masukkan nomor rumah, gang, atau blok..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">City / Regency</label>
                      <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Province / State</label>
                      <input type="text" required value={newAddress.province} onChange={(e) => setNewAddress({...newAddress, province: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Postal Code</label>
                      <input type="text" required value={newAddress.postal_code} onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" placeholder="80117" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Country (For Shipping)</label>
                      <select value={newAddress.country_code} onChange={e => setNewAddress({...newAddress, country_code: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none appearance-none transition-colors cursor-pointer">
                        <option value="id">Indonesia (ID)</option>
                        <option value="sg">Singapore (SG)</option>
                        <option value="my">Malaysia (MY)</option>
                        <option value="au">Australia (AU)</option>
                        <option value="us">United States (US)</option>
                        <option value="gb">United Kingdom (GB)</option>
                        <option value="eu">Europe (EU)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">First Name</label>
                      <input type="text" required value={newAddress.first_name} onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Last Name</label>
                      <input type="text" required value={newAddress.last_name} onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Recipient Phone Number</label>
                    <input type="tel" required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors" />
                  </div>

                  <div className="flex gap-2 mt-2 items-start pr-4">
                    <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[8px] text-[#ef7044] leading-relaxed font-medium">
                      *By saving this address, coordinate data and shipping details will be permanently stored in the Niconico Resort profile database for convenient automatic checkout.*
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => setIsAddingAddress(false)} 
                      className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNewAddress} 
                      disabled={isLoadingShipping}
                      className="flex-[2] bg-[#ef7044] text-white py-4 rounded-xl font-bold border border-[#ef7044] hover:bg-black hover:border-black transition-all text-[10px] tracking-widest uppercase flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {isLoadingShipping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Verify Address"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* DAFTAR ALAMAT YANG SUDAH ADA */}
                  {customer?.addresses?.length > 0 ? (
                    customer.addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => handleUpdateAddress(addr)}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                          cart.shipping_address?.address_1 === addr.address_1 
                          ? "border-[#EF7044] bg-[#EF7044]/5 shadow-sm" 
                          : "border-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[11px] font-black text-gray-800 uppercase italic">
                            {addr.first_name} {addr.last_name}
                          </p>
                          {cart.shipping_address?.address_1 === addr.address_1 && (
                            <CheckCircle2 className="w-4 h-4 text-[#EF7044]" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-medium">
                          {addr.address_1}, {addr.city}, {addr.province}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-[10px] text-gray-400 font-bold uppercase italic border-2 border-dashed border-gray-100 rounded-3xl">
                      No addresses found.
                    </div>
                  )}

                  {/* TOMBOL ADD NEW ADDRESS */}
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:border-[#EF7044] hover:text-[#EF7044] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                <MapPin className="w-5 h-5 text-[#EF7044]" />
              </div>
              <div className="flex-1">
                {cart.shipping_address && cart.shipping_address.address_1 ? (
                  <p className="text-[11px] text-gray-600 leading-relaxed uppercase font-medium">
                    <span className="font-black text-gray-900 italic">{cart.shipping_address.first_name} {cart.shipping_address.last_name}</span><br/>
                    {cart.shipping_address.address_1}, {cart.shipping_address.city}
                  </p>
                ) : (
                  <p className="text-[11px] italic text-gray-400 font-bold">No Address Found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ITEMS */}
        <div className="space-y-4 pt-2">
          {cart.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-[12px] font-black text-gray-900 uppercase italic leading-tight">{item.title}</h4>
                  <span className="text-[10px] font-black text-[#EF7044] bg-[#EF7044]/10 px-2 py-1 rounded-lg">x{item.quantity}</span>
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
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-[10px] font-black focus:border-[#EF7044] outline-none transition-all tracking-[0.2em]"
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
            <div className="flex justify-center py-4">
               <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {shippingMethods.length > 0 ? shippingMethods.map((method) => (
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
              )) : (
                <div className="text-[10px] uppercase font-black text-white/70 italic text-center py-2">
                  Please provide a valid shipping address to see delivery options.
                </div>
              )}
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
          disabled={isPaying || isLoadingShipping}
          className="w-full bg-[#EF7044] text-white py-5 rounded-full font-black text-[15px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-50"
        >
          {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
        </button>
      </div>
    </div>
  )
}