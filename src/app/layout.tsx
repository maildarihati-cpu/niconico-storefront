import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@/styles/globals.css"
import localFont from 'next/font/local';
import { retrieveCustomer } from "@lib/data/customer"
import WishlistSync from "@modules/common/components/wishlist-sync"
import FloatingButtons from "@modules/common/components/floating-buttons"
import WishlistAutoSync from "@/components/WishlistAutoSync"
import { AnalyticsProvider } from "./providers"

// 🌟 PERBAIKAN FATAL: Menyamakan huruf besar/kecil persis seperti di GitHub!
const avenir = localFont({
  src: [
    { path: '../fonts/avenir/avenir-light.ttf', weight: '300', style: 'normal' },
    { path: '../fonts/avenir/avenir-book.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/avenir/avenir-regular.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/avenir/avenir-heavy.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/avenir/avenir-Black.ttf', weight: '900', style: 'normal' }, // <-- 'B' kapital sesuai di GitHub
  ],
  variable: '--font-avenir',
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()

  return (
    <html lang="en" data-mode="light" className={avenir.variable}>
      <body className={avenir.className}>
        <AnalyticsProvider>
          <WishlistSync customer={customer} />
          <WishlistAutoSync />
          <main className="relative">{children}</main>
          <FloatingButtons />
        </AnalyticsProvider>
      </body>
    </html>
  );
}