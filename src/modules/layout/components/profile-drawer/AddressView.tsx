"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, MapPin, Search, Crosshair, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveAddressServerAction, setDefaultAddressServerAction } from "@/lib/address-actions";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.includes("railway.app") 
  ? "https://api.niconicoresort.com" 
  : (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com");

interface Props {
  onClose: () => void;
  setView: (view: "menu" | "login" | "signup" | "profile" | "address") => void;
  customer: any;
  onSuccess?: () => Promise<void>;
}

type Step = "list" | "map" | "form";

export default function AddressView({ onClose, setView, customer, onSuccess }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("list");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map & Geocoding States
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // 🌟 PERBAIKAN FATAL: STATE LOKAL MURNI 
  // Kita jadikan localAddresses state tunggal. Tidak ada useEffect yang meniban ulang data ini!
  const [localAddresses, setLocalAddresses] = useState<any[]>(customer?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(localAddresses[0]?.id || null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "Home",
    first_name: "",
    last_name: "",
    phone: "",
    address_1: "",
    notes: "",
    city: "Denpasar", 
    province: "Bali", 
    country_code: "id",
    postal_code: ""
  });

  // 🌟 DYNAMIC LEAFLET CDN LOADER
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

  // 🌟 INITIALIZE MAP ENGINE
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || step !== "map" || mapInstance) return;
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
          setFormData(prev => ({
            ...prev,
            address_1: fullFormatted,
            city: addr.city || addr.town || addr.city_district || "Denpasar",
            province: addr.state || "Bali",
            postal_code: addr.postcode || "80117"
          }));
        }
      } catch (err) {
        console.error("Gagal menjabarkan koordinat peta:", err);
      } finally {
        setIsMapLoading(false);
      }
    });
    return () => { map.remove(); setMapInstance(null); };
  }, [leafletLoaded, step]);

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !mapInstance) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "User-Agent": "NiconicoResortApp" } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapInstance.setView([parseFloat(lat), parseFloat(lon)], 16);
      } else {
        alert("Lokasi tidak ditemukan, silakan ketik lebih spesifik, say.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
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
        (err) => { alert("Gagal mendeteksi GPS. Pastikan izin lokasi browser aktif, say."); }
      );
    }
  };

  const goToList = () => setStep("list");
  
  const goToMap = (addressId?: string) => {
    if (addressId) {
      const addr = localAddresses.find((a: any) => a.id === addressId);
      if (addr) {
        setEditingId(addr.id);
        setFormData({
          label: addr.address_name || "Home",
          first_name: addr.first_name || "",
          last_name: addr.last_name || "",
          phone: addr.phone || "",
          address_1: addr.address_1 || "",
          notes: addr.metadata?.notes || "",
          city: addr.city || "Denpasar",
          province: addr.province || "Bali",
          country_code: addr.country_code || "id",
          postal_code: addr.postal_code || ""
        });
      }
    } else {
      setEditingId(null);
      setFormData({
        label: "Home",
        first_name: customer?.first_name || "",
        last_name: customer?.last_name || "",
        phone: customer?.phone || "",
        address_1: "",
        notes: "",
        city: "Denpasar", province: "Bali", country_code: "id", postal_code: ""
      });
    }
    setStep("map");
  };

  const goToForm = () => setStep("form");

  const handleSaveAddress = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const nameParts = formData.first_name.trim().split(" ");
      const fName = nameParts[0] || "";
      const lName = nameParts.slice(1).join(" ") || formData.last_name;

      const payload = {
        address_name: formData.label,
        first_name: fName,
        last_name: lName,
        phone: formData.phone,
        address_1: formData.address_1,
        city: formData.city,
        province: formData.province,
        country_code: formData.country_code,
        postal_code: formData.postal_code,
        metadata: { notes: formData.notes }
      };

      await saveAddressServerAction(payload, editingId);

      // 🌟 INJEKSI OPTIMISTIS (Data disuntik ke layar detik ini juga tanpa peduli Induk!)
      const newAddressFake = {
        id: editingId || `temp_${Date.now()}`,
        ...payload
      };

      if (editingId) {
        setLocalAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a));
      } else {
        setLocalAddresses(prev => [newAddressFake, ...prev]);
        setSelectedAddressId(newAddressFake.id);
      }

      if (onSuccess) {
        onSuccess(); // Panggil fungsi induk tanpa perlu di-await agar layar tidak freeze
      }
      
      router.refresh();

      setTimeout(() => {
        goToList();
      }, 500);

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getSlideClass = (targetStep: Step) => {
    if (step === targetStep) return "translate-x-0";
    if (step === "list") return "translate-x-full"; 
    if (step === "map" && targetStep === "list") return "-translate-x-full"; 
    if (step === "map" && targetStep === "form") return "translate-x-full"; 
    if (step === "form") return "-translate-x-full"; 
    return "translate-x-full";
  };

const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleChooseAddress = async () => {
    if (!selectedAddressId) return;
    setIsSettingDefault(true);
    try {
      await setDefaultAddressServerAction(selectedAddressId);
      if (onSuccess) await onSuccess();
      router.refresh();
      setView("profile"); // Sukses simpan, baru tutup laci!
    } catch (err) {
      console.error(err);
      alert("Failed to select default address, say.");
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col font-sans antialiased z-[60]">
      
      {/* SCREEN 1: LIST ADDRESS */}
      <div className={`absolute inset-0 bg-gray-50 flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("list")}`}>
        <div className="bg-white flex justify-between items-center px-6 pt-10 pb-4 shadow-sm z-10">
          <button onClick={() => setView("profile")} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide">List Address</h2>
          {localAddresses.length < 3 ? (
            <button onClick={() => goToMap()} className="text-[10px] text-[#ef7044] font-medium hover:underline">
              Add Address
            </button>
          ) : <div className="w-16 text-[9px] text-gray-400 font-mono">Max 3 Limit</div>}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {localAddresses.length === 0 ? (
            <div className="text-center mt-20 text-gray-400 text-xs">No addresses available.</div>
          ) : (
            localAddresses.map((addr: any) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div 
                  key={addr.id} 
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`bg-white rounded-xl p-5 border-2 transition-all cursor-pointer ${isSelected ? "border-[#ef7044] shadow-md bg-orange-50/30" : "border-gray-100 shadow-sm hover:border-gray-200"}`}
                >
                  <p className="text-[10px] text-gray-400 mb-1">{addr.address_name || "Address"}</p>
                  <p className="text-sm font-bold text-[#ef7044] uppercase">{addr.first_name} {addr.last_name}</p>
                  <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                  <p className="text-[10px] text-gray-600 leading-relaxed mb-3 pr-4">
                    {addr.address_1}, {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                  
                  <div className="flex items-center gap-1 text-[10px] text-[#ef7044] font-medium mb-4">
                    <MapPin className="w-3 h-3" /> Pin Point Active
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); goToMap(addr.id); }}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#ef7044] hover:text-[#ef7044] transition-colors"
                  >
                    Change Address / Re-Pin
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white p-5 border-t border-gray-100">
          <button 
          onClick={handleChooseAddress}
          disabled={!selectedAddressId || isSettingDefault}
          className="w-full bg-[#ef7044] text-white py-3.5 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all text-xs tracking-widest uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSettingDefault ? <Loader2 className="w-4 h-4 animate-spin" /> : "Choose Address"}
        </button>
        </div>
      </div>

      {/* SCREEN 2: DYNAMIC PIN POINT MAP */}
      <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("map")}`}>
        <div className="absolute top-0 w-full flex justify-between items-center px-6 pt-10 pb-4 bg-gradient-to-b from-white via-white to-transparent z-20">
          <button onClick={goToList} className="p-1.5 bg-white rounded-full shadow-md border border-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide bg-white px-4 py-1 rounded-full shadow-sm">Pin Point</h2>
          <div className="w-8"></div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchLocation} className="absolute top-24 w-full px-6 z-20">
          <div className="bg-white rounded-full shadow-xl flex items-center px-4 py-1.5 border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik daerah / nama jalan di Bali..." 
              className="w-full text-xs outline-none text-gray-700 py-2 bg-transparent" 
            />
            <button type="submit" disabled={isSearching} className="text-[10px] bg-black text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-2">
              {isSearching ? "..." : "Cari"}
            </button>
          </div>
        </form>

        {/* Real Interactive Map Sheet */}
        <div className="flex-1 bg-gray-100 relative">
          <div ref={mapRef} className="w-full h-full z-10" />
          
          {/* FIXED CENTER PIN OVERLAY (UX GOJEK STYLE) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="relative bottom-5 flex flex-col items-center">
              <MapPin className="w-10 h-10 text-[#ef7044] fill-white drop-shadow-2xl" />
              <div className="w-2 h-2 bg-black/40 rounded-full blur-[2px] mt-0.5 animate-pulse" />
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleUseCurrentLocation}
            className="absolute bottom-6 right-6 bg-white text-[#ef7044] text-[10px] font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 hover:bg-gray-50 border border-gray-100 z-20 animate-in fade-in duration-300"
          >
            <Crosshair className="w-3 h-3 animate-spin-slow" /> Current GPS
          </button>
        </div>

        {/* Bottom Text Description Sheet */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] p-6 z-20 relative border-t border-gray-50">
          <div className="flex items-start gap-3 mb-6 min-h-[40px]">
            <MapPin className="w-4 h-4 text-[#ef7044] shrink-0 mt-0.5 animate-bounce" />
            {isMapLoading ? (
              <p className="text-[11px] text-gray-400 animate-pulse font-medium">Translating map coordinates...</p>
            ) : (
              <p className="text-[11px] text-gray-700 leading-relaxed font-bold line-clamp-2">
                {formData.address_1 || "Geser peta untuk menentukan titik pengiriman utama Niconico Resort."}
              </p>
            )}
          </div>
          <button 
            onClick={goToForm}
            disabled={!formData.address_1 || isMapLoading}
            className="w-full bg-[#ef7044] text-white py-3.5 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all text-xs tracking-widest uppercase disabled:opacity-40"
          >
            Choose Location
          </button>
        </div>
      </div>

      {/* SCREEN 3: DETAIL ADDRESS FORM */}
      <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("form")}`}>
        <div className="flex justify-between items-center px-6 pt-10 pb-4 shadow-sm z-10 border-b border-gray-100">
          <button onClick={() => setStep("map")} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide">Detail Address</h2>
          <div className="w-6"></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="flex-1 overflow-y-auto px-6 pt-6 pb-10 flex flex-col gap-4">
          
          <div className="border border-[#ef7044]/20 rounded-xl p-4 relative bg-gray-50 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 max-w-[75%]">
              <div className="p-2 bg-orange-100 rounded-lg text-[#ef7044]"><MapPin size={16}/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-900 truncate">Selected Pin Point</p>
                <p className="text-[9px] text-gray-500 truncate">{formData.address_1}</p>
              </div>
            </div>
            <button type="button" onClick={() => setStep("map")} className="bg-[#ef7044] text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-black transition-colors">
              Re-Pin
            </button>
          </div>

          {errorMsg && (
             <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-lg flex gap-2">
               <AlertCircle className="w-4 h-4 shrink-0" /> <p>{errorMsg}</p>
             </div>
          )}

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Address Detail/Street Name</label>
            <textarea 
              rows={3}
              required
              value={formData.address_1}
              onChange={(e) => setFormData({...formData, address_1: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Masukkan nomor rumah, gang, atau blok..."
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Notes for Courier</label>
            <input 
              type="text" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Contoh: Gerbang warna putih, taruh di depan pintu aja"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">City / Regency</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-gray-50" />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Postal Code</label>
              <input type="text" required value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none" placeholder="80117" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Address Label (Example: Home, Villa, Office)</label>
            <input 
              type="text" 
              required
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: Rumah Canggu, Villa Uluwatu"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Recipient Name</label>
            <input 
              type="text" 
              required
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Recipient Phone Number</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:border-[#ef7044] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 mt-4 items-start pr-4">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[8px] text-[#ef7044] leading-relaxed font-medium">
              *By saving this address, coordinate data and shipping details will be permanently stored in the Niconico Resort profile database for convenient automatic checkout.*
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-[#ef7044] text-white py-4 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all text-xs tracking-widest uppercase flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Verify Address"}
          </button>
        </form>
      </div>

    </div>
  );
}