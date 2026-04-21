"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { retrieveCart } from "@lib/data/cart";

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 1. FUNGSI UNTUK REFRESH DATA DARI BACKEND
  const refreshCart = async () => {
    try {
      const data = await retrieveCart();
      
      // Simpan data cart utuh (biar preview gak error)
      setCart(data);
      
      const totalItems = data?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
      setCartCount(totalItems);

      // Trigger Preview muncul otomatis 3 detik
      if (totalItems > 0) {
        setShowPreview(true);
        setTimeout(() => {
          setShowPreview(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi keranjang:", error);
      setCartCount(0);
      setCart(null);
    }
  };

  // 2. JALANKAN SAAT PERTAMA KALI WEB DIBUKA
  useEffect(() => {
    refreshCart();
  }, []);

  // 3. LOGIKA ANIMASI BOUNCE
  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <CartContext.Provider 
      value={{ 
        cart,            // Data utuh untuk CartPreview
        cartCount,       // Angka untuk Badge
        isCartBouncing, 
        showPreview,     // State untuk pop-up
        setShowPreview, 
        addToCart: refreshCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return { 
      cart: null,
      cartCount: 0, 
      isCartBouncing: false, 
      showPreview: false, 
      addToCart: () => {} 
    };
  }
  return context;
};