"use server"

import { sdk } from "@lib/config"
import { cookies } from "next/headers"

// 🌟 HELPER SAKTI
const getAuthHeaders = async () => {
  try {
    const cookieStore = await cookies(); 
    const cookieString = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join("; ");
    return { Cookie: cookieString } as any;
  } catch (error) {
    return {} as any;
  }
}

// 🌟 1. METODE PANGKAS & SIMPAN (ANTI DITOLAK MEDUSA)
export const prepareCheckoutCart = async (mainCart: any, selectedItems: any[]) => {
  try {
    const headers = await getAuthHeaders();
    const cookieStore = await cookies();
    
    // Ambil ID barang yang dipilih untuk dibeli
    const selectedVariantIds = selectedItems.map((i: any) => i.variant_id);

    // A. Cari barang yang TIDAK dicentang (yang mau ditinggal)
    const unselectedItems = mainCart.items.filter(
      (item: any) => !selectedVariantIds.includes(item.variant_id)
    ).map((item: any) => ({
      variant_id: item.variant_id,
      quantity: item.quantity
    }));

    // B. Simpan barang yang tertinggal ke dalam "Brankas Cookie"
    if (unselectedItems.length > 0) {
      const savedData = {
        region_id: mainCart.region_id,
        sales_channel_id: mainCart.sales_channel_id,
        items: unselectedItems
      };
      // Simpan dengan nama niconico_saved_cart
      cookieStore.set("niconico_saved_cart", JSON.stringify(savedData), { path: "/" });
    }

    // C. PANGKAS barang yang tidak dicentang dari Keranjang Orisinil
    for (const item of mainCart.items) {
      if (!selectedVariantIds.includes(item.variant_id)) {
        await (sdk.client as any).fetch(`/store/carts/${mainCart.id}/line-items/${item.id}`, {
          method: "DELETE",
          headers
        });
      }
    }

    // D. Kembalikan ID Keranjang Orisinil! (Medusa tidak akan bisa menolak keranjang ini)
    return mainCart.id;
  } catch (error) {
    console.error("❌ Gagal memangkas keranjang:", error);
    return null;
  }
}

// 2. Fungsi Update Alamat 
export const updateCartAddressAction = async (cartId: string, address: any, email?: string) => {
  try {
    const headers = await getAuthHeaders();
    const payload: any = {
      shipping_address: {
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        address_1: address.address_1 || "",
        city: address.city || "",
        country_code: address.country_code || "id", 
        postal_code: address.postal_code || "",
        province: address.province || "",
        phone: address.phone || ""
      }
    };
    if (email) payload.email = email;
    const { cart } = await (sdk.store.cart as any).update(
      cartId, payload, { fields: "*shipping_address,*items,*shipping_methods" }, headers
    );
    return cart;
  } catch (error) { throw error; }
}

// 3. Fungsi Ambil Kurir 
export const getShippingOptionsAction = async (cartId: string) => {
  try {
    const headers = await getAuthHeaders();
    const { shipping_options } = await (sdk.store.fulfillment as any).listCartOptions({ cart_id: cartId }, headers);
    return shipping_options;
  } catch (error) { return []; }
}

// 4. Fungsi Pilih Kurir
export const setShippingMethodAction = async (cartId: string, optionId: string) => {
  try {
    const headers = await getAuthHeaders();
    const { cart } = await (sdk.store.cart as any).addShippingMethod(cartId, { option_id: optionId }, undefined, headers);
    return cart;
  } catch (error) { throw error; }
}

// 5. Fungsi Apply Promo
export const applyPromoCodeAction = async (cartId: string, code: string) => {
  try {
    const headers = await getAuthHeaders();
    const { cart } = await (sdk.store.cart as any).update(cartId, { promo_codes: [code] }, undefined, headers);
    return cart;
  } catch (error) { throw error; }
}

// 6. Fungsi Inisiasi Pembayaran (Xendit) 
export const initiatePaymentAction = async (cartId: string, providerId: string = "xendit") => {
  try {
    const headers = await getAuthHeaders();
    const { cart: checkCart } = await (sdk.store.cart as any).retrieve(cartId, { fields: "*shipping_methods,*payment_collection" }, headers);

    if (!checkCart.shipping_methods || checkCart.shipping_methods.length === 0) {
      throw new Error("Ongkos kirim belum terpasang sempurna. Silakan pilih ulang kurir Anda.");
    }

    let paymentCollectionId = checkCart.payment_collection?.id;
    if (!paymentCollectionId) {
      const collectionRes = await (sdk.client as any).fetch(`/store/payment-collections`, {
        method: "POST", body: { cart_id: cartId }, headers: headers 
      }); 
      paymentCollectionId = collectionRes.payment_collection?.id || collectionRes.id;
    }

    await (sdk.client as any).fetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: "POST", body: { provider_id: providerId }, headers: headers
    });

    const finalCartRes = await (sdk.store.cart as any).retrieve(cartId, { fields: "*payment_collection,*payment_collection.payment_sessions" }, headers);
    return finalCartRes.cart;
  } catch (error: any) {
    throw new Error(error.message || "Gagal menyambung ke Xendit.");
  }
}

// 🌟 7. ROBOT PEMBANGKIT KERANJANG SISA (Dijalankan di Halaman Success)
export const restoreSavedCartAction = async () => {
  try {
    const cookieStore = await cookies();
    const savedStr = cookieStore.get("niconico_saved_cart")?.value;

    if (!savedStr) return false;

    const savedData = JSON.parse(savedStr);
    if (!savedData || !savedData.items || savedData.items.length === 0) return false;

    const headers = await getAuthHeaders();

    // Bikin keranjang baru HANYA untuk menampung barang sisa
    const { cart: newCart } = await (sdk.store.cart as any).create(
      {
        region_id: savedData.region_id,
        sales_channel_id: savedData.sales_channel_id,
        items: savedData.items
      },
      undefined,
      headers
    );

    // Jadikan keranjang baru ini sebagai keranjang aktif di HP kustomer
    if (newCart && newCart.id) {
      cookieStore.set("_medusa_cart_id", newCart.id, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set("cart_id", newCart.id, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    }

    // Bakar brankasnya biar nggak dieksekusi 2 kali
    cookieStore.delete("niconico_saved_cart");

    return true;
  } catch (error) {
    console.error("❌ Gagal membangkitkan sisa keranjang:", error);
    return false;
  }
}