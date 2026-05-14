"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// 1. Kita pisahkan fungsi yang pakai "useSearchParams" ke komponen kecil
function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchTokenFromMedusa = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://niconico-backend-production.up.railway.app"
      
      const queryParams = searchParams.toString()
      if (!queryParams) return

      try {
        const response = await fetch(`${backendUrl}/auth/customer/google/callback?${queryParams}`, {
          method: "GET"
        })
        
        const data = await response.json()

        if (data.token) {
          // LOGIN BERHASIL!
          document.cookie = `_medusa_jwt=${data.token}; path=/; max-age=2592000; secure; samesite=lax`
          window.location.href = "/" 
        } else {
          console.error("Gagal dapat token:", data)
          alert("Login gagal, coba lagi yuk!")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error saat callback:", error)
        router.push("/login")
      }
    }

    fetchTokenFromMedusa()
  }, [searchParams, router])

  // Komponen ini kerja di balik layar aja, jadi return null
  return null
}

// 2. Ini Halaman Utamanya yang membungkus komponen di atas pakai Suspense
export default function GoogleCallbackPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
       {/* Animasi loading tetap jalan di luar */}
       <div className="w-12 h-12 border-4 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 text-gray-500 font-medium text-sm animate-pulse">Menyiapkan akun kamu, tunggu sebentar...</p>
       
       {/* 3. INI DIA OBATNYA! Membungkus data dinamis dengan Suspense */}
       <Suspense fallback={null}>
         <AuthCallbackHandler />
       </Suspense>
    </div>
  )
}