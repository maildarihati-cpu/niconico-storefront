"use client"

import React, { useState } from "react"
import { Search, Truck, Package, MapPin, Loader2 } from "lucide-react"

export default function TrackOrderPage() {
  const [courier, setCourier] = useState("lion") 
  const [resi, setResi] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trackingData, setTrackingData] = useState<any | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resi) return alert("Please enter your tracking number!")

    setIsLoading(true)
    setTrackingData(null)

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier, resi }),
      })

      if (res.ok) {
        const data = await res.json()
        setTrackingData(data)
      } else {
        alert("Tracking number not found or API Error. Please check again.")
      }
    } catch (error) {
      console.error("Tracking error:", error)
      alert("Something went wrong. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // 🌟 PERBAIKAN: Ditambahkan pt-32 agar konten tidak tertutup Navbar Global
    <div className="w-full min-h-screen bg-gray-50/50 font-sans pb-12 pt-32">
      
      {/* ==================================================== */}
      {/* 🌟 MAIN CONTENT CONTAINER */}
      {/* ==================================================== */}
      <div className="max-w-[700px] mx-auto px-4 md:px-8">
        
        {/* HEADER TEXT */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Where is my package?</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Enter your tracking number to check real-time shipment status.</p>
        </div>

        {/* FORM PENCARIAN */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* OPSI EKSPEDISI */}
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Courier</label>
                <select 
                  value={courier} 
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#EF7044] appearance-none cursor-pointer transition-colors"
                >
                  <option value="lion">Lion Parcel</option>
                  <option value="gosend">GoSend</option>
                  <option value="pos">Pos Indonesia</option>
                </select>
              </div>

              {/* INPUT RESI */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Waybill / Tracking Number</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="e.g. LP123456789ID" 
                    value={resi}
                    onChange={(e) => setResi(e.target.value.trim())}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#EF7044] transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="absolute right-2 p-2 bg-[#EF7044] text-white rounded-lg hover:bg-[#d65f36] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* TAMPILAN HASIL TRACKING (TIMELINE) */}
        {trackingData && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-in fade-in duration-300">
            
            {/* Ringkasan Status Atas */}
            <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 mb-6 gap-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Status</p>
                <span className="inline-block bg-orange-50 text-[#EF7044] font-extrabold text-xs px-3 py-1 rounded-full uppercase mt-1">
                  {trackingData.status || "ON THE WAY"}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Courier</p>
                <p className="text-sm font-bold text-gray-800 uppercase mt-0.5">{trackingData.courier_name || courier}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Receiver</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{trackingData.receiver_name || "Customer"}</p>
              </div>
            </div>

            {/* Arsitektur Visual Timeline */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:top-2 before:w-0.5 before:bg-gray-100">
              
              {trackingData.history?.map((history: any, index: number) => (
                <div key={index} className="flex gap-4 relative items-start">
                  
                  {/* Icon Bulatan Status */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${index === 0 ? 'bg-orange-50 border-2 border-[#EF7044] text-[#EF7044]' : 'bg-gray-100 text-gray-400'}`}>
                    {index === 0 ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>

                  {/* Keterangan Teks Status */}
                  <div className="flex-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-xs font-extrabold ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                        {history.status_description || "Package Processed"}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">{history.time || "10:00 WITA"}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed flex items-center gap-1">
                      <MapPin className="w-3 h-3 inline text-gray-400" /> {history.location || "Bali Warehouse"}
                    </p>
                  </div>

                </div>
              ))}

              {/* Dummy fallback jika properti history kosong */}
              {!trackingData.history && (
                <>
                  <div className="flex gap-4 relative items-start">
                    <div className="w-8 h-8 rounded-full bg-orange-50 border-2 border-[#EF7044] text-[#EF7044] flex items-center justify-center shrink-0 z-10"><Truck className="w-4 h-4" /></div>
                    <div className="flex-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                      <div className="flex justify-between items-center mb-1"><p className="text-xs font-extrabold text-gray-900">Courier is delivering your package</p><span className="text-[10px] text-gray-400 font-medium">14:20 WITA</span></div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed"><MapPin className="w-3 h-3 inline text-gray-400" /> Out for Delivery - Denpasar Gateway</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 z-10"><Package className="w-4 h-4" /></div>
                    <div className="flex-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                      <div className="flex justify-between items-center mb-1"><p className="text-xs font-extrabold text-gray-500">Package departed from transit center</p><span className="text-[10px] text-gray-400 font-medium">08:05 WITA</span></div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed"><MapPin className="w-3 h-3 inline text-gray-400" /> Kuta Hub Office</p>
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  )
}