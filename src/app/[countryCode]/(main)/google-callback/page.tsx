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
            // 4. Kalau KTP belum ada (401), buatkan baru!
            if (!checkRes.ok) {
              console.log("Profil belum ada, membuat KTP baru ke Medusa...")
              console.log("Data full dari Medusa:", data) // Biar kita bisa intip isinya!
              
              let userEmail = "";
              try {
                // 🌟 JURUS BEDAH TOKEN TINGKAT DEWA (Anti Error Base64)
                const base64Url = data.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                console.log("Isi Payload Token:", payload);

                // Coba cari email asli dulu siapa tau dikasih
                userEmail = data?.auth_identity?.app_metadata?.email || payload?.email || "";

                // 🌟 JURUS BYPASS: Kalau Medusa pelit, kita pakai ID unik jadi email!
                if (!userEmail && payload?.actor_id) {
                  userEmail = `${payload.actor_id}@login-google.com`;
                }
              } catch (e) {
                console.error("Gagal membedah token:", e);
              }

              console.log("Email yang akan didaftarkan:", userEmail);

              // Eksekusi Pendaftaran!
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
                    first_name: "Google",
                    last_name: "User"
                  }) 
                })

                if (!createRes.ok) {
                  const errorData = await createRes.json()
                  console.error("MASIH GAGAL BIKIN KTP:", errorData)
                  alert("Gagal daftar di database. Cek Console!")
                  return // Stop biar layar nggak refresh
                }
              } else {
                console.error("Email atau ID tidak ditemukan sama sekali!");
                alert("Gagal memproses data dari Google. Cek Console!")
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