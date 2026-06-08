"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Loader2, Tag, CheckCircle2, Mail, Plus, AlertCircle, Search, Crosshair, Trash2 } from "lucide-react"
import Image from "next/image"; 
import { saveAddressServerAction, deleteAddressServerAction } from "@/lib/address-actions";
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
  
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  
  const [deletedAddressIds, setDeletedAddressIds] = useState<string[]>([]);

  const [newAddress, setNewAddress] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    phone: customer?.phone || "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "id", 
  })

  // ==========================================
  // 🌟 MESIN PETA (PIN POINT)
  // ==========================================
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [searchQueryMap, setSearchQueryMap] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || leafletLoaded) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !isAddingAddress || mapInstance) return;
    const L = (window as any).L;
    const defaultLat = -8.6500;
    const defaultLng = 115.2167;
    const map = L.map(mapRef.current, { center: [defaultLat, defaultLng], zoom: 15, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    setMapInstance(map);

    map.on("moveend", async () => {
      const center = map.getCenter();
      setIsMapLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&addressdetails=1`,
          { headers: { "User-Agent": "NiconicoResortApp" } }
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const fullFormatted = data.display_name;
          setNewAddress(prev => ({
            ...prev,
            address_1: fullFormatted,
            city: addr.city || addr.town || addr.city_district || "Denpasar",
            province: addr.state || "Bali",
            postal_code: addr.postcode || "80117"
          }));
        }
      } catch (err) {
        console.error("Failed to parse map coordinates:", err);
      } finally {
        setIsMapLoading(false);
      }
    });
    return () => { map.remove(); setMapInstance(null); };
  }, [leafletLoaded, isAddingAddress]); 

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQueryMap || !mapInstance) return;
    setIsSearchingMap(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQueryMap)}&limit=1`,
        { headers: { "User-Agent": "NiconicoResortApp" } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapInstance.setView([parseFloat(lat), parseFloat(lon)], 16);
      } else {
        alert("Location not found. Please refine your search and try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!mapInstance) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance.setView([latitude, longitude], 16);
        },
        (err) => { alert("Unable to detect GPS. Please enable location permissions in your browser."); }
      );
    }
  };
  // ==========================================

  const fetchShippingMethods = async (currentCartId: string) => {
    setIsLoadingShipping(true)
    try {
      const options = await getShippingOptionsAction(currentCartId)
      setShippingMethods(options)
      
      if (options.length > 0) {
        await handleSelectShipping(options[0].id, currentCartId)
      }
    } catch (error) {
      console.error("Error fetching shipping options:", error)
    } finally {
      setIsLoadingShipping(false)
    }
  }

  useEffect(() => {
    fetchShippingMethods(cart.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.id])

  useEffect(() => {
    const autoSyncDefaultAddress = async () => {
      if ((!cart.shipping_address || !cart.shipping_address.address_1) && customer?.addresses?.length > 0) {
        setIsLoadingShipping(true);
        try {
          const defaultAddress = customer.addresses[0];
          const targetEmail = email || customer?.email || "";
          
          const updatedCart = await updateCartAddressAction(cart.id, defaultAddress, targetEmail);
          setCart(updatedCart);
          
          await fetchShippingMethods(updatedCart.id);
        } catch (error) {
          console.error("Failed to auto-sync default address:", error);
          setIsLoadingShipping(false);
        }
      }
    };

    autoSyncDefaultAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSelectShipping = async (optionId: string, currentCartId: string = cart.id) => {
    try {
      const updatedCart = await setShippingMethodAction(currentCartId, optionId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error selecting shipping method:", error)
    }
  }

  const handleUpdateAddress = async (address: any) => {
    try {
      setIsLoadingShipping(true) 
      const targetEmail = email || customer?.email || "";
      
      const updatedCart = await updateCartAddressAction(cart.id, address, targetEmail)
      setCart(updatedCart) 
      setShowAddressList(false) 
      setIsAddingAddress(false) 
      
      await fetchShippingMethods(updatedCart.id)
    } catch (error) {
      console.error("Error updating address:", error)
      alert("Failed to update address. Please try again.")
      setIsLoadingShipping(false)
    }
  }

  const handleSaveNewAddress = async () => {
    if (!newAddress.first_name || !newAddress.address_1 || !newAddress.city) {
      return alert("Please complete your Name, Address, and City.")
    }
    
    try {
      setIsLoadingShipping(true) 

      const payload = {
        address_name: "Checkout Address",
        first_name: newAddress.first_name,
        last_name: newAddress.last_name,
        phone: newAddress.phone,
        address_1: newAddress.address_1,
        city: newAddress.city,
        province: newAddress.province,
        country_code: newAddress.country_code,
        postal_code: newAddress.postal_code,
      }

      await saveAddressServerAction(payload, null) 
      await handleUpdateAddress(payload)
      
    } catch (error) {
      console.error("Failed to save address:", error)
      alert("Failed to save address to profile. Please make sure your information is correct.")
      setIsLoadingShipping(false)
    }
  }

  const handleDeleteAddress = async (e: React.MouseEvent, addr: any) => {
    e.stopPropagation(); 
    
    const isConfirmed = window.confirm("Are you sure you want to delete this address permanently?");
    if (!isConfirmed) return;

    setDeletingAddressId(addr.id);
    try {
      // 1. Tembak Delete ke Database Medusa (Buku Alamat Customer)
      await deleteAddressServerAction(addr.id);

      // 2. Musnahkan dari list UI saat ini juga
      setDeletedAddressIds(prev => [...prev, addr.id]);

      // 3. Jika itu alamat keranjang, kosongkan UI keranjangnya
      if (cart.shipping_address?.address_1 === addr.address_1) {
        setCart((prevCart: any) => ({
          ...prevCart,
          shipping_address: null 
        }));
        setShippingMethods([]); 
      }

      // 🚫 HAPUS BARIS INI: router.refresh(); 
      // Jangan di-refresh, biar React State saja yang bekerja memanipulasi layar!

    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address. Please try again.");
    } finally {
      setDeletingAddressId(null);
    }
  };

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

  const availableAddresses = customer?.addresses?.filter((a: any) => !deletedAddressIds.includes(a.id)) || [];

  return (
    <div className="flex flex-col h-full bg-white relative font-sans md:max-w-[1200px] xl:max-w-[1400px] mx-auto w-full md:pt-[100px]">
      <div className="relative w-36 h-10 mb-6">
                <Image 
                  src="/logo-niconico-black.png" 
                  alt="Niconico Resort Logo" 
                  fill 
                  className="object-contain" 
                  priority
                />
              </div>
      <div className="md:hidden flex items-center px-6 pt-12 pb-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 pr-6 uppercase tracking-widest">
          Check Out
        </h1>
      </div>

      <div className="px-5 py-6 pb-32 md:pb-12 md:px-8">
        
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-16 xl:gap-24 relative md:items-start w-full">
          
          <div className="md:col-span-7 flex flex-col gap-6 md:gap-10">
            
            {/* CONTACT INFO */}
            <div className="space-y-3">
              <h3 className="text-[10px] md:text-[12px] font-black text-[#EF7044] uppercase tracking-[0.2em] px-1">Contact Info</h3>
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center gap-4 transition-all focus-within:border-[#EF7044] focus-within:bg-white">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                  <Mail className="w-5 h-5 text-[#EF7044]" />
                </div>
                <input 
                  type="email" 
                  placeholder="YOUR EMAIL ADDRESS" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-[11px] md:text-[13px] font-black text-gray-900 outline-none tracking-widest placeholder:text-gray-300"
                />
              </div>
            </div>
            
            {/* SHIPPING ADDRESS */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] md:text-[12px] font-black text-[#EF7044] uppercase tracking-[0.2em]">Shipping Address</h3>
                <button 
                  onClick={() => {
                    setShowAddressList(!showAddressList)
                    setIsAddingAddress(false) 
                  }}
                  className="text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-[#EF7044] underline uppercase italic"
                >
                  {showAddressList ? "Cancel" : "Change Address"}
                </button>
              </div>

              {showAddressList ? (
                <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {isAddingAddress ? (
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-4">
                        <h4 className="text-sm font-bold text-gray-900 tracking-wide">Detail Address</h4>
                        <button onClick={() => setIsAddingAddress(false)} className="p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                          <ChevronLeft className="w-4 h-4 text-gray-800" />
                        </button>
                      </div>

                      <div className="relative w-full h-[220px] rounded-2xl overflow-hidden mb-2 border border-gray-200">
                        <form onSubmit={handleSearchLocation} className="absolute top-3 left-3 right-3 z-[400]">
                          <div className="bg-white rounded-full shadow-md flex items-center px-3 py-1 border border-gray-100">
                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                            <input 
                              type="text" 
                              value={searchQueryMap}
                              onChange={(e) => setSearchQueryMap(e.target.value)}
                              placeholder="Search for a location in Bali..." 
                              className="w-full text-xs outline-none text-gray-700 py-1.5 bg-transparent" 
                            />
                            <button type="submit" disabled={isSearchingMap} className="text-[9px] bg-black text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-2">
                              Search
                            </button>
                          </div>
                        </form>

                        <div ref={mapRef} className="w-full h-full z-[100]" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                          <div className="relative bottom-4 flex flex-col items-center">
                            <MapPin className="w-8 h-8 text-[#ef7044] fill-white drop-shadow-md" />
                            <div className="w-2 h-2 bg-black/30 rounded-full blur-[2px] mt-0.5" />
                          </div>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="absolute bottom-3 right-3 bg-white text-[#ef7044] text-[9px] font-bold px-3 py-2 rounded-full shadow-md flex items-center gap-1.5 border border-gray-100 z-[400]"
                        >
                          <Crosshair className="w-3 h-3" /> GPS
                        </button>
                      </div>

                      <div className="flex items-start gap-3 mb-2 min-h-[40px] px-2">
                        <MapPin className="w-4 h-4 text-[#ef7044] shrink-0 mt-0.5" />
                        {isMapLoading ? (
                          <p className="text-[11px] text-gray-400 animate-pulse font-medium">Translating map coordinates...</p>
                        ) : (
                          <p className="text-[10px] text-gray-700 leading-relaxed font-bold">
                            {newAddress.address_1 || "Drag the map to determine the main delivery point."}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Address Detail/Street Name</label>
                        <textarea 
                          rows={3}
                          required
                          value={newAddress.address_1}
                          onChange={(e) => setNewAddress({...newAddress, address_1: e.target.value})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
                          placeholder="Input your full address here, including street name, building number, etc..."
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
                      {availableAddresses.length > 0 ? (
                        availableAddresses.map((addr: any) => (
                          <div 
                            key={addr.id}
                            onClick={() => handleUpdateAddress(addr)}
                            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative ${
                              cart.shipping_address?.address_1 === addr.address_1 
                              ? "border-[#EF7044] bg-[#EF7044]/5 shadow-sm" 
                              : "border-gray-50 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[11px] font-black text-gray-800 uppercase italic">
                                {addr.first_name} {addr.last_name}
                              </p>
                              
                              <div className="flex items-center gap-2">
                                {cart.shipping_address?.address_1 === addr.address_1 && (
                                  <CheckCircle2 className="w-4 h-4 text-[#EF7044]" />
                                )}
                                
                                <button 
                                  type="button"
                                  onClick={(e) => handleDeleteAddress(e, addr)}
                                  disabled={deletingAddressId === addr.id}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                  title="Delete Address"
                                >
                                  {deletingAddressId === addr.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-medium pr-8">
                              {addr.address_1}, {addr.city}, {addr.province}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 text-center text-[10px] text-gray-400 font-bold uppercase italic border-2 border-dashed border-gray-100 rounded-3xl">
                          Add New Address...
                        </div>
                      )}

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
                <div 
                  className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowAddressList(true);
                    if (availableAddresses.length === 0) setIsAddingAddress(true);
                  }}
                >
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                    <MapPin className="w-5 h-5 text-[#EF7044]" />
                  </div>
                  <div className="flex-1">
                    {/* 🌟 TULISAN "NO ADDRESS FOUND" DIGANTI JADI "ADD NEW ADDRESS..." */}
                    {cart.shipping_address && cart.shipping_address.address_1 ? (
                      <p className="text-[11px] text-gray-600 leading-relaxed uppercase font-medium">
                        <span className="font-black text-gray-900 italic">{cart.shipping_address.first_name} {cart.shipping_address.last_name}</span><br/>
                        {cart.shipping_address.address_1}, {cart.shipping_address.city}
                      </p>
                    ) : (
                      <p className="text-[11px] italic text-[#EF7044] font-bold">Add New Address...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SHIPPING METHOD DI DESKTOP NAIK KE KOLOM KIRI */}
            <div className="space-y-3">
              <h3 className="text-[10px] md:text-[12px] font-black text-[#EF7044] uppercase tracking-[0.2em] px-1">Delivery Method</h3>
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                {isLoadingShipping ? (
                  <div className="flex justify-center py-4">
                     <Loader2 className="w-5 h-5 animate-spin text-[#EF7044]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.length > 0 ? shippingMethods.map((method) => (
                      <div 
                        key={method.id} 
                        onClick={() => handleSelectShipping(method.id)}
                        className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                          cart.shipping_methods?.some((m: any) => m.shipping_option_id === method.id)
                          ? "border-[#EF7044] text-[#EF7044] shadow-md font-black"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-[10px] md:text-[11px] uppercase font-black tracking-wider">{method.name}</span>
                        <span className="text-[12px] md:text-[13px] font-black text-gray-900">Rp {method.amount?.toLocaleString("id-ID") || 0}</span>
                      </div>
                    )) : (
                      <div className="text-[10px] uppercase font-bold text-gray-400 italic text-center py-2">
                        Please provide a valid shipping address to see delivery options.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DETAIL PRODUK */}
            <div className="space-y-4 pt-4 md:pt-6 border-t border-gray-100">
              <h3 className="text-[10px] md:text-[12px] font-black text-[#EF7044] uppercase tracking-[0.2em] px-1 mb-2">Order Items</h3>
              {cart.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-20 h-24 md:w-24 md:h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                    <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[12px] md:text-[14px] font-black text-gray-900 uppercase italic leading-tight">{item.title}</h4>
                      <span className="text-[10px] font-black text-[#EF7044] bg-[#EF7044]/10 px-2 py-1 rounded-lg">x{item.quantity}</span>
                    </div>
                    <p className="text-[14px] md:text-[15px] font-black mt-2 tracking-tight">Rp {item.unit_price.toLocaleString("id-ID")}</p>
                    <p className="text-[9px] md:text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">{item.variant?.title}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
          
          <div className="md:col-span-5 flex flex-col gap-6 md:sticky md:top-[120px] md:h-max mt-8 md:mt-0 pt-8 md:pt-0 border-t border-gray-100 md:border-none">
            
            {/* PROMO */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="PROMO CODE?" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-4 md:py-5 text-[10px] md:text-[11px] font-black focus:border-[#EF7044] outline-none transition-all tracking-[0.2em]"
                />
              </div>
              <button 
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || !promoCode}
                className="bg-black text-white px-8 rounded-2xl text-[10px] md:text-[11px] font-black uppercase disabled:opacity-30 tracking-widest hover:bg-gray-800 transition-colors"
              >
                {isApplyingPromo ? "..." : "APPLY"}
              </button>
            </div>

            {/* GATEWAY & SUMMARY BOX */}
            <div className="bg-[#EF7044] rounded-[24px] p-7 md:p-8 text-white shadow-[0_20px_50px_rgba(239,112,68,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] opacity-90">Gateway</h4>
                <span className="text-[9px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/30 uppercase tracking-tighter">XENDIT SECURE</span>
              </div>
              
              {/* SUMMARY */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-[11px] md:text-[12px] text-white/70 font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">Rp {(cart.subtotal || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[11px] md:text-[12px] text-white/70 font-black uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-white">Rp {(cart.shipping_total || 0).toLocaleString("id-ID")}</span>
                </div>
                {cart.discount_total > 0 && (
                  <div className="flex justify-between text-[11px] md:text-[12px] text-yellow-200 font-black uppercase tracking-widest">
                    <span>Promo applied</span>
                    <span>-Rp {cart.discount_total.toLocaleString("id-ID")}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-6 mt-2 border-t border-white/20">
                  <span className="text-[12px] md:text-[13px] font-black uppercase italic tracking-widest text-white/80 pb-1">Total</span>
                  <span className="text-3xl md:text-4xl font-black tracking-tighter drop-shadow-md">
                    Rp {(cart.total || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayNow}
              disabled={isPaying || isLoadingShipping}
              className="w-full bg-[#ef7044] text-white py-5 md:py-6 rounded-2xl font-heavy text-[15px] md:text-[16px] shadow-xl hover:bg-[white] text-[#ef7044] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Proceed to Pay"}
            </button>
            <p className="text-[9px] text-center text-gray-400 mt-2 uppercase font-bold tracking-widest">
              Clicking Pay will redirect you to secure Xendit Payment.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}