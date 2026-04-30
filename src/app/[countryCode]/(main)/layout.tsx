import { Metadata } from "next"

import { CartProvider } from "../../../context/cart-context";
import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

// ==========================================
// PENGATURAN METADATA (LOGO TAB & SEO)
// ==========================================
export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Niconico Resort | Island Escape Essentials",
    template: "%s | Niconico Resort",
  },
  description: "Crafted for your island escape. High quality bikinis, swimsuits, and resort wear.",
  icons: {
    icon: "/logo-niconico-white.png", // 👈 Ganti dengan nama file logo di folder public kamu
    shortcut: "/logo-niconico-white.png", // Opsional kalau ada logo khusus shortcut
    apple: "/logo-niconico-white.png", // Opsional kalau ada logo khusus Apple
  },
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  return (
    <CartProvider>
      {/* 1. NAVBAR */}
      <Nav />
      
      {/* 2. BANNER MISMATCH */}
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {/* 3. KONTEN HALAMAN UTAMA */}
      <main className="relative min-h-screen">
        {props.children}
      </main>

      {/* 4. FITUR TAMBAHAN MEDUSA (Free Shipping Nudge) */}
      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}

      {/* 5. FOOTER */}
      <Footer />
    </CartProvider>
  )
}