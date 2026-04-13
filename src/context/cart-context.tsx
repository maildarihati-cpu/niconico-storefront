"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Fungsi untuk menambah barang ke keranjang
  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  // Logika animasi berdetak (bounce) tiap kali jumlah berubah
  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <CartContext.Provider value={{ cartCount, isCartBouncing, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  // TAMENG ANTI-ERROR: Kalau brankas belum ke-load, kasih nilai kosong (0)
  if (!context) {
    return { cartCount: 0, isCartBouncing: false, addToCart: () => {} };
  }
  return context;
};