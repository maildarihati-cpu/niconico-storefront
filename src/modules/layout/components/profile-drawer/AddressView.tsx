"use client";

import React, { useState } from "react";
import { ChevronLeft, MapPin, Search, Crosshair, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

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

  // Address State
  const addresses = customer?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(addresses[0]?.id || null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    first_name: "",
    last_name: "",
    phone: "",
    address_1: "",
    notes: "",
    city: "Denpasar", // Default placeholder
    province: "Bali", // Default placeholder
    country_code: "id",
    postal_code: "80117"
  });

  // --- NAVIGATION LOGIC ---
  const goToList = () => setStep("list");
  
  const goToMap = (addressId?: string) => {
    if (addressId) {
      const addr = addresses.find((a: any) => a.id === addressId);
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

  // --- API LOGIC (MEDUSA V2) ---
  const handleSaveAddress = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const token = getCookie('_medusa_jwt');

      // Pisahkan nama depan dan belakang dari input gabungan
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

      const endpoint = editingId 
        ? `${BACKEND_URL}/store/customers/me/addresses/${editingId}`
        : `${BACKEND_URL}/store/customers/me/addresses`;

      const response = await fetch(endpoint, {
        method: "POST", // Medusa V2 Address Update & Create pakai POST
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal menyimpan alamat.");

      // 1. Suruh Induk download data terbaru
      if (onSuccess) {
        await onSuccess(); 
      }
      
      // 2. Jurus Anti Cache Next.js
      router.refresh();

      // 3. Kasih jeda setengah detik biar data baru masuk, baru geser ke List
      setTimeout(() => {
        goToList();
      }, 500);

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- SLIDE ANIMATION CLASSES ---
  const getSlideClass = (targetStep: Step) => {
    if (step === targetStep) return "translate-x-0";
    if (step === "list") return "translate-x-full"; // Map & Form ngumpet di kanan
    if (step === "map" && targetStep === "list") return "-translate-x-full"; // List ngumpet di kiri
    if (step === "map" && targetStep === "form") return "translate-x-full"; // Form ngumpet di kanan
    if (step === "form") return "-translate-x-full"; // List & Map ngumpet di kiri
    return "translate-x-full";
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white flex flex-col font-sans antialiased z-[60]">
      
      {/* ========================================================= */}
      {/* SCREEN 1: LIST ADDRESS */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 bg-gray-50 flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("list")}`}>
        
        {/* Header */}
        <div className="bg-white flex justify-between items-center px-6 pt-10 pb-4 shadow-sm z-10">
          <button onClick={() => setView("profile")} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide">List Address</h2>
          {addresses.length < 3 ? (
            <button onClick={() => goToMap()} className="text-[10px] text-[#ef7044] font-medium hover:underline">
              Add Address
            </button>
          ) : <div className="w-16"></div>}
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center mt-20 text-gray-400 text-xs">Belum ada alamat, say. Yuk tambah!</div>
          ) : (
            addresses.map((addr: any) => {
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
                    <MapPin className="w-3 h-3" /> Pin Point
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); goToMap(addr.id); }}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#ef7044] hover:text-[#ef7044] transition-colors"
                  >
                    Change Address
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Button */}
        <div className="bg-white p-5 border-t border-gray-100">
          <button 
            onClick={() => {
              // Harusnya set default address di db, tapi untuk UX kita anggep sukses dan balik ke profile
              setView("profile");
            }}
            disabled={!selectedAddressId}
            className="w-full bg-gray-100 text-[#ef7044] py-3.5 rounded-xl font-bold border border-gray-200 hover:bg-[#ef7044] hover:text-white transition-all text-xs tracking-widest uppercase disabled:opacity-50"
          >
            Choose Address
          </button>
        </div>
      </div>


      {/* ========================================================= */}
      {/* SCREEN 2: PIN POINT MAP */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("map")}`}>
        
        {/* Header Overlay */}
        <div className="absolute top-0 w-full flex justify-between items-center px-6 pt-10 pb-4 bg-gradient-to-b from-white via-white to-transparent z-20">
          <button onClick={goToList} className="p-1.5 bg-white rounded-full shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide bg-white px-4 py-1 rounded-full shadow-sm">Pin Point</h2>
          <div className="w-8"></div>
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute top-24 w-full px-6 z-20">
          <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-3">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input type="text" placeholder="Search Location...." className="w-full text-xs outline-none text-gray-700" />
          </div>
        </div>

        {/* Map Mockup Background */}
        <div className="flex-1 bg-gray-200 relative overflow-hidden">
          {/* Ini cuma styling buat mirip peta, nanti ganti iframe Google Maps */}
          <div className="absolute inset-0 opacity-50 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-8.6705,115.2128&zoom=14&size=600x800&maptype=roadmap&key=YOUR_API_KEY_HERE')] bg-cover bg-center" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative bottom-8 flex flex-col items-center animate-bounce">
              <MapPin className="w-10 h-10 text-[#ef7044] fill-white" />
              <div className="bg-white px-3 py-1 rounded-full shadow-md text-[10px] font-bold mt-1 text-gray-800">Tujuan Cafe</div>
            </div>
          </div>
          
          <button className="absolute bottom-6 right-6 bg-white text-[#ef7044] text-[10px] font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50">
            <Crosshair className="w-3 h-3" /> Use Current Location
          </button>
        </div>

        {/* Bottom Panel */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] p-6 z-20 relative">
          <div className="flex items-start gap-3 mb-6">
            <MapPin className="w-5 h-5 text-[#ef7044] shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              {formData.address_1 || "Jl. Gunung Salak Utara Gg. Shangrila No.1b, Padangsambian Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80117"}
            </p>
          </div>
          <button 
            onClick={goToForm}
            className="w-full bg-[#ef7044] text-white py-3.5 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all text-xs tracking-widest uppercase"
          >
            Choose Location
          </button>
        </div>
      </div>


      {/* ========================================================= */}
      {/* SCREEN 3: DETAIL ADDRESS FORM */}
      {/* ========================================================= */}
      <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-500 ease-in-out ${getSlideClass("form")}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-10 pb-4 shadow-sm z-10 border-b border-gray-100">
          <button onClick={() => setStep("map")} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide">Detail Address</h2>
          <div className="w-6"></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="flex-1 overflow-y-auto px-6 pt-6 pb-10 flex flex-col gap-4">
          
          {/* Mini Map Card */}
          <div className="border border-[#ef7044]/30 rounded-xl p-3 relative h-32 bg-gray-100 overflow-hidden mb-2">
            <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-8.6705,115.2128&zoom=15&size=400x200')] bg-cover bg-center" />
            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md shadow-sm text-[8px] font-bold text-[#ef7044] flex items-center gap-1 z-10">
              <MapPin className="w-3 h-3" /> Jl. Gunung Salak...
            </div>
            <button type="button" onClick={() => setStep("map")} className="absolute top-3 right-3 bg-[#ef7044] text-white text-[8px] font-bold px-3 py-1.5 rounded-md shadow-sm hover:bg-[#d64a1d] z-10">
              Change
            </button>
          </div>

          {errorMsg && (
             <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-lg flex gap-2">
               <AlertCircle className="w-4 h-4 shrink-0" /> <p>{errorMsg}</p>
             </div>
          )}

          {/* Form Inputs */}
          <div>
            <label className="text-[9px] text-gray-400 mb-1 block">Detail Address</label>
            <textarea 
              rows={2}
              required
              value={formData.address_1}
              onChange={(e) => setFormData({...formData, address_1: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: Jl. Gunung Salak Utara..."
            />
          </div>

          <div>
            <label className="text-[9px] text-gray-400 mb-1 block">Notes</label>
            <input 
              type="text" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: Please put the package on the door"
            />
          </div>

          <div>
            <label className="text-[9px] text-gray-400 mb-1 block">Label Address</label>
            <input 
              type="text" 
              required
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: Home, Office"
            />
          </div>

          <div>
            <label className="text-[9px] text-gray-400 mb-1 block">Recipient Name</label>
            <input 
              type="text" 
              required
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: Jeane Anderson"
            />
          </div>

          <div>
            <label className="text-[9px] text-gray-400 mb-1 block">Phone Number</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:border-[#ef7044] outline-none transition-colors"
              placeholder="Ex: +62812345678"
            />
          </div>

          {/* T&C */}
          <div className="flex gap-2 mt-4 items-start pr-4">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[8px] text-[#ef7044] leading-relaxed font-medium">
              *By clicking the button below, you agree to the <span className="font-bold underline">Terms & Conditions</span> and <span className="font-bold underline">Privacy Policy</span> for Niconico Resort's address settings.*
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-[#ef7044] text-white py-4 rounded-xl font-bold border border-[#ef7044] hover:bg-white hover:text-[#ef7044] transition-all text-xs tracking-widest uppercase flex justify-center items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Address"}
          </button>
        </form>
      </div>

    </div>
  );
}