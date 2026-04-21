"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { updateLineItem, deleteLineItem } from "@lib/data/cart";
import { listProducts } from "@lib/data/products";
import { StoreCart, StoreCustomer } from "@medusajs/types"; // Import tipe data Medusa

// --- 1. TAMBAHKAN INTERFACE INI AGAR TIDAK ERROR ---
interface CartTemplateProps {
  cart: StoreCart | any;
  customer?: StoreCustomer | null;
}

// --- 2. PASANG PROPS-NYA DI SINI ---
export default function CartTemplate({ cart: initialCart, customer }: CartTemplateProps) {
  const router = useRouter();
  const { countryCode } = useParams();
  
  // Ambil fungsi refresh dari context
  const { cart: contextCart, addToCart: refreshCart } = useCart();

  // Gunakan data dari context jika ada, kalau tidak pakai initialCart dari props
  const cart = contextCart || initialCart;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoadingItem, setIsLoadingItem] = useState<string | null>(null);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editProductData, setEditProductData] = useState<any>(null);
  const [selectedNewVariant, setSelectedNewVariant] = useState<any>(null);

  useEffect(() => {
    if (cart?.items) {
      const itemIds = cart.items.map((item: any) => item.id);
      setSelectedItems(itemIds);
    }
  }, [cart?.items?.length]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency: countryCode === "id" ? "IDR" : "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPrice = (amount: number) => {
    return countryCode === "id" ? amount : amount / 100;
  };

  const updateQuantity = async (item: any, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoadingItem(item.id);
    try {
      await updateLineItem({
        lineId: item.id,
        quantity: newQuantity,
      });
      await refreshCart(false); 
    } catch (error) {
      console.error("Gagal update qty", error);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsLoadingItem(itemId);
    try {
      await deleteLineItem(itemId);
      await refreshCart(false);
    } catch (error) {
      console.error("Gagal hapus item", error);
    } finally {
      setIsLoadingItem(null);
    }
  };

  const toggleSelect = (itemId: string) => {
    setSelectedItems((prev) => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const calculateTotals = () => {
    if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    const selectedCartItems = cart.items.filter((item: any) => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.1; 
    return {
      subtotal: getPrice(subtotal),
      tax: getPrice(tax),
      shipping: 0,
      total: getPrice(subtotal + tax)
    };
  };

  const totals = calculateTotals();

  const openEditVariant = async (item: any) => {
    setEditingItem(item);
    const data = await listProducts({
      queryParams: { handle: item.variant.product.handle, fields: "*variants,*variants.prices" },
      countryCode: countryCode as string,
    }).catch(() => null);

    if (data?.response?.products?.[0]) {
      setEditProductData(data.response.products[0]);
    }
  };

  const saveNewVariant = async () => {
    if (!selectedNewVariant || !editingItem) return;
    setIsLoadingItem(editingItem.id);
    setEditingItem(null); 
    try {
      await deleteLineItem(editingItem.id);
      const { addToCart: medusaAddToCart } = await import("@lib/data/cart");
      await medusaAddToCart({
        variantId: selectedNewVariant.id,
        quantity: editingItem.quantity,
        countryCode: countryCode as string,
      });
      await refreshCart(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingItem(null);
      setEditProductData(null);
      setSelectedNewVariant(null);
    }
  };

  return (
    <div className="bg-white min-h-screen relative max-w-[1200px] mx-auto md:max-w-md font-sans flex flex-col">
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6 relative flex flex-col items-center flex-shrink-0">
        <button onClick={() => router.back()} className="absolute left-6 top-14 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="w-32 h-10 relative mb-6">
          <Image src="/logo-niconico-black.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-2xl font-medium text-gray-900">Your Cart</h1>
      </div>

      {/* LIST ITEM */}
      <div className="px-5 space-y-4 flex-1">
        {cart?.items?.length > 0 ? (
          cart.items.map((item: any) => {
            const isSelected = selectedItems.includes(item.id);
            const isUpdating = isLoadingItem === item.id;

            return (
              <div key={item.id} className={`bg-white rounded-[24px] p-3 flex gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="w-[100px] h-[120px] rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[15px] text-gray-900 leading-tight pr-2">{item.title}</h3>
                    <button onClick={() => toggleSelect(item.id)} className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-[#e28564] text-white" : "border-2 border-gray-200 bg-white"}`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                  <p className="font-bold text-[15px] text-gray-900 mt-1">{formatPrice(getPrice(item.unit_price))}</p>
                  <button onClick={() => openEditVariant(item)} className="text-left mt-1 text-[11px] text-gray-400 font-medium hover:text-[#e28564] transition-colors">
                    {item.variant.title}
                  </button>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 px-3 py-1 border border-gray-200 rounded-full">
                      <button onClick={() => updateQuantity(item, item.quantity - 1)} className="text-gray-400 hover:text-gray-900 text-lg leading-none">-</button>
                      <span className="text-[13px] font-bold text-gray-800 w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, item.quantity + 1)} className="text-gray-400 hover:text-gray-900 text-lg leading-none">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
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

      {/* SUMMARY */}
      <div className="mt-10 mx-5 mb-10 bg-[#DF714B] rounded-[32px] p-8 shadow-xl">
        <div className="space-y-4 mb-6 text-white">
          <div className="flex justify-between text-sm border-b border-white/20 pb-3">
            <span>Total Price</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-white/20 pb-3">
            <span>Tax</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-1">
            <span>Subtotal</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
        <button disabled={selectedItems.length === 0} className={`w-full py-4 rounded-full font-bold text-[15px] transition-all ${selectedItems.length > 0 ? "bg-white text-[#DF714B] shadow-lg active:scale-95" : "bg-white/50 text-white/50 cursor-not-allowed"}`}>
          CHECKOUT NOW.!
        </button>
      </div>

      {/* POPUP EDIT VARIANT (Sama seperti sebelumnya) */}
      {editingItem && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <div className="relative bg-white w-full max-w-md rounded-t-[40px] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-50">
              <div className="flex gap-4">
                <img src={editingItem.thumbnail} alt="Thumb" className="w-20 h-20 bg-gray-50 rounded-2xl object-cover" />
                <div className="pt-1">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{editingItem.title}</h4>
                  <p className="text-[#DF714B] font-black text-xl">{formatPrice(getPrice(editingItem.unit_price))}</p>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-gray-300 text-4xl hover:text-gray-500">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-black">Change Option</p>
              {!editProductData ? (
                <p className="text-sm text-gray-400">Loading variants...</p>
              ) : (
                <div className="flex flex-wrap gap-3 pb-4">
                  {editProductData.variants?.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedNewVariant(v)} className={`px-6 py-3 rounded-full border-2 font-bold transition-all text-sm ${ (selectedNewVariant?.id === v.id) || (!selectedNewVariant && editingItem.variant.id === v.id) ? "border-[#DF714B] bg-[#DF714B] text-white" : "border-gray-100 text-gray-600 bg-gray-50" }`}>
                      {v.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-8 pt-4 border-t border-gray-50 flex-shrink-0">
              <button onClick={saveNewVariant} disabled={!selectedNewVariant || selectedNewVariant.id === editingItem.variant.id} className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${ selectedNewVariant && selectedNewVariant.id !== editingItem.variant.id ? "bg-[#DF714B] text-white shadow-xl" : "bg-gray-100 text-gray-300 cursor-not-allowed" }`}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}