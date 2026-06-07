"use server"

import { cookies } from "next/headers"
import { revalidateTag, revalidatePath } from "next/cache"

export async function finalizeGoogleLogin(token: string) {
  const cookieStore = await cookies()
  
  // 1. PASANG TOKEN LOGIN
  cookieStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })

  // Bersihkan jejak cookie return_to jika ada biar bersih
  if (cookieStore.get("return_to")) {
    cookieStore.delete("return_to")
  }

  // 2. SAPU BERSIH CACHE (Server Side)
  revalidateTag("customer")
  revalidateTag("customers")
  revalidatePath('/', 'layout') 

  // 3. KEMBALIKAN STATUS SUKSES (Jangan pakai redirect di sini!)
  return { success: true }
}