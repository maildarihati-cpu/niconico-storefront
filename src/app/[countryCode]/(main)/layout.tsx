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


export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
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
      {/* 1. NAVBAR - Kita aktifkan lagi bos! */}
      <Nav />
      
      {/* 2. BANNER MISMATCH (Pindahkan ke dalam Provider biar aman) */}
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {/* 3. KONTEN HALAMAN UTAMA */}
      <main className="relative">
        {props.children}
      </main>

      {/* 4. FITUR TAMBAHAN MEDUSA */}
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