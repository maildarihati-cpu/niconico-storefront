import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveCart } from "@lib/data/cart" 
import { retrieveCustomer } from "@lib/data/customer"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import { sdk } from "@lib/config" // 🌟 Tambahkan import SDK

export const metadata: Metadata = {
  title: "Check Out | Niconico Resort",
}

export default async function CheckoutPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ countryCode: string }>,
  searchParams: Promise<{ cart_id?: string }> // 🌟 Tangkap parameter URL
}) {
  const { countryCode } = await params
  const { cart_id } = await searchParams
  
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(`/${countryCode}/account/login?next=checkout`)
  }

  // 🌟 LOGIKA PINTAR: Pilih Cart yang benar
  let cart;
  if (cart_id) {
    // Jika ada cart_id di URL (hasil uncheck tadi), ambil yang itu
    const response = await sdk.store.cart.retrieve(cart_id, {
        fields: "*items,*shipping_address,*shipping_methods"
    }).catch(() => null)
    cart = response?.cart
  } 

  // Jika tidak ada cart_id di URL atau gagal ambil, pakai cart default
  if (!cart) {
    cart = await retrieveCart()
  }

  if (!cart || !cart.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen font-sans pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        <CheckoutForm cart={cart} customer={customer} />
      </div>
    </div>
  )
}