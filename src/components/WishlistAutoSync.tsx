"use client";

import { useEffect } from "react";

export default function WishlistAutoSync() {
  useEffect(() => {
    const syncWishlistGlobal = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://niconico-backend-production.up.railway.app";
        
        // 1. Cek apakah kustomer sedang login (termasuk yang baru balik dari Google)
        const customerRes = await fetch(`${backendUrl}/store/customers/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }).catch(() => null);

        if (customerRes && customerRes.ok) {
          const { customer } = await customerRes.json();
          
          const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          const backendWishlist = customer?.metadata?.wishlist || [];
          
          // Gabungkan tanpa duplikat
          const mergedWishlist = Array.from(new Set([...localWishlist, ...backendWishlist]));
          
          if (
            JSON.stringify(mergedWishlist) !== JSON.stringify(backendWishlist) || 
            JSON.stringify(mergedWishlist) !== JSON.stringify(localWishlist)
          ) {
            
            // Update Database Medusa
            await fetch(`${backendUrl}/store/customers/me`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                metadata: {
                  ...customer.metadata,
                  wishlist: mergedWishlist
                }
              })
            });
            
            // Update Local Storage
            localStorage.setItem("wishlist", JSON.stringify(mergedWishlist));
          }
        }
      } catch (error) {
        console.error("Auto-sync wishlist error:", error);
      }
    };

    syncWishlistGlobal();
  }, []);

  return null; 
}