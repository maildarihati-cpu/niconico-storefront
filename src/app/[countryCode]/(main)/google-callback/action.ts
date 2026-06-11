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

  // 2. BACA DAN BERSIHKAN COOKIE RETURN_TO
  let returnUrl = "/";
  const returnToCookie = cookieStore.get("return_to");
  
  if (returnToCookie && returnToCookie.value) {
    returnUrl = returnToCookie.value; // Simpan URL-nya sebelum dihapus!
    cookieStore.delete("return_to");
  }

  // 3. SAPU BERSIH CACHE (Server Side)
  revalidateTag("customer")
  revalidateTag("customers")
  revalidatePath('/', 'layout') 

  // 4. KEMBALIKAN STATUS SUKSES BESERTA URL ASAL
  return { success: true, returnUrl }
}