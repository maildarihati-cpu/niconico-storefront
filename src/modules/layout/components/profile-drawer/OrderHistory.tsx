"use client"

import React, { useState } from "react"
import { X, ChevronLeft, Package, Truck, Gift, CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

  // 🌟 LOGIC STATUS (SINKRON DENGAN DASHBOARD ADMIN MEDUSA)
  const getOrderCategory = (order: any) => {
    if (optimisticCompletedIds.includes(order.id)) return "Delivered"
    
    const pStatus = order.payment_status
    const fStatus = order.fulfillment_status
    
    if (
      fStatus === "delivered" || 
      order.status === "completed"
    ) {
      return "Delivered"
    }

    if (
      pStatus === "captured" && 
      (fStatus === "shipped" || fStatus === "partially_shipped")
    ) {
      return "On The Way"
    }
    
    if (
      pStatus === "captured" && 
      (fStatus === "not_fulfilled" || fStatus === "fulfilled" || !fStatus)
    ) {
      return "Prepared"
    }

    return "Pending"
  }

  const handleMarkAsDelivered = async (orderId: string) => {
    setIsUpdating(true)
    try {
      setOptimisticCompletedIds(prev => [...prev, orderId])
      setSelectedOrder(null)
      setActiveTab("Delivered")
    } catch (error) {
      alert("Failed to update order.")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => getOrderCategory(order) === activeTab)

  const getBannerData = (status: string) => {
    switch (status) {
      case "Delivered":
        return { bg: "bg-[#20D05B]", title: "Your order is delivered", icon: <Gift className="w-8 h-8 text-white" /> }
      case "On The Way":
        return { bg: "bg-[#1A3382]", title: "Your order is on the way", icon: <Truck className="w-8 h-8 text-white" /> }
      case "Prepared":
        return { bg: "bg-[#EF7044]", title: "Your order is prepared", icon: <Package className="w-8 h-8 text-white" /> }
      default: 
        return { bg: "bg-[#F6BA61]", title: "Your order is pending", icon: <Package className="w-8 h-8 text-white" /> }
    }
  }

  const renderItemDetails = (item: any) => {
    const isBundle = item.metadata?.is_bundle;
    const color = item.metadata?.color;
    const size = item.metadata?.size;
    const bundleType = item.metadata?.bundle_type;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {color && (
          <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
            Color: {color}
          </span>
        )}
        {size && (
          <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
            Size: {size}
          </span>
        )}
        {isBundle && (
          <span className="bg-orange-50 text-[#EF7044] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
            {bundleType || "SET BUNDLE"}
          </span>
        )}
        {!color && !size && (item.variant_title || item.variant?.title) && (
          <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
            Variant: {item.variant_title || item.variant?.title}
          </span>
        )}
      </div>
    );
  };

  // 🌟 FUNGSI PENGECEKAN LINK TRACKING
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900">
      
      {/* Header Utama Order History */}
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/30">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-[12px] font-medium">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const rawTracking = order.fulfillments?.[0]?.tracking_links?.[0]?.url || order.fulfillments?.[0]?.tracking_number || "-";
            const isTrackingUrl = isValidUrl(rawTracking);
            const isShipped = getOrderCategory(order) === "On The Way" || getOrderCategory(order) === "Delivered";

            return (
              <div key={order.id} className="bg-white p-5 rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-[15px] text-gray-900">Order #{order.display_id}</h3>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="space-y-2 text-[12px] text-gray-500 mb-5">
                  <div className="flex gap-2 items-center">
                    <span className="w-28">Tracking Details:</span>
                    {/* 🌟 LOGIC TRACK MY ORDER BERDASARKAN STATUS */}
                    {isShipped && isTrackingUrl ? (
                      <a href={rawTracking} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1A3382] hover:underline flex items-center gap-1">
                        Track My Order <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="font-bold text-gray-900">{rawTracking}</span>
                    )}
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

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-[11px] font-extrabold uppercase ${
                    activeTab === "Pending" ? "text-[#F6BA61]" : 
                    activeTab === "Prepared" ? "text-[#EF7044]" :
                    activeTab === "On The Way" ? "text-[#1A3382]" : "text-[#20D05B]"
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
            );
          })
        )}
      </div>

      {/* 🌟 TRUE POPUP MODAL (FLOATING) 🌟 */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/0 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="bg-white w-full max-w-[400px] max-h-[85vh] rounded-[32px] flex flex-col relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 shrink-0 border-b border-gray-100">
              <button onClick={() => setSelectedOrder(null)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-[#EF7044] text-[15px] font-black italic">ORDER #{selectedOrder.display_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              <div className={`rounded-[16px] p-5 flex justify-between items-center ${getBannerData(getOrderCategory(selectedOrder)).bg}`}>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">{getBannerData(getOrderCategory(selectedOrder)).title}</h3>
                  <p className="text-white/80 text-[11px]">Rate product to get 5 points for collect.</p>
                </div>
                {getBannerData(getOrderCategory(selectedOrder)).icon}
              </div>

              {/* Order Info & Address */}
              <div className="space-y-3 text-[12px] border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order number</span>
                  <span className="text-gray-900 font-medium">#{selectedOrder.display_id}</span>
                </div>
                
                {/* 🌟 LOGIC TRACK MY ORDER DI POPUP DETAIL 🌟 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tracking Link</span>
                  {(() => {
                    const rawTracking = selectedOrder.fulfillments?.[0]?.tracking_links?.[0]?.url || selectedOrder.fulfillments?.[0]?.tracking_number || "-";
                    const isShipped = getOrderCategory(selectedOrder) === "On The Way" || getOrderCategory(selectedOrder) === "Delivered";
                    if (isShipped && isValidUrl(rawTracking)) {
                      return (
                        <a href={rawTracking} target="_blank" rel="noopener noreferrer" className="bg-orange-50 text-[#EF7044] px-3 py-1 rounded-full font-bold text-[11px] hover:bg-[#EF7044] hover:text-white transition-colors flex items-center gap-1">
                          Track Order <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    }
                    return <span className="text-gray-900 font-medium">{rawTracking}</span>;
                  })()}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery address</span>
                  <span className="text-gray-900 font-bold text-right max-w-[60%] leading-tight">
                    {selectedOrder.shipping_address ? (
                      `${selectedOrder.shipping_address.address_1 || ""}, ${selectedOrder.shipping_address.city || ""}`
                    ) : (
                      <span className="text-red-400 italic text-[11px] font-normal">Address data not available</span>
                    )}
                  </span>
                </div>
              </div>

              {/* LIST BARANG */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-[13px] border-b border-dashed border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="flex flex-col max-w-[70%]">
                        <span className="text-gray-900 font-bold leading-tight">
                          {item.product_title || item.title || "Unknown Product"} 
                          <span className="ml-2 text-gray-500 font-black">x{item.quantity}</span>
                        </span>
                        {renderItemDetails(item)}
                      </div>
                      <span className="text-gray-900 font-medium whitespace-nowrap">Rp {(item.unit_price || 0).toLocaleString("id-ID")}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-red-400 italic text-center text-[11px]">Item data not fetched from server.</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-[13px]">
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

              {/* Action Button (Khusus On The Way) */}
              {getOrderCategory(selectedOrder) === "On The Way" && (
                <div className="pt-4">
                  <button 
                    onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                    disabled={isUpdating}
                    className="w-full bg-[#EF7044] text-white py-4 rounded-[16px] font-bold text-[13px] shadow-lg hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "ORDER DELIVERED"}
                  </button>
                </div>
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