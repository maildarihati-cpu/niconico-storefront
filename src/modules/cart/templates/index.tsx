"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check, Trash2 } from "lucide-react";
// 🌟 KITA PANGGIL LAGI USECART-NYA BIAR SINKRON
import { useCart } from "@/context/cart-context";
import { updateLineItem, deleteLineItem } from "@lib/data/cart";
import { listProducts } from "@lib/data/products";
import { StoreCart, StoreCustomer } from "@medusajs/types";

interface CartTemplateProps {
  cart: StoreCart | any;
  customer?: StoreCustomer | null;
}

export default function CartTemplate({ cart: initialCart, customer }: CartTemplateProps) {
  const router = useRouter();
  const { countryCode } = useParams();
  
  // 🌟 PAKE CONTEXT LAGI BIAR GAK ERROR ID BASI
  const { cart: contextCart, addToCart: refreshCart } = useCart();
  const cart = contextCart || initialCart;
console.log("ISI METADATA ITEM:", cart?.items?.map((i: any) => i.metadata));

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoadingItem, setIsLoadingItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editProductData, setEditProductData] = useState<any>(null);
  const [selectedNewVariant, setSelectedNewVariant] = useState<any>(null);

  // 🌟 ILMU SULAP GROUPING
  const groupedItems = useMemo(() => {
    const groups: any[] = [];
    const bundles: Record<string, any[]> = {};

    if (!cart?.items) return groups;

    cart.items.forEach((item: any) => {
      // Cek metadata untuk grouping
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
        groups.push({
          isBundle: true,
          id: bId,
          items: items,
          title: `${topItem.title} (SET)`,
          thumbnail: topItem.thumbnail,
          unit_price: items.reduce((sum: number, i: any) => sum + i.unit_price, 0),
          quantity: topItem.quantity,
          // 🌟 AMBIL SIZE DARI METADATA YANG KITA KIRIM TADI
          variant_title: `Top: ${topItem.metadata?.size || 'M'} / Bottom: ${bottomItem.metadata?.size || 'M'}`
        });
      } else {
         items.forEach((i: any) => groups.push({ isBundle: false, id: i.id, item: i }));
      }
    });

    return groups;
  }, [cart?.items]);

  useEffect(() => {
    if (cart?.items) {
      setSelectedItems(cart.items.map((item: any) => item.id));
    }
  }, [cart?.items?.length]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", {
      style: "currency", currency: countryCode === "id" ? "IDR" : "USD", minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPrice = (amount: number) => countryCode === "id" ? amount : amount / 100;

  // 🌟 FUNGSI UPDATE & DELETE DIPERBAIKI
  const handleUpdateQuantity = async (group: any, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoadingItem(group.id);
    try {
      if (group.isBundle) {
        await Promise.all(group.items.map((i: any) => updateLineItem({ lineId: i.id, quantity: newQuantity })));
      } else {
        await updateLineItem({ lineId: group.item.id, quantity: newQuantity });
      }
      await refreshCart(false); 
    } catch (error) {
      console.error("Gagal update qty", error);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const handleRemoveItem = async (group: any) => {
    setIsLoadingItem(group.id);
    try {
      if (group.isBundle) {
        await Promise.all(group.items.map((i: any) => deleteLineItem(i.id)));
      } else {
        await deleteLineItem(group.item.id);
      }
      await refreshCart(false); 
    } catch (error) {
      console.error("Gagal hapus item", error);
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
    if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    const selectedCartItems = cart.items.filter((item: any) => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.1; 
    return { subtotal: getPrice(subtotal), tax: getPrice(tax), total: getPrice(subtotal + tax) };
  };

  const totals = calculateTotals();

  const openEditVariant = async (item: any) => {
    setEditingItem(item);
    const data = await listProducts({
      queryParams: { handle: item.variant.product.handle, fields: "*variants,*variants.prices" },
      countryCode: countryCode as string,
    }).catch(() => null);
    if (data?.response?.products?.[0]) setEditProductData(data.response.products[0]);
  };

  const saveNewVariant = async () => {
    if (!selectedNewVariant || !editingItem) return;
    setIsLoadingItem(editingItem.id);
    setEditingItem(null); 
    try {
      await deleteLineItem(editingItem.id);
      const { addToCart: medusaAddToCart } = await import("@lib/data/cart");
      await medusaAddToCart({ variantId: selectedNewVariant.id, quantity: editingItem.quantity, countryCode: countryCode as string });
      await refreshCart(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingItem(null); setEditProductData(null); setSelectedNewVariant(null);
    }
  };

  return (
    <div className="bg-white min-h-screen relative max-w-[1200px] mx-auto md:max-w-md font-sans flex flex-col">
      <div className="pt-12 pb-6 px-6 relative flex flex-col items-center flex-shrink-0">
        <button onClick={() => router.back()} className="absolute left-6 top-14 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
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

            const displayTitle = group.isBundle ? group.title : group.item.title;
            const displayPrice = group.isBundle ? group.unit_price : group.item.unit_price;
            const displayThumb = group.isBundle ? group.thumbnail : group.item.thumbnail;
            const displayVariant = group.isBundle ? group.variant_title : group.item.variant.title;
            const displayQty = group.isBundle ? group.quantity : group.item.quantity;

            return (
              <div key={group.id} className={`bg-white rounded-[24px] p-3 flex gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="w-[100px] h-[120px] rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={displayThumb} alt={displayTitle} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[15px] text-gray-900 leading-tight pr-2">{displayTitle}</h3>
                    <button onClick={() => handleToggleSelect(group)} className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-[#e28564] text-white" : "border-2 border-gray-200 bg-white"}`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                  <p className="font-bold text-[15px] text-gray-900 mt-1">{formatPrice(getPrice(displayPrice))}</p>
                  
                  {group.isBundle ? (
                     <span className="block mt-1 text-[11px] text-[#e28564] font-bold">{displayVariant}</span>
                  ) : (
                    <button onClick={() => openEditVariant(group.item)} className="text-left mt-1 text-[11px] text-gray-400 font-medium hover:text-[#e28564] transition-colors">
                      {displayVariant}
                    </button>
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

      <div className="mt-10 mx-5 mb-10 bg-[#DF714B] rounded-[32px] p-8 shadow-xl">
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
        <button disabled={selectedItems.length === 0} className={`w-full py-4 rounded-full font-bold text-[15px] transition-all ${selectedItems.length > 0 ? "bg-white text-[#DF714B] shadow-lg active:scale-95" : "bg-white/50 text-white/50 cursor-not-allowed"}`}>
          CHECKOUT NOW.!
        </button>
      </div>
    </div>
  );
}