"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check, Trash2, Loader2 } from "lucide-react"; 
import { useCart } from "@/context/cart-context/cart-context";
import { updateLineItem, deleteLineItem } from "@lib/data/cart";
import { StoreCart, StoreCustomer } from "@medusajs/types";
import { prepareCheckoutCart } from "@lib/util/checkout-util"; 

interface CartTemplateProps {
  cart: StoreCart | any;
  customer?: StoreCustomer | null;
  isOpen?: boolean;
  onClose?: () => void;
  setView?: (view: string) => void;
}

export default function CartTemplate({ cart: initialCart, customer, isOpen = true, onClose, setView }: CartTemplateProps) {
  const router = useRouter();
  const { countryCode } = useParams();
  
  const { cart: contextCart, addToCart: refreshCart } = useCart();
  const cart = contextCart || initialCart;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoadingItem, setIsLoadingItem] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false); 
  
  // 🌟 STATE BARU: Untuk menyimpan ID Variant hantu yang harus disembunyikan
  const [hiddenVariantIds, setHiddenVariantIds] = useState<string[]>([]);

  // ==============================================================
  // 🌟 OBAT GHOSTBUSTER: Hapus Otomatis Item yang Sudah Dibeli!
  // ==============================================================
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const storedStr = localStorage.getItem("niconico_purchased_variants");
    if (storedStr) {
      try {
        const purchasedIds = JSON.parse(storedStr);
        if (Array.isArray(purchasedIds) && purchasedIds.length > 0) {
          
          if (cart?.items?.length > 0) {
            const itemsToRemove = cart.items.filter((item: any) => purchasedIds.includes(item.variant_id));
            
            if (itemsToRemove.length > 0) {
              setHiddenVariantIds(purchasedIds); // Sembunyikan seketika di layar!
              
              // Hapus item dari database secara diam-diam
              Promise.all(itemsToRemove.map((item: any) => deleteLineItem(item.id)))
                .then(() => {
                  localStorage.removeItem("niconico_purchased_variants");
                  refreshCart(false); 
                  // Lepaskan status hide setelah 2 detik agar tidak kedip saat refresh data
                  setTimeout(() => setHiddenVariantIds([]), 2000);
                })
                .catch((e) => {
                  console.error("Gagal menghapus item nyangkut", e);
                  localStorage.removeItem("niconico_purchased_variants");
                });
            } else {
              // Jika item sudah tidak ada di cart, cukup bersihkan memori
              localStorage.removeItem("niconico_purchased_variants");
            }
          }
        }
      } catch (e) {
        console.error("Gagal membaca memori pembelian", e);
      }
    }
  }, [cart?.items, refreshCart]);

  // 🌟 FILTER VISUAL: Hanya tampilkan item yang belum dibeli
  const visibleItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter((item: any) => !hiddenVariantIds.includes(item.variant_id));
  }, [cart?.items, hiddenVariantIds]);

  // ==========================================
  // 🌟 LOGIKA GROUPING MENGGUNAKAN VISIBLE ITEMS
  // ==========================================
  const groupedItems = useMemo(() => {
    const groups: any[] = [];
    const bundles: Record<string, any[]> = {};

    if (!visibleItems) return groups;

    visibleItems.forEach((item: any) => {
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
  }, [visibleItems]);

  useEffect(() => {
    if (visibleItems.length > 0) {
      setSelectedItems(visibleItems.map((item: any) => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [visibleItems.length]); // Hanya dijalankan saat jumlah item berubah

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", {
      style: "currency", currency: countryCode === "id" ? "IDR" : "USD", minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPrice = (amount: number) => countryCode === "id" ? amount : amount / 100;

  const handleUpdateQuantity = async (group: any, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoadingItem(group.id);
    try {
      if (group.isBundle) {
        for (const i of group.items) {
          await updateLineItem({ lineId: i.id, quantity: newQuantity });
        }
      } else {
        await updateLineItem({ lineId: group.item.id, quantity: newQuantity });
      }
      await refreshCart(false); 
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const handleRemoveItem = async (group: any) => {
    setIsLoadingItem(group.id);
    try {
      if (group.isBundle) {
        for (const i of group.items) {
          await deleteLineItem(i.id);
        }
      } else {
        await deleteLineItem(group.item.id);
      }
      await refreshCart(false); 
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const handleToggleSelect = (group: any) => {
    const idsToToggle = group.isBundle ? group.items.map((i: any) => i.id) : [group.item.id];
    setSelectedItems((prev) => {
      const isCurrentlySelected = idsToToggle.every((id: string) => prev.includes(id));
      if (isCurrentlySelected) {
        return prev.filter((id) => !idsToToggle.includes(id));
      } else {
        const newSelection = [...prev];
        idsToToggle.forEach((id: string) => { if (!newSelection.includes(id)) newSelection.push(id); });
        return newSelection;
      }
    });
  };

  const calculateTotals = () => {
    if (!visibleItems || visibleItems.length === 0) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    const selectedCartItems = visibleItems.filter((item: any) => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((acc: number, item: any) => acc + ((item.unit_price || 0) * (item.quantity || 1)), 0);
    const tax = subtotal * 0; 
    return { subtotal: getPrice(subtotal), tax: getPrice(tax), total: getPrice(subtotal + tax) };
  };

  const totals = calculateTotals();

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return;
    
    setIsCheckoutLoading(true);

    try {
      // 🌟 PERBAIKAN: Harus memastikan tidak ada item tersembunyi yang ikut ter-checkout
      const isAllSelected = cart?.items?.length === selectedItems.length && hiddenVariantIds.length === 0;

      if (isAllSelected) {
        if (onClose) onClose(); 
        router.push(`/${countryCode}/checkout`);
      } else {
        const itemsToCheckout = visibleItems.filter((item: any) => selectedItems.includes(item.id));
        const checkoutCartId = await prepareCheckoutCart(cart, itemsToCheckout);

        if (checkoutCartId) {
          if (onClose) onClose(); 
          router.push(`/${countryCode}/checkout?cart_id=${checkoutCartId}`);
        } else {
          console.error("Error creating checkout cart");
        }
      }
    } catch (error) {
      console.error("Error preparing checkout:", error);
    } finally {
      setTimeout(() => setIsCheckoutLoading(false), 2000);
    }
  };

  // 🌟 TOMBOL DARURAT UNTUK RESET KERANJANG
  const handleForceClearCart = () => {
    document.cookie = "_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("niconico_purchased_variants");
    window.location.href = "/";
  };

  const handleSafeClose = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        router.back(); 
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
        onClick={handleSafeClose}
        title="Klik di luar laci untuk menutup"
      />

      <div className="bg-white fixed top-0 right-0 h-full w-full sm:w-[480px] z-[101] shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-300 overflow-y-auto scrollbar-hide font-sans flex flex-col">
        
        <div className="pt-12 pb-6 px-6 relative flex flex-col items-center flex-shrink-0">
          <button 
            type="button" 
            onClick={handleSafeClose}
            className="absolute left-6 top-14 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <div className="w-32 h-10 relative mb-6">
            <Image src="/logo-niconico-black.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-medium text-gray-900">Your Cart</h1>
        </div>

        <div className="px-5 space-y-4 flex-1">
          {groupedItems.length > 0 ? (
            groupedItems.map((group: any) => {
              const isSelected = group.isBundle 
                ? group.items.every((i: any) => selectedItems.includes(i.id))
                : selectedItems.includes(group.item.id);
              const isUpdating = isLoadingItem === group.id;

              const displayTitle = group.isBundle ? group.title : (group.item.title || "Product");
              const displayPrice = group.isBundle ? group.unit_price : (group.item.unit_price || 0);
              const displayThumb = (group.isBundle ? group.thumbnail : group.item.thumbnail) || "/placeholder.png";
              
              let displayVariant = "";
              if (group.isBundle) {
                displayVariant = group.variant_title;
              } else {
                const regColor = group.item.metadata?.color;
                const regVariant = group.item.variant?.title || group.item.variant_title || "Regular";
                displayVariant = regColor ? `Color: ${regColor} • Size: ${regVariant}` : regVariant;
              }
                
              const displayQty = group.isBundle ? group.quantity : (group.item.quantity || 1);

              return (
                <div key={group.id} className={`bg-white rounded-[24px] p-3 flex gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="w-[100px] h-[120px] rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={displayThumb} alt={displayTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[15px] text-gray-900 leading-tight pr-2">{displayTitle}</h3>
                      <button onClick={() => handleToggleSelect(group)} className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-[#EF7044] text-white" : "border-2 border-gray-200 bg-white"}`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </div>
                    <p className="font-bold text-[15px] text-gray-900 mt-1">{formatPrice(getPrice(displayPrice))}</p>
                    
                    {group.isBundle ? (
                       <span className="block mt-1 text-[11px] text-[#EF7044] font-bold">{displayVariant}</span>
                    ) : (
                      <span className="block mt-1 text-[11px] text-gray-400 font-medium">{displayVariant}</span>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 px-3 py-1 border border-gray-200 rounded-full">
                        <button onClick={() => handleUpdateQuantity(group, displayQty - 1)} className="text-gray-400 hover:text-gray-900 text-lg leading-none">-</button>
                        <span className="text-[13px] font-bold text-gray-800 w-3 text-center">{displayQty}</span>
                        <button onClick={() => handleUpdateQuantity(group, displayQty + 1)} className="text-gray-400 hover:text-gray-900 text-lg leading-none">+</button>
                      </div>
                      <button onClick={() => handleRemoveItem(group)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium">Your cart is empty.</p>
            </div>
          )}
        </div>

        <div className="mt-10 mx-5 mb-10 bg-[#EF7044] rounded-[15px] p-8 shadow-xl">
          <div className="space-y-4 mb-6 text-white">
            <div className="flex justify-between text-sm border-b border-white/20 pb-3">
              <span>Total Price</span><span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-white/20 pb-3">
              <span>Tax</span><span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-1">
              <span>Subtotal</span><span>{formatPrice(totals.total)}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={selectedItems.length === 0 || isCheckoutLoading} 
            className={`w-full py-4 rounded-full font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
              selectedItems.length > 0 && !isCheckoutLoading
                ? "bg-white text-[#EF7044] shadow-lg active:scale-95 hover:bg-gray-50" 
                : "bg-white/50 text-white/50 cursor-not-allowed"
            }`}
          >
            {isCheckoutLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                PREPARING...
              </>
            ) : (
              "CHECKOUT NOW.!"
            )}
          </button>

          {/* 🌟 TOMBOL EVAKUASI DARURAT JIKA ADA ERROR */}
          <button 
            onClick={handleForceClearCart}
            className="w-full mt-4 py-2 text-[11px] font-bold text-white/70 hover:text-white underline transition-colors"
          >
            Having cart issues? Reset cart here
          </button>
        </div>
      </div>
    </>
  );
}