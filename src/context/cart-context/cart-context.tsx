"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { retrieveCart } from "@lib/data/cart";

// Gunakan undefined sebagai default biar lebih aman saat pengecekan
const CartContext = createContext<any>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pakai mounted state buat cegah error Hydration di Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. FUNGSI UNTUK REFRESH DATA DARI BACKEND
  const refreshCart = useCallback(async (shouldShowPreview = false) => {
    try {
      const data = await retrieveCart();
      setCart(data);
      
      const totalItems = data?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
      setCartCount(totalItems);

      // Trigger Preview hanya jika dipicu secara manual (saat klik add to cart)
      if (shouldShowPreview && totalItems > 0) {
        setShowPreview(true);
        const timer = setTimeout(() => {
          setShowPreview(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi keranjang:", error);
      setCartCount(0);
      setCart(null);
    }
  }, []);

  // 2. JALANKAN SAAT PERTAMA KALI WEB DIBUKA
  useEffect(() => {
    if (mounted) {
      refreshCart(false);
    }
  }, [mounted, refreshCart]);

  // 3. LOGIKA ANIMASI BOUNCE
  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Kalau belum mounted, jangan render apa-apa dulu buat hindari "useState null" error
  if (!mounted) return null;

  return (
    <CartContext.Provider 
      value={{ 
        cart,
        cartCount, 
        isCartBouncing, 
        showPreview,
        setShowPreview,
        // Trigger manual dengan true agar popup muncul
        addToCart: () => refreshCart(true) 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  // Kalau dipanggil di luar provider, kasih nilai default agar gak crash
  if (context === undefined) {
    return { 
      cart: null,
      cartCount: 0, 
      isCartBouncing: false, 
      showPreview: false, 
      addToCart: () => {},
      setShowPreview: () => {}
    };
  }
  return context;
};