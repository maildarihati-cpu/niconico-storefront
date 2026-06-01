import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@/styles/globals.css"
import { Inter } from "next/font/google";
import { retrieveCustomer } from "@lib/data/customer"
import WishlistSync from "@modules/common/components/wishlist-sync"
// 🌟 Import komponen tombol melayang yang baru dibuat
import FloatingButtons from "@modules/common/components/floating-buttons"
// 🌟 IMPORT KOMPONEN GAIB KITA DI SINI
import WishlistAutoSync from "@/components/WishlistAutoSync"
// 🌟 IMPORT SENSOR POSTHOG KITA DI SINI
import { AnalyticsProvider } from "./providers"

// 1. Inisialisasi font Inter
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// 🌟 Gabungkan jadi SATU fungsi utama yang async
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ambil data kustomer secara server-side
  const customer = await retrieveCustomer()

  return (
    <html lang="en" data-mode="light">
      {/* 2. Suntikkan class font Inter di tag body ini */}
      <body className={inter.className}>
        
        {/* 🌟 SELIMUTI SELURUH APLIKASI DENGAN SENSOR ANALYTICS */}
        <AnalyticsProvider>
          
          {/* Panggil komponen satpam kita di sini */}
          <WishlistSync customer={customer} />
          
          {/* 🌟 PASANG KOMPONEN INTEL UNTUK GOOGLE LOGIN DI SINI */}
          <WishlistAutoSync />

          <main className="relative">{children}</main>

          {/* 🌟 Panggil komponen tombol Shop Now & WhatsApp di sini */}
          <FloatingButtons />

        </AnalyticsProvider>

      </body>
    </html>
  );
}