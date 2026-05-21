"use server"

import { sdk } from "@lib/config"
import { cookies } from "next/headers"

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

// 🌟 6. Fungsi Inisiasi Pembayaran (Xendit) - KHUSUS MEDUSA V2
export const initiatePaymentAction = async (cartId: string, providerId: string = "xendit") => {
  try {
    // 1. Tarik cart terbaru untuk dapetin ID Payment Collection bawaan v2
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: "*payment_collection"
    });

    let paymentCollectionId = cart.payment_collection?.id;

    // 2. Aturan baru v2: Jika Payment Collection belum ada, wajib dibuat dulu!
    if (!paymentCollectionId) {
      // 🌟 JURUS TUTUP MATA: Tambahkan 'as any' di sini!
      const collectionRes = await sdk.client.fetch(`/store/payment-collections`, {
        method: "POST",
        body: { cart_id: cartId }
      }) as any; 
      
      // Antisipasi format respons dari Medusa
      paymentCollectionId = collectionRes.payment_collection?.id || collectionRes.id;
    }

    // 3. Tembak API Payment Collection (Jalur VIP Medusa v2)
    await sdk.client.fetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: "POST",
      body: { provider_id: providerId }
    });

    // 4. Tarik cart final yang sudah disuntik URL Invoice Xendit
    const finalCartRes = await sdk.store.cart.retrieve(cartId, {
      fields: "*payment_collection,*payment_collection.payment_sessions"
    });

    return finalCartRes.cart;

  } catch (error: any) {
    // Menangkap pesan asli jika masih ada yang menolak
    const errMsg = error?.response?.data || error.message;
    console.error("🔥 Error V2 Medusa:", errMsg);
    throw new Error("Gagal menyambung ke Xendit, silakan coba lagi.");
  }
}

// 🌟 7. FUNGSI BARU: Suntik Email & Customer ID ke Keranjang
export const updateCartInfoAction = async (cartId: string, email: string, customerId?: string) => {
  try {
    // 🚨 KITA CABUT customer_id DARI SINI KARENA DILARANG OLEH MEDUSA V2
    // Cukup kirim email saja. Karena kustomer sudah login, Medusa otomatis 
    // menyambungkan pesanan ini ke riwayat mereka berdasarkan Sesi & Email!
    
    const { cart } = await sdk.store.cart.update(cartId, { email });
    
    return cart;
  } catch (error) {
    console.error("❌ Gagal update info kontak keranjang:", error);
    throw error;
  }
}

// 🌟 8. FUNGSI BARU: Hapus barang yang sudah lunas dari Keranjang Utama
export const cleanUpMainCartAction = async (purchasedVariantIds: string[]) => {
  try {
    const cookieStore = await cookies();
    
    // Ambil ID dari cookie
    const rawCartId = cookieStore.get("_medusa_cart_id")?.value || cookieStore.get("cart_id")?.value;

    // Kalau kosong, langsung stop (Biar TypeScript nggak cerewet 'undefined')
    if (!rawCartId) return false;
    
    // Kita deklarasikan secara paksa bahwa ini pasti teks (string)
    const mainCartId = rawCartId as string; 

    // Tarik isi Keranjang Utama
    const { cart } = await sdk.store.cart.retrieve(mainCartId, { fields: "*items" });
    
    // Pastikan cart.items itu ADA sebelum digeledah (Penangkal 'cart.items is possibly undefined')
    if (!cart || !cart.items) return false;

    // Geledah keranjang: Kalau ada barang yang ID-nya cocok dengan yang baru dibayar, HAPUS!
    for (const item of cart.items) {
      // Pastikan item punya variant_id sebelum di-cek
      if (item.variant_id && purchasedVariantIds.includes(item.variant_id)) {
        await sdk.client.fetch(`/store/carts/${mainCartId}/line-items/${item.id}`, {
          method: "DELETE"
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("❌ Gagal membersihkan barang yang sudah dibayar:", error);
    return false;
  }
}