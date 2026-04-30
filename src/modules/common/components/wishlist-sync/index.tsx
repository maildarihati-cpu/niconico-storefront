"use client"

import { useEffect } from "react"
import { updateCustomerWishlist } from "@lib/data/customer"

// 🌟 PERHATIKAN BARIS INI: Kita kasih tau dia wajib nerima { customer }
export default function WishlistSync({ customer }: { customer: any }) {
  useEffect(() => {
    const sync = async () => {
      if (customer) {
        try {
          const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
          
          if (localWishlist.length > 0) {
            const cloudWishlist = (customer.metadata?.wishlist as string[]) || []
            const mergedWishlist = Array.from(new Set([...cloudWishlist, ...localWishlist]))
            
            await updateCustomerWishlist(mergedWishlist)
            localStorage.removeItem("wishlist")
            console.log("Wishlist synced to Medusa, say! 🍍")
          }
        } catch (e) {
          console.error("Gagal sinkronisasi wishlist:", e)
        }
      }
    }
    
    sync()
  }, [customer])

  return null 
}