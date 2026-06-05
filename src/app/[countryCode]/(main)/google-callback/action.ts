"use server"

import { cookies } from "next/headers"
import { revalidateTag, revalidatePath } from "next/cache" // 🌟 TAMBAH INI
import { redirect } from "next/navigation"

export async function finalizeGoogleLogin(token: string, fallbackRedirect: string = "/") {
  const cookieStore = await cookies()
  
  // 1. PASANG TOKEN LOGIN
  cookieStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })

  // 2. CEK JEJAK TERAKHIR (Baca cookie return_to jika ada)
  const returnToCookie = cookieStore.get("return_to")?.value
  // Kalau ada jejaknya, lempar ke situ (misal: /checkout). Kalau tidak, pakai default (/)
  const finalRedirect = returnToCookie || fallbackRedirect

  // Hapus jejaknya biar rapi setelah dipakai
  if (returnToCookie) {
    cookieStore.delete("return_to")
  }

  // 3. SAPU BERSIH CACHE (Ini pengganti "Hard Refresh" manual)
  revalidateTag("customer")
  revalidateTag("customers")
  // 🌟 INI KUNCI UTAMANYA: Memaksa Next.js menghapus SEMUA cache UI dari ujung ke ujung!
  revalidatePath('/', 'layout') 

  // 4. LEMPAR USER
  redirect(finalRedirect)
}