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
            const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
            
            // 3. Cek Profil KTP ke Medusa
            const checkRes = await fetch(`${backendUrl}/store/customers/me`, {
              method: "GET",
              headers: { 
                "Authorization": `Bearer ${data.token}`,
                "x-publishable-api-key": pubKey 
              }
            })

            // 4. Kalau KTP belum ada (401), buatkan baru!
            if (!checkRes.ok) {
              console.log("Profil belum ada, membuat KTP baru ke Medusa...")
              
              // 🌟 BONGKAR TOKEN BUAT NYARI EMAIL
              let userEmail = "";
              try {
                if (data.auth_identity?.app_metadata?.email) {
                  userEmail = data.auth_identity.app_metadata.email;
                } else {
                  const payload = JSON.parse(atob(data.token.split('.')[1]));
                  userEmail = payload.email || payload.actor_id || ""; 
                }
              } catch (e) {
                console.error("Gagal membedah email dari token:", e);
              }

              // Kalau email ketemu, kita daftarin ke Medusa!
              if (userEmail) {
                const createRes = await fetch(`${backendUrl}/store/customers`, {
                  method: "POST",
                  headers: { 
                    "Authorization": `Bearer ${data.token}`,
                    "Content-Type": "application/json",
                    "x-publishable-api-key": pubKey 
                  },
                  body: JSON.stringify({ 
                    email: userEmail,
                    first_name: "Member", 
                    last_name: "Google"   
                  }) 
                })

                if (!createRes.ok) {
                  const errorData = await createRes.json()
                  console.error("ALASAN GAGAL BIKIN KTP:", errorData)
                  alert("Gagal bikin KTP dari Google. Cek Inspect Element -> Console!")
                  return // Stop biar nggak refresh
                }
              } else {
                console.error("Email dari Google gagal diekstrak!");
                alert("Email tidak ditemukan dari Google.")
                return;
              }
            }
          } catch (err) {
            console.error("Gagal sinkronisasi data customer:", err)
          }

          // 5. CACHE BUSTER & PINDAH KE BERANDA
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