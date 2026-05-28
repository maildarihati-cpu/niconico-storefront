"use client"

import { transferCart } from "@lib/data/customer"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { useEffect } from "react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props

  useEffect(() => {
    // 🌟 LOGIKA PINTAR: Cek apakah user udah login TAPI keranjangnya belum punya ID User
    if (customer && !cart?.customer_id) {
      // Jalankan proses transfer secara diam-diam (Silent Transfer)
      transferCart().catch((error) => {
        console.error("Silent cart transfer failed:", error);
      });
    }
  }, [customer, cart?.customer_id]);

  // 🌟 KUNCI UTAMANYA DI SINI: Jangan pernah render (tampilkan) apapun ke layar!
  return null
}

export default CartMismatchBanner