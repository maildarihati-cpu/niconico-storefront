import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"

export const revalidate = 0 // Memaksa data selalu fresh dari backend

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart",
}

export default async function Cart() {
  const cart = await retrieveCart().catch(() => null)
  const customer = await retrieveCustomer().catch(() => null)

  // Fallback jika cart belum dibuat
  const safeCart = cart || { items: [], subtotal: 0, total: 0, region: {} }

  return (
    <div className="bg-white min-h-screen">
      <CartTemplate cart={safeCart as any} customer={customer} />
    </div>
  )
}