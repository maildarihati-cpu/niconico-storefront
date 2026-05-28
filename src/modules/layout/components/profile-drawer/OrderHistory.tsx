"use client"

import React, { useState } from "react"
import { X, ChevronLeft, Package, Truck, Gift, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

interface OrderHistoryProps {
  orders: any[];
  setView?: (view: string) => void;
  onClose?: () => void;
}

export default function OrderHistory({ orders = [], setView, onClose }: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState("Pending")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<string[]>([])

  const tabs = ["Pending", "Prepared", "On The Way", "Delivered"]

  // Logic Status
  const getOrderCategory = (order: any) => {
    if (optimisticCompletedIds.includes(order.id)) return "Delivered"
    const fStatus = order.fulfillment_status
    if (fStatus === "delivered" || order.status === "completed") return "Delivered"
    if (fStatus === "shipped") {
      const shipment = order.fulfillments?.find((f: any) => f.shipped_at)
      const shippedDate = shipment?.shipped_at ? new Date(shipment.shipped_at) : new Date(order.updated_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      if (shippedDate < sevenDaysAgo) return "Delivered" 
      return "On The Way"
    }
    if (fStatus === "fulfilled" || fStatus === "partially_shipped") return "Prepared"
    return "Pending"
  }

  const handleMarkAsDelivered = async (orderId: string) => {
    setIsUpdating(true)
    try {
      setOptimisticCompletedIds(prev => [...prev, orderId])
      setSelectedOrder(null)
      setActiveTab("Delivered")
    } catch (error) {
      alert("Gagal memperbarui pesanan.")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => getOrderCategory(order) === activeTab)

  // Banner UI Data untuk Popup
  const getBannerData = (status: string) => {
    switch (status) {
      case "Delivered":
        return { bg: "bg-[#20D05B]", title: "Your order is delivered", icon: <Gift className="w-8 h-8 text-white" /> }
      case "On The Way":
        return { bg: "bg-[#1A3382]", title: "Your order is on the way", icon: <Truck className="w-8 h-8 text-white" /> }
      case "Prepared":
        return { bg: "bg-[#EF7044]", title: "Your order is prepared", icon: <Package className="w-8 h-8 text-white" /> }
      default: // Pending
        return { bg: "bg-[#F6BA61]", title: "Your order is pending", icon: <Package className="w-8 h-8 text-white" /> }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900">
      
      {/* 1. HEADER (Sesuai Gambar 1) */}
      <div className="px-6 pt-10 pb-2 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView?.("profile")} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="relative w-28 h-8">
            <Image src="/logo-niconico-black.png" alt="Logo" fill className="object-contain" />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>
        <p className="text-[#EF7044] text-[13px] border-b border-[#EF7044] inline-block pb-0.5 mb-2">My Order</p>
      </div>

      {/* 2. TABS BENTUK KAPSUL (Sesuai Gambar 1) */}
      <div className="px-4 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-[12px] whitespace-nowrap rounded-full border transition-all ${
                activeTab === tab 
                  ? "bg-[#EF7044] text-white border-[#EF7044]" 
                  : "bg-white text-[#EF7044] border-[#EF7044] hover:bg-orange-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ORDER LIST CARD (Sesuai Gambar 1) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/30">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-[12px] font-medium">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-[15px] text-gray-900">Order #{order.display_id}</h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  {new Date(order.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              
              {/* Detail Grid */}
              <div className="space-y-2 text-[12px] text-gray-500 mb-5">
                <div className="flex gap-2">
                  <span className="w-28">Tracking number:</span>
                  <span className="font-bold text-gray-900">{order.fulfillments?.[0]?.tracking_number || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <span className="w-20">Quantity:</span>
                    <span className="font-bold text-gray-900">{order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}</span>
                  </div>
                  <div className="flex gap-2 text-right">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">Rp {(order.total || 0).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center pt-2">
                <span className={`text-[11px] font-extrabold uppercase ${
                  activeTab === "Pending" ? "text-[#F6BA61]" : 
                  activeTab === "Prepared" ? "text-[#EF7044]" :
                  activeTab === "On The Way" ? "text-[#20D05B]" : "text-[#20D05B]"
                }`}>
                  {activeTab}
                </span>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="text-[12px] font-medium border border-gray-800 text-gray-800 px-6 py-1.5 rounded-full hover:bg-gray-900 hover:text-white transition-all"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. POPUP MODAL (Sesuai Gambar 2, 3, 4) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-white md:bg-black/50 md:backdrop-blur-sm flex items-center justify-center">
          
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-[32px] flex flex-col relative overflow-hidden animate-in fade-in duration-200">
            
            {/* Popup Nav */}
            <div className="flex justify-between items-center p-6 shrink-0">
              <button onClick={() => setSelectedOrder(null)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative w-28 h-8">
                <Image src="/logo-niconico-black.png" alt="Logo" fill className="object-contain" />
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="text-center mb-4 shrink-0">
              <h2 className="text-[#EF7044] text-lg font-bold">Order #{selectedOrder.display_id}</h2>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              
              {/* COLORFUL BANNER */}
              <div className={`rounded-[16px] p-5 flex justify-between items-center ${getBannerData(getOrderCategory(selectedOrder)).bg}`}>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">{getBannerData(getOrderCategory(selectedOrder)).title}</h3>
                  <p className="text-white/80 text-[11px]">Rate product to get 5 points for collect.</p>
                </div>
                {getBannerData(getOrderCategory(selectedOrder)).icon}
              </div>

              {/* Order Info */}
              <div className="space-y-3 text-[12px] border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order number</span>
                  <span className="text-gray-900 font-medium">#{selectedOrder.display_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking Number</span>
                  <span className="text-gray-900 font-medium">{selectedOrder.fulfillments?.[0]?.tracking_number || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery address</span>
                  <span className="text-gray-900 font-medium text-right max-w-[60%]">
                    {selectedOrder.shipping_address?.address_1 || "-"}, {selectedOrder.shipping_address?.city || "-"}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-[13px]">
                    <span className="text-gray-600">{item.title} <span className="ml-2 text-gray-400">x{item.quantity}</span></span>
                    <span className="text-gray-900 font-medium">Rp {item.unit_price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-[13px] pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sub Total</span>
                  <span className="text-gray-900 font-bold">Rp {(selectedOrder.subtotal || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900 font-bold">Rp {(selectedOrder.shipping_total || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Total</span>
                  <span className="text-gray-900 font-extrabold text-[15px]">Rp {(selectedOrder.total || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* ACTION BUTTON ON THE WAY */}
              {getOrderCategory(selectedOrder) === "On The Way" && (
                <button 
                  onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                  disabled={isUpdating}
                  className="w-full bg-[#EF7044] text-white py-4 rounded-[16px] font-bold text-[13px] shadow-lg hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "ORDER DELIVERED"}
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}