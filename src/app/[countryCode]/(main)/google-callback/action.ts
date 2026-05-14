"use server"

import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function finalizeGoogleLogin(token: string) {
  // 1. Tunggu cookies() siap dulu (Fix untuk error Promise di Next.js terbaru)
  const cookieStore = await cookies();
  
  // 2. Set cookie-nya di Server
  cookieStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 30, // Berlaku 30 hari
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  // 3. OBAT AMNESIA: Hapus ingatan Server soal status "Belum Login"
  revalidateTag("customer");
  revalidateTag("customers");

  // 4. Tendang balik ke beranda dari sisi Server!
  redirect("/");
}