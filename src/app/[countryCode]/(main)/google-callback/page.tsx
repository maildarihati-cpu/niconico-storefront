"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchTokenFromMedusa = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://niconico-backend-production.up.railway.app"
      
      const queryParams = searchParams.toString()
      if (!queryParams) return

      try {
        // 1. Tangkap Kunci Token dari Google
        const response = await fetch(`${backendUrl}/auth/customer/google/callback?${queryParams}`, {
          method: "GET"
        })
        const data = await response.json()

        if (data.token) {
          // 2. Simpan Kunci Token ke Browser
          document.cookie = `_medusa_jwt=${data.token}; path=/; max-age=2592000; secure; samesite=lax`
          
          try {
            // Siapkan Kunci Publik Medusa dari .env kamu
            const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

            // 3. Cek Profil KTP ke Medusa (Sekarang bawa Publishable Key)
            const checkRes = await fetch(`${backendUrl}/store/customers/me`, {
              method: "GET",
              headers: { 
                "Authorization": `Bearer ${data.token}`,
                "x-publishable-api-key": pubKey // 🌟 INI DIA PENYELAMATNYA
              }
            })

            // 4. Kalau KTP belum ada, buatkan baru!
            if (!checkRes.ok) {
              console.log("Profil belum ada, membuat KTP baru ke Medusa...")
              await fetch(`${backendUrl}/store/customers`, {
                method: "POST",
                headers: { 
                  "Authorization": `Bearer ${data.token}`,
                  "Content-Type": "application/json",
                  "x-publishable-api-key": pubKey // 🌟 WAJIB DIBAWA JUGA DI SINI
                },
                body: JSON.stringify({}) 
              })
            }
          } catch (err) {
            console.error("Gagal membuat profil customer:", err)
          }

          // 5. CACHE BUSTER: Suruh Next.js hapus ingatan lama, lalu pindah ke Beranda
          router.refresh()
          setTimeout(() => {
            router.push("/")
          }, 500)

        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error total:", error)
        router.push("/login")
      }
    }

    fetchTokenFromMedusa()
  }, [searchParams, router])

  return null
}

export default function GoogleCallbackPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
       <div className="w-12 h-12 border-4 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 text-gray-500 font-medium text-sm animate-pulse">Menyiapkan akun kamu, tunggu sebentar...</p>
       
       <Suspense fallback={null}>
         <AuthCallbackHandler />
       </Suspense>
    </div>
  )
}