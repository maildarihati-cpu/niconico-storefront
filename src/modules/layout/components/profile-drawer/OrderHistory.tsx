"use client"

import React, { useState } from "react"
import { X, Package, CheckCircle2, Loader2 } from "lucide-react"

// Import jembatan API yang sudah dibuat di atas (Sesuaikan path-nya)
// import { markOrderDeliveredAction } from "@lib/util/order-util"

interface OrderHistoryProps {
  orders: any[]; // Data murni ditarik dari riwayat customer Medusa
}

export default function OrderHistory({ orders = [] }: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState("Pending")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  // State untuk Optimistic UI (Biar loadingnya mulus saat tombol diklik)
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<string[]>([])

  const tabs = ["Pending", "Prepared", "On The Way", "Delivered"]

  // 🌟 1. LOGIKA KATEGORISASI (Berdasarkan Data Asli + Aturan 7 Hari)
  const getOrderCategory = (order: any) => {
    // A. Cek apakah kustomer barusan klik tombol (Biar tab langsung pindah tanpa nunggu refresh)
    if (optimisticCompletedIds.includes(order.id)) return "Delivered"

    const fStatus = order.fulfillment_status

    // B. Cek Status Asli dari Admin Dashboard
    if (fStatus === "delivered" || order.status === "completed") return "Delivered"

    if (fStatus === "shipped") {
      // C. LOGIKA 7 HARI OTOMATIS DELIVERED
      // Cari kapan paket diserahkan ke kurir
      const shipment = order.fulfillments?.find((f: any) => f.shipped_at)
      const shippedDateStr = shipment?.shipped_at || order.updated_at 
      const shippedDate = new Date(shippedDateStr)
      
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      if (shippedDate < sevenDaysAgo) {
        return "Delivered" // Otomatis pindah ke Delivered jika sudah lewat 7 hari
      }
      return "On The Way"
    }

    if (fStatus === "fulfilled" || fStatus === "partially_shipped") return "Prepared"

    // Default: Jika belum diapa-apain oleh admin
    return "Pending"
  }

  // 🌟 2. FUNGSI KLIK TOMBOL "ORDER DELIVERED"
  const handleMarkAsDelivered = async (orderId: string) => {
    setIsUpdating(true)
    try {
      // 1. Tembak API untuk mengubah status di Dashboard Admin (Buka comment ini nanti)
      // await markOrderDeliveredAction(orderId);

      // 2. Kasih ilusi UI instan pindah tab agar kustomer tidak menunggu loading lama
      setOptimisticCompletedIds(prev => [...prev, orderId])
      setSelectedOrder(null)
      setActiveTab("Delivered")
      
    } catch (error) {
      alert("Gagal memperbarui pesanan. Silakan coba lagi.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter pesanan sesuai tab yang sedang dilihat
  const filteredOrders = orders.filter(order => getOrderCategory(order) === activeTab)

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">
      
      {/* TABS NAVIGATION */}
      <div className="bg-white px-4 pt-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between border-b border-gray-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-3 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? "text-[#EF7044] border-b-2 border-[#EF7044]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ORDER LIST CARDS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-[11px] font-bold uppercase tracking-widest">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[12px] font-black text-gray-900 uppercase italic">Order No. #{order.display_id}</h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {new Date(order.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-[14px] font-black text-[#EF7044]">
                  Rp {(order.total || 0).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Thumbnail Gambar Produk */}
              <div className="flex gap-3 mb-5 overflow-x-auto hide-scrollbar pb-2">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="w-16 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    {item.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm text-[8px] font-black px-1.5 py-0.5 rounded-md">
                        x{item.quantity}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedOrder(order)}
                className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
              >
                Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* 🌟 POPUP MODAL DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => !isUpdating && setSelectedOrder(null)}></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header Popup */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-black text-gray-900 uppercase italic">Order Details</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">#{selectedOrder.display_id}</p>
              </div>
              <button 
                disabled={isUpdating}
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Items List (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-5">
              {selectedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-black text-gray-900 uppercase leading-tight">{item.title}</h4>
                      <p className="text-[9px] text-gray-400 font-black tracking-widest mt-1 uppercase">{item.variant?.title}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-md">QTY: {item.quantity}</span>
                      <span className="text-[12px] font-black">Rp {item.unit_price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-5 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                  <span className="text-[16px] font-black text-[#EF7044]">Rp {(selectedOrder.total || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Action Area (Hanya muncul jika status "On The Way") */}
            {getOrderCategory(selectedOrder) === "On The Way" && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                  disabled={isUpdating}
                  className="w-full bg-[#EF7044] text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg hover:bg-[#d66139] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Order Delivered
                    </>
                  )}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
      
      {/* Global Style untuk Hide Scrollbar tapi tetap bisa scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}