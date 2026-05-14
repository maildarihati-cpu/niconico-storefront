"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { finalizeGoogleLogin } from "./action"

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
          try {
            const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
            
            // 2. Cek Profil KTP ke Medusa
            const checkRes = await fetch(`${backendUrl}/store/customers/me`, {
              method: "GET",
              headers: { 
                "Authorization": `Bearer ${data.token}`,
                "x-publishable-api-key": pubKey 
              }
            })

            // 3. Kalau KTP belum ada (401), buatkan baru!
            if (!checkRes.ok) {
              console.log("Profil belum ada, membuat KTP baru ke Medusa...")
              
              let userEmail = "";
              let firstName = "Google";
              let lastName = "User";

              try {
                // 🌟 JURUS BEDAH TOKEN TINGKAT DEWA
                const base64Url = data.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                
                // Tarik data asli dari "user_metadata"
                userEmail = payload?.user_metadata?.email || "";
                firstName = payload?.user_metadata?.given_name || payload?.user_metadata?.name || "Member";
                lastName = payload?.user_metadata?.family_name || ""; 
                
              } catch (e) {
                console.error("Gagal membedah token:", e);
              }

              console.log("Mendaftarkan KTP Asli:", userEmail, firstName, lastName);

              // Eksekusi Pendaftaran Pakai Data Asli!
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
                    first_name: firstName,
                    last_name: lastName
                  }) 
                })

                if (!createRes.ok) {
                  const errorData = await createRes.json()
                  console.error("MASIH GAGAL BIKIN KTP:", errorData)
                  alert("Gagal daftar di database. Cek Console!")
                  return 
                }
              } else {
                console.error("Email asli tidak ditemukan sama sekali!");
                alert("Gagal memproses email aslimu. Cek Console!")
                return;
              }
            }
          } catch (err) {
            console.error("Gagal sinkronisasi data customer:", err)
          }

          // 4. 🌟 JURUS PAMUNGKAS: Bangunkan Server Next.js & Hapus Cache!
          console.log("Data siap, memproses sesi login di Server...");
          await finalizeGoogleLogin(data.token);

        } else {
          // Kalau ga ada token, lempar ke beranda
          router.push("/")
        }
      } catch (error) {
        console.error("Error total:", error)
        router.push("/")
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