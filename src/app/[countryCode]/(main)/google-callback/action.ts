"use server"

import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function finalizeGoogleLogin(token: string, redirectTo: string = "/") {
  // 🌟 PERUBAHAN DI SINI: Kita harus 'await' cookies() dulu sebelum di-set!
  const cookieStore = await cookies()
  
  cookieStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })

  revalidateTag("customer")
  revalidateTag("customers")

  redirect(redirectTo)
}