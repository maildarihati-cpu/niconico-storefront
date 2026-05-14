"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchTokenFromMedusa = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "[https://niconico-backend-production.up.railway.app](https://niconico-backend-production.up.railway.app)"
      
      // 1. Tangkap kode rahasia yang dibawa Google di URL
      const queryParams = searchParams.toString()
      if (!queryParams) return

      try {
        // 2. Tukarkan kode dari Google dengan Token milik Medusa
        const response = await fetch(`${backendUrl}/auth/customer/google/callback?${queryParams}`, {
          method: "GET"
        })
        
        const data = await response.json()

        if (data.token) {
          // 🌟 3. LOGIN BERHASIL! Simpan Token ke dalam Cookie Browser
          document.cookie = `_medusa_jwt=${data.token}; path=/; max-age=2592000; secure; samesite=lax`
          
          // 4. Lempar user masuk ke halaman utama!
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

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
       <div className="w-12 h-12 border-4 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 text-gray-500 font-medium text-sm animate-pulse">Menyiapkan akun kamu, tunggu sebentar...</p>
    </div>
  )
}