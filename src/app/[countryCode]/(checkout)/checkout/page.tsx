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
  
  // 🌟 Ambil data customer (jika ada), biarkan null jika guest.
  const customer = await retrieveCustomer().catch(() => null)
  
  // 🚫 SATPAM REDIRECT LOGIN SUDAH DIHAPUS DI SINI! 🚫
  // Jadi sekarang Guest bisa lolos masuk ke halaman ini.

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

  // Cek jika keranjang kosong, baru kembalikan ke halaman cart
  if (!cart || !cart.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  return (
    // 🌟 PERBAIKAN: Hapus "max-w-md", ubah menjadi "w-full"
    // Biarkan komponen CheckoutForm yang mengatur jarak dan grid-nya
    <div className="bg-gray-50 md:bg-gray-50/50 min-h-screen font-sans w-full">
      <CheckoutForm cart={cart} customer={customer} />
    </div>
  )
}