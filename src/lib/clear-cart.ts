"use server"

import { cookies } from "next/headers"

export async function forceClearCartCookie() {
  // 🌟 PERBAIKAN: Gunakan 'await' karena di Next.js terbaru cookies() adalah Promise
  const cookieStore = await cookies()
  
  // Hancurkan cookie HttpOnly langsung dari jantung Server Next.js
  cookieStore.set("_medusa_cart_id", "", { maxAge: 0, path: "/" })
  cookieStore.set("cart_id", "", { maxAge: 0, path: "/" })
}