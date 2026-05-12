import React from "react"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Kita hilangkan semua navbar bawaan Medusa di sini
  // dan biarkan halaman merender komponen CheckoutForm kamu secara penuh
  return (
    <div className="bg-[#F9F9F9] min-h-screen w-full relative">
      {children}
    </div>
  )
}