"use server"

import { sdk } from "@lib/config"

// 1. Fungsi Pemisah Keranjang (Cart)
export const prepareCheckoutCart = async (mainCart: any, selectedItems: any[]) => {
  try {
    const itemsToInsert = selectedItems.map((item: any) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }))

    const { cart: checkoutCart } = await sdk.store.cart.create({
      region_id: mainCart.region_id,
      sales_channel_id: mainCart.sales_channel_id,
      items: itemsToInsert,
    })

    return checkoutCart.id
  } catch (error) {
    console.error("❌ Gagal memisahkan keranjang:", error)
    return null
  }
}

// 2. Fungsi Update Alamat Checkout
export const updateCartAddressAction = async (cartId: string, address: any) => {
  try {
    const { cart } = await sdk.store.cart.update(cartId, {
      shipping_address: {
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        address_1: address.address_1 || "",
        city: address.city || "",
        country_code: address.country_code || "id", // 🌟 Wajib ada "id"
        postal_code: address.postal_code || "",
        province: address.province || "",
        phone: address.phone || ""
      }
    }, {
      fields: "*shipping_address,*items,*shipping_methods" // 🌟 Minta data lengkap balikannya
    })
    return cart
  } catch (error) {
    console.error("Error update address:", error)
    throw error
  }
}

// 3. Fungsi Ambil Kurir dari Admin
export const getShippingOptionsAction = async (cartId: string) => {
  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId })
    return shipping_options
  } catch (error) {
    console.error("Error get shipping:", error)
    return []
  }
}

// 4. Fungsi Pilih Kurir
export const setShippingMethodAction = async (cartId: string, optionId: string) => {
  try {
    const { cart } = await sdk.store.cart.addShippingMethod(cartId, { option_id: optionId })
    return cart
  } catch (error) {
    console.error("Error set shipping:", error)
    throw error
  }
}

// 5. Fungsi Apply Promo
export const applyPromoCodeAction = async (cartId: string, code: string) => {
  try {
    const { cart } = await sdk.store.cart.update(cartId, { promo_codes: [code] })
    return cart
  } catch (error) {
    console.error("Error apply promo:", error)
    throw error
  }
}

// 🌟 6. Fungsi Inisiasi Pembayaran (Xendit)
export const initiatePaymentAction = async (cartId: string, providerId: string = "xendit") => {
  try {
    // Cari URL backend (fleksibel untuk local maupun production)
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // Nembak API Medusa v2 untuk membuat payment session
    const response = await fetch(`${backendUrl}/store/carts/${cartId}/payment-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      body: JSON.stringify({ 
        provider_id: providerId 
      }),
    })

    if (!response.ok) {
      throw new Error("Gagal menyambung ke Payment Gateway")
    }

    const data = await response.json()
    return data.cart 
  } catch (error) {
    console.error("Error initiate payment:", error)
    throw error
  }
}