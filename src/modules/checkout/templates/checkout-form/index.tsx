"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, MapPin, Loader2, Tag, Search, Crosshair, Trash2, ShieldCheck, Plus, Mail, Pen, Phone } from "lucide-react"
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
  const { countryCode } = useParams() as { countryCode: string };
  
  const [cart, setCart] = useState(initialCart)
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  
  const [email, setEmail] = useState(initialCart?.email || customer?.email || "")
  const [guestPhone, setGuestPhone] = useState(initialCart?.shipping_address?.phone || customer?.phone || "")
  
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
  const [isLoadingShipping, setIsLoadingShipping] = useState(true)
  const [showAddressList, setShowAddressList] = useState(false)
  
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [deletedAddressIds, setDeletedAddressIds] = useState<string[]>([]);

  const [countryOptions, setCountryOptions] = useState<any[]>([]);

  const [newAddress, setNewAddress] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    phone: customer?.phone || "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "", 
  })

  // ==========================================
  // 🌟 LOGIKA GROUPING BUNDLE
  // ==========================================
  const groupedItems = useMemo(() => {
    const groups: any[] = [];
    const bundles: Record<string, any[]> = {};

    if (!cart?.items) return groups;

    cart.items.forEach((item: any) => {
      if (item.metadata?.is_bundle && item.metadata?.bundle_id) {
        const bId = item.metadata.bundle_id;
        if (!bundles[bId]) bundles[bId] = [];
        bundles[bId].push(item);
      } else {
        groups.push({ isBundle: false, id: item.id, item });
      }
    });

    Object.keys(bundles).forEach(bId => {
      const items = bundles[bId];
      const topItem = items.find((i: any) => i.metadata?.bundle_type === "TOP") || items[0];
      const bottomItem = items.find((i: any) => i.metadata?.bundle_type === "BOTTOM") || items[1];

      if (topItem && bottomItem) {
        const bundleColor = topItem.metadata?.color || bottomItem.metadata?.color;
        const colorText = bundleColor ? `Color: ${bundleColor} • ` : "";

        groups.push({
          isBundle: true,
          id: bId,
          items: items,
          title: `${topItem.title || "Bundle Product"} (SET)`,
          thumbnail: topItem.thumbnail,
          unit_price: items.reduce((sum: number, i: any) => sum + (i.unit_price || 0), 0),
          quantity: topItem.quantity || 1,
          variant_title: `${colorText}Top: ${topItem.metadata?.size || '-'} / Bottom: ${bottomItem.metadata?.size || '-'}`
        });
      } else {
         items.forEach((i: any) => groups.push({ isBundle: false, id: i.id, item: i }));
      }
    });

    return groups;
  }, [cart?.items]);

  // ==========================================
  // 🌟 FETCH REGION
  // ==========================================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
        
        const res = await fetch(`${backendUrl}/store/regions`, {
          headers: { "x-publishable-api-key": apiKey }
        });
        
        if (res.ok) {
          const data = await res.json();
          const activeRegion = data.regions?.find((r: any) => r.id === cart?.region_id) || data.regions?.[0];
          
          if (activeRegion && activeRegion.countries) {
            const sortedCountries = activeRegion.countries.sort((a: any, b: any) => 
              (a.display_name || a.name).localeCompare(b.display_name || b.name)
            );
            setCountryOptions(sortedCountries);
            
            setNewAddress((prev) => ({
              ...prev,
              country_code: prev.country_code || sortedCountries[0].iso_2
            }));
          }
        }
      } catch (error) {
        console.error("Gagal menarik data negara:", error);
      }
    };
    
    fetchCountries();
  }, [cart?.region_id]);

  // ==========================================
  // 🌟 MAP ENGINE LEAFLET
  // ==========================================
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [searchQueryMap, setSearchQueryMap] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const showAddressForm = isAddingAddress || !customer;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).L) { setLeafletLoaded(true); return; }

    const cssId = "leaflet-css-checkout";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js-checkout";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !showAddressForm) return;
    if (mapInstanceRef.current) return; 

    const L = (window as any).L;
    const defaultLat = -8.6500;
    const defaultLng = 115.2167;

    const map = L.map(mapRef.current, { center: [defaultLat, defaultLng], zoom: 15, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

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

    return () => { 
      resizeObserver.disconnect();
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [leafletLoaded, showAddressForm]); 

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQueryMap || !mapInstanceRef.current) return;
    setIsSearchingMap(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQueryMap)}&limit=1`,
        { headers: { "User-Agent": "NiconicoResortApp" } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 16);
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
    if (!mapInstanceRef.current) return;
    if (navigator.geolocation) {
      setIsMapLoading(true); 
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 16);
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
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
            console.error("Failed to fetch GPS address data:", err);
          } finally {
            setIsMapLoading(false);
          }
        },
        (err) => { 
          alert("Unable to detect GPS. Please enable location permissions in your browser.");
          setIsMapLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const fetchShippingMethods = async (currentCartId: string) => {
    setIsLoadingShipping(true)
    try {
      const options = await getShippingOptionsAction(currentCartId)
      setShippingMethods(options)
      if (options.length > 0) { await handleSelectShipping(options[0].id, currentCartId) }
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
    const syncAddressAndShipping = async () => {
      const availableAddresses = customer?.addresses?.filter((a: any) => !deletedAddressIds.includes(a.id)) || [];

      if (availableAddresses.length === 0) {
        setCart((prev: any) => ({ ...prev, shipping_address: null, shipping_methods: [] }));
        setShippingMethods([]);
        setIsLoadingShipping(false);
        return; 
      }

      if ((!cart?.shipping_address || !cart.shipping_address.address_1) && availableAddresses.length > 0) {
        setIsLoadingShipping(true);
        try {
          const defaultAddress = availableAddresses[0];
          const targetEmail = email || customer?.email || "";
          const updatedCart = await updateCartAddressAction(cart.id, defaultAddress, targetEmail);
          setCart(updatedCart);
          await fetchShippingMethods(updatedCart.id);
        } catch (error) {
          console.error("Failed to auto-sync default address:", error);
          setIsLoadingShipping(false);
        }
        return; 
      }

      if (cart?.shipping_address?.address_1) {
         fetchShippingMethods(cart.id);
      } else {
         setIsLoadingShipping(false);
      }
    };

    syncAddressAndShipping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.id, deletedAddressIds]);

  const handleSelectShipping = async (optionId: string, currentCartId: string = cart.id) => {
    try {
      const updatedCart = await setShippingMethodAction(currentCartId, optionId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error selecting shipping method:", error)
    }
  }

  // ==========================================
  // 🌟 PERBAIKAN: FORCE PUSH API AGAR EMAIL & ALAMAT PASTI MASUK
  // ==========================================
  const handleUpdateAddress = async (address: any) => {
    try {
      setIsLoadingShipping(true);
      const targetEmail = email || customer?.email || "";
      const targetPhone = customer ? address.phone : guestPhone || address.phone;
      
      if (!targetEmail) {
        alert("Email is required!");
        setIsLoadingShipping(false);
        return;
      }
      
      const safeCartAddress = {
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        phone: targetPhone || "",
        address_1: address.address_1 || "",
        city: address.city || "",
        province: address.province || "",
        country_code: address.country_code || "id",
        postal_code: address.postal_code || "",
      };

      // 🌟 LAKUKAN PENYERANGAN API LANGSUNG KE MEDUSA 
      // Memaksa email, shipping, dan billing masuk ke cart!
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
      
      await fetch(`${backendUrl}/store/carts/${cart.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": apiKey
        },
        body: JSON.stringify({
          email: targetEmail,
          shipping_address: safeCartAddress,
          billing_address: safeCartAddress, // Wajib disamakan agar order valid!
          metadata: { is_guest: !customer } // Stempel rahasia untuk Backend
        })
      });
      
      // Update state via Next.js Action bawaan agar cookies tersinkronisasi
      const updatedCart = await updateCartAddressAction(cart.id, safeCartAddress, targetEmail);
      
      setCart(updatedCart);
      setShowAddressList(false);
      setIsAddingAddress(false);
      setEditingAddressId(null);
      
      await fetchShippingMethods(updatedCart.id);
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to add address to cart. Please ensure all data fields are fully filled.");
      setIsLoadingShipping(false);
    }
  }

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setNewAddress({
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      phone: customer?.phone || "",
      address_1: "",
      city: "",
      province: "",
      postal_code: "",
      country_code: countryOptions.length > 0 ? countryOptions[0].iso_2 : "id",
    });
  };

  const handleStartEditAddress = (e: React.MouseEvent, addr: any) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setNewAddress({
      first_name: addr.first_name || "",
      last_name: addr.last_name || "",
      phone: addr.phone || "",
      address_1: addr.address_1 || "",
      city: addr.city || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
      country_code: addr.country_code || (countryOptions.length > 0 ? countryOptions[0].iso_2 : "id"),
    });
    setIsAddingAddress(true);
  };

  const handleSaveNewAddress = async () => {
    const finalPhone = customer ? newAddress.phone : guestPhone;

    if (!newAddress.first_name || !newAddress.address_1 || !newAddress.city || (!customer && !guestPhone) || !email) {
      return alert("Please complete your Contact Details, Name, Address, and City.")
    }
    
    try {
      setIsLoadingShipping(true) 

      const payload = {
        address_name: "Checkout Address",
        first_name: newAddress.first_name,
        last_name: newAddress.last_name,
        phone: finalPhone,
        address_1: newAddress.address_1,
        city: newAddress.city,
        province: newAddress.province,
        country_code: newAddress.country_code,
        postal_code: newAddress.postal_code,
      }

      if (customer) {
        await saveAddressServerAction(payload, editingAddressId) 
      }
      
      // handleUpdateAddress akan mengurus force-push API
      await handleUpdateAddress(payload)
      setEditingAddressId(null)
      
    } catch (error) {
      console.error("Failed to save address:", error)
      alert("Failed to save address. Please make sure your information is correct.")
      setIsLoadingShipping(false)
    }
  }

  const handleDeleteAddress = async (e: React.MouseEvent, addr: any) => {
    e.stopPropagation(); 
    
    const isConfirmed = window.confirm("Are you sure you want to delete this address permanently?");
    if (!isConfirmed) return;

    setDeletingAddressId(addr.id);
    try {
      await deleteAddressServerAction(addr.id);
      setDeletedAddressIds(prev => [...prev, addr.id]);

      if (cart.shipping_address?.address_1 === addr.address_1) {
        setCart((prevCart: any) => ({
          ...prevCart,
          shipping_address: null 
        }));
        setShippingMethods([]); 
      }
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

      if (!email) {
        alert("Please provide an email address for order tracking!")
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

        // ==============================================================
        // 🌟 OBAT CART NYANGKUT: HAPUS COOKIE KERANJANG DI SINI! 🌟
        // ==============================================================
        // Kita paksa browser membuang ingatan tentang keranjang ini
        document.cookie = "_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Baru setelah itu kustomer kita lempar ke Xendit
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
    <div className="w-full min-h-screen bg-gray-50 md:bg-gray-50/50 relative font-sans">
      
      {/* 🌟 LOGO & HEADER DESKTOP/TABLET */}
      <div className="hidden md:flex items-center px-8 py-5 w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto w-full flex items-center">
          <div className="relative w-36 h-10 cursor-pointer" onClick={() => router.push("/")}>
            <Image src="/logo-niconico-black.png" alt="Niconico Resort Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-xl font-bold text-gray-800 ml-6 pl-6 border-l-2 border-gray-300 uppercase tracking-widest">
            Checkout
          </h1>
        </div>
      </div>

      {/* 📱 MOBILE SPECIFIC HEADER */}
      <div className="md:hidden flex items-center px-6 pt-12 pb-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 pr-6 uppercase tracking-widest">
          Check Out
        </h1>
      </div>

      {/* 🌟 MAIN CONTAINER */}
      <div className="px-5 py-6 md:pt-6 pb-32 md:pb-12 md:px-8 max-w-[1200px] mx-auto w-full">
        
        <div className="flex flex-col md:flex-row gap-4 lg:gap-4 relative items-start w-full">
          
          {/* ==================================================== */}
          {/* 💻 LEFT COLUMN */}
          {/* ==================================================== */}
          <div className="w-full flex-1 flex flex-col gap-4 md:gap-4">
            
            {/* 🌟 CARD: SHIPPING ADDRESS */}
            <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-gray-200 p-5 md:p-6 lg:p-7">
              
              {/* 🌟 DUA TAMPILAN: CONTACT INFORMATION (GUEST VS LOGGED IN) */}
              {!customer ? (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block">Contact Information</label>
                    <button onClick={() => router.push(`/${countryCode || 'id'}/cart?auth=login`)} className="text-[10px] md:text-xs font-bold text-[#EF7044] hover:underline">
                      Already have an account? Login here
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:border-[#EF7044] transition-colors">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email for tracking updates..."
                          className="bg-transparent w-full outline-none text-xs md:text-sm font-medium text-gray-800"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:border-[#EF7044] transition-colors">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="tel" 
                          value={guestPhone}
                          onChange={(e) => {
                            setGuestPhone(e.target.value);
                            setNewAddress(prev => ({...prev, phone: e.target.value}));
                          }}
                          placeholder="Phone Number"
                          className="bg-transparent w-full outline-none text-xs md:text-sm font-medium text-gray-800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">* Order confirmation and tracking links will be sent to this email.</p>
                </div>
              ) : (
                <div className="mb-4 pb-4 border-b border-gray-100">
                   <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Buyer Contact Email</label>
                   <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:border-[#EF7044] transition-colors">
                     <Mail className="w-4 h-4 text-gray-400" />
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address..."
                        className="bg-transparent w-full outline-none text-xs md:text-sm font-medium text-gray-800"
                     />
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-[13px] md:text-[16px] font-extrabold text-gray-900 tracking-wide">Shipping Address</h3>
                {showAddressList ? (
                   <button onClick={handleCancelAddressForm} className="text-[11px] md:text-[13px] font-bold text-gray-500 hover:text-[#EF7044]">
                     Cancel
                   </button>
                ) : (
                  <button onClick={() => { setShowAddressList(true); setIsAddingAddress(false); }} className="text-[11px] md:text-[13px] font-bold text-[#EF7044] hover:text-[#EF7044]/80">
                     {customer ? "Choose Another Address" : "Edit Address"}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* 🌟 ADDRESS RENDERER */}
                {showAddressForm ? (
                  <div className="grid gap-3 animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-inner flex flex-col gap-4">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-3">
                        <h4 className="text-sm font-bold text-gray-900">
                          {editingAddressId ? "Edit Address Details" : "Address Details"}
                        </h4>
                        {customer && (
                          <button onClick={handleCancelAddressForm} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        )}
                      </div>
                      
                      <div className="relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden mb-2 border border-gray-300 bg-gray-100">
                        <form onSubmit={handleSearchLocation} className="absolute top-3 left-3 right-3 z-[400]">
                          <div className="bg-white rounded-lg shadow-md flex items-center px-3 py-2 border border-gray-200">
                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                            <input type="text" value={searchQueryMap} onChange={(e) => setSearchQueryMap(e.target.value)} placeholder="Search location on Map..." className="w-full text-xs outline-none text-gray-700 bg-transparent" />
                            <button type="submit" disabled={isSearchingMap} className="text-[10px] bg-[#EF7044] text-white px-3 py-1.5 rounded-md font-bold ml-2">SEARCH</button>
                          </div>
                        </form>
                        <div ref={mapRef} className="w-full h-full relative z-[100]" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                          <div className="relative bottom-4 flex flex-col items-center">
                            <MapPin className="w-8 h-8 text-[#ef7044] fill-white drop-shadow-md" />
                            <div className="w-2 h-2 bg-black/30 rounded-full blur-[2px] mt-0.5" />
                          </div>
                        </div>
                        <button type="button" onClick={handleUseCurrentLocation} className="absolute bottom-3 right-3 bg-white text-gray-800 text-[10px] font-bold px-3 py-2 rounded-lg shadow-md flex items-center gap-1.5 border border-gray-200 z-[400]">
                          <Crosshair className="w-3 h-3" /> Use GPS
                        </button>
                      </div>

                      <div className="flex items-start gap-3 mb-2 px-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        {isMapLoading ? (
                          <p className="text-[11px] text-gray-500 animate-pulse font-medium">Reading map coordinates...</p>
                        ) : (
                          <p className="text-[11px] md:text-xs text-gray-800 leading-relaxed font-semibold">
                            {newAddress.address_1 || "Drag the map to pinpoint the exact delivery coordinates."}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Full Address Details</label>
                            <textarea rows={3} required value={newAddress.address_1} onChange={(e) => setNewAddress({...newAddress, address_1: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" placeholder="Street Name, Building, Landmark..." />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">City / District</label>
                            <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">State / Province</label>
                            <input type="text" required value={newAddress.province} onChange={(e) => setNewAddress({...newAddress, province: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Postal Code</label>
                            <input type="text" required value={newAddress.postal_code} onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" />
                          </div>
                          
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Country</label>
                            <select 
                              value={newAddress.country_code} 
                              onChange={e => setNewAddress({...newAddress, country_code: e.target.value})} 
                              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none appearance-none"
                            >
                              {countryOptions.length > 0 ? (
                                countryOptions.map((c: any) => (
                                  <option key={c.iso_2} value={c.iso_2}>
                                    {c.display_name || c.name} ({c.iso_2.toUpperCase()})
                                  </option>
                                ))
                              ) : (
                                <option value="id">Indonesia (ID)</option>
                              )}
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">First Name</label>
                            <input type="text" required value={newAddress.first_name} onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Last Name</label>
                            <input type="text" required value={newAddress.last_name} onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" />
                          </div>
                          
                          {customer && (
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Phone Number</label>
                              <input type="tel" required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#ef7044] outline-none" placeholder="081234567890" />
                            </div>
                          )}
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        {customer && (
                          <button onClick={handleCancelAddressForm} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50">Cancel</button>
                        )}
                        <button onClick={handleSaveNewAddress} disabled={isLoadingShipping} className="flex-1 bg-[#ef7044] text-white py-2.5 rounded-lg font-bold hover:bg-[#d65f36] text-xs flex justify-center items-center gap-2 disabled:opacity-50">
                          {isLoadingShipping ? <Loader2 className="w-4 h-4 animate-spin" /> : (customer ? (editingAddressId ? "Update Address" : "Save Address") : "Use This Address")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!showAddressList && customer && (
                      <div className="flex gap-4 items-start">
                        <MapPin className="w-5 h-5 text-[#EF7044] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          {cart.shipping_address && cart.shipping_address.address_1 ? (
                            <>
                              <p className="text-sm font-bold text-gray-900 mb-1">{cart.shipping_address.first_name} {cart.shipping_address.last_name}</p>
                              <p className="text-xs text-gray-600 font-medium mb-0.5">{cart.shipping_address.phone}</p>
                              <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed">
                                {cart.shipping_address.address_1}, {cart.shipping_address.city}, {cart.shipping_address.province}, {cart.shipping_address.postal_code}
                              </p>
                            </>
                          ) : (
                            <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => { setShowAddressList(true); setIsAddingAddress(true); setEditingAddressId(null); }}>
                               <p className="text-sm font-bold text-[#EF7044] group-hover:text-[#d65f36] transition-colors">Address Incomplete...</p>
                               <p className="text-[11px] md:text-xs text-gray-500 font-medium">Click here to fill your shipping address.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {showAddressList && customer && (
                      <div className="grid gap-3 animate-in fade-in duration-300">
                        {availableAddresses.length > 0 ? (
                          availableAddresses.map((addr: any) => (
                            <div 
                              key={addr.id}
                              onClick={() => handleUpdateAddress(addr)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                                cart.shipping_address?.address_1 === addr.address_1 
                                ? "border-[#EF7044] bg-orange-50/30" 
                                : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    {addr.first_name} {addr.last_name}
                                    {cart.shipping_address?.address_1 === addr.address_1 && (
                                      <span className="bg-[#EF7044] text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider">PRIMARY</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">{addr.phone}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={(e) => handleStartEditAddress(e, addr)} className="text-gray-400 hover:text-[#EF7044] p-1.5"><Pen className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={(e) => handleDeleteAddress(e, addr)} disabled={deletingAddressId === addr.id} className="text-gray-400 hover:text-red-500 p-1.5">
                                    {deletingAddressId === addr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                {addr.address_1}, {addr.city}, {addr.province}, {addr.postal_code}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl">
                            <p className="text-sm font-bold text-[#EF7044] mb-1">No Address Found...</p>
                            <p className="text-xs font-medium text-gray-400">You don't have any saved addresses.</p>
                          </div>
                        )}
                        <button onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); }} className="w-full py-3.5 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 mt-2 shadow-sm">
                          <Plus className="w-4 h-4" /> Add New Address
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* MOBILE DIVIDER */}
            <div className="h-2 bg-gray-100 md:hidden w-[120%] -ml-6"></div>

            {/* 🌟 CARD: SHIPPING COURIER */}
            <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-gray-200 p-5 md:p-6 lg:p-7">
              <h3 className="text-[13px] md:text-[16px] font-extrabold text-gray-900 tracking-wide mb-4 md:mb-6">Select Shipping</h3>
              
              {isLoadingShipping ? (
                 <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-[#EF7044]" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shippingMethods.length > 0 ? shippingMethods.map((method) => (
                    <div 
                      key={method.id} 
                      onClick={() => handleSelectShipping(method.id)}
                      className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                        cart.shipping_methods?.some((m: any) => m.shipping_option_id === method.id) ? "border-[#EF7044] bg-orange-50/30" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div>
                         <p className={`text-xs font-bold ${cart.shipping_methods?.some((m: any) => m.shipping_option_id === method.id) ? "text-[#EF7044]" : "text-gray-800"}`}>
                           {method.name}
                         </p>
                         <p className="text-[10px] text-gray-500 mt-1 font-medium">Estimated Arrival: 2-3 Days</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">Rp {method.amount?.toLocaleString("id-ID") || 0}</span>
                    </div>
                  )) : (
                    <div className="col-span-1 md:col-span-2 text-xs font-medium text-gray-400 bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                      Address is incomplete. Please fill in your address to see shipping options.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE DIVIDER */}
            <div className="h-2 bg-gray-100 md:hidden w-[120%] -ml-6"></div>

            {/* 🌟 CARD: PURCHASED ITEMS WITH DETAILED VARIANT RENDERER */}
            <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-gray-200 p-5 md:p-6 lg:p-7">
               <h3 className="text-[13px] md:text-[16px] font-extrabold text-gray-900 tracking-wide mb-4 md:mb-6">Your Order</h3>
               <div className="flex flex-col gap-4">
                {groupedItems.length > 0 ? groupedItems.map((group: any, idx: number) => {
                  const displayTitle = group.isBundle ? group.title : (group.item.title || "Product");
                  const displayPrice = group.isBundle ? group.unit_price : (group.item.unit_price || 0);
                  const displayThumb = (group.isBundle ? group.thumbnail : group.item.thumbnail) || "/placeholder.png";
                  let displayVariant = "";
                  if (group.isBundle) { displayVariant = group.variant_title; } else {
                    const regColor = group.item.metadata?.color;
                    const regVariant = group.item.variant?.title || group.item.variant_title || "Regular";
                    displayVariant = regColor ? `Color: ${regColor} • Size: ${regVariant}` : regVariant;
                  }
                  const displayQty = group.isBundle ? group.quantity : (group.item.quantity || 1);

                  return (
                    <div key={group.id} className={`flex gap-4 items-start ${idx !== groupedItems.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img src={displayThumb} className="w-full h-full object-cover" alt={displayTitle} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                         <h4 className="text-xs md:text-sm font-bold text-gray-800 truncate mb-1 pr-4">{displayTitle}</h4>
                         <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1.5">{displayVariant}</p>
                         <div className="flex justify-between items-center mt-1">
                            <p className="text-xs md:text-sm font-extrabold text-gray-900">Rp {displayPrice.toLocaleString("id-ID")}</p>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Qty: {displayQty}</span>
                         </div>
                      </div>
                    </div>
                  );
                }) : (
                   <p className="text-xs text-gray-500">No items to checkout.</p>
                )}
               </div>
            </div>
            
          </div>
          
          {/* ==================================================== */}
          {/* 💻 RIGHT COLUMN (ORDER SUMMARY) */}
          {/* ==================================================== */}
          <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 md:sticky md:top-[100px] mt-6 md:mt-0 pb-10 md:pb-0 z-10">
            
            <div className="bg-white md:rounded-2xl md:shadow-xl md:border border-gray-200 p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.05)]">
               <h3 className="text-[14px] md:text-[16px] font-extrabold text-gray-900 tracking-wide mb-4 border-b border-gray-100 pb-3">
                 Order Summary
               </h3>

               {/* VOUCHER / PROMO */}
               <div className="mb-5">
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Save more with a promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:border-[#EF7044] outline-none" />
                    </div>
                    <button onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCode} className="bg-gray-900 text-white px-4 rounded-lg text-[10px] font-bold hover:bg-gray-700 disabled:bg-gray-300 transition-colors">
                      {isApplyingPromo ? "..." : "APPLY"}
                    </button>
                 </div>
               </div>

               {/* PRICE BREAKDOWN */}
               <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs md:text-[13px] text-gray-600 font-medium"><span>Total Price ({cart.items?.length || 0} items)</span><span>Rp {(cart.subtotal || 0).toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-xs md:text-[13px] text-gray-600 font-medium"><span>Total Shipping Fee</span><span>Rp {(cart.shipping_total || 0).toLocaleString("id-ID")}</span></div>
                  {cart.discount_total > 0 && <div className="flex justify-between text-xs md:text-[13px] text-emerald-600 font-bold"><span>Total Item Discount</span><span>- Rp {cart.discount_total.toLocaleString("id-ID")}</span></div>}
               </div>

               <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center"><span className="text-[14px] md:text-[16px] font-bold text-gray-900">Grand Total</span><span className="text-[16px] md:text-[20px] font-extrabold text-[#EF7044]">Rp {(cart.total || 0).toLocaleString("id-ID")}</span></div>
               </div>

               <button onClick={handlePayNow} disabled={isPaying || isLoadingShipping} className="w-full bg-[#ef7044] text-white py-3.5 rounded-xl font-bold text-sm md:text-[15px] hover:bg-[#d65f36] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Proceed to Payment"}
               </button>

               <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium bg-gray-50 py-2 rounded-lg border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Secure & Encrypted Transaction by Xendit</span>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}