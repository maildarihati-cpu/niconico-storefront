"use server"

import { sdk } from "@lib/config"
import { cookies } from "next/headers"

// 🌟 HELPER SAKTI: Ambil Cookie Next.js Terbaru (WAJIB ASYNC & AWAIT)
const getAuthHeaders = async () => {
  try {
    const cookieStore = await cookies(); 
    const cookieString = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join("; ");
    return { Cookie: cookieString } as any;
  } catch (error) {
    return {} as any;
  }
}

// 1. FUNGSI PEMISAH KERANJANG 
export const prepareCheckoutCart = async (mainCart: any, selectedItems: any[]) => {
  try {
    const headers = await getAuthHeaders();
    const itemsToInsert = selectedItems.map((item: any) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    const payload: any = {
      region_id: mainCart.region_id,
      sales_channel_id: mainCart.sales_channel_id,
      items: itemsToInsert,
    };

    if (mainCart.email) payload.email = mainCart.email;

    const { cart: checkoutCart } = await (sdk.store.cart as any).create(
      payload, 
      undefined, 
      headers
    );

    if (mainCart.shipping_address) {
      await (sdk.store.cart as any).update(
        checkoutCart.id, 
        {
          shipping_address: {
            first_name: mainCart.shipping_address.first_name || "",
            last_name: mainCart.shipping_address.last_name || "",
            address_1: mainCart.shipping_address.address_1 || "",
            city: mainCart.shipping_address.city || "",
            country_code: mainCart.shipping_address.country_code || "id",
            postal_code: mainCart.shipping_address.postal_code || "",
            province: mainCart.shipping_address.province || "",
            phone: mainCart.shipping_address.phone || ""
          }
        },
        undefined,
        headers
      );
    }

    return checkoutCart.id;
  } catch (error) {
    console.error("❌ Gagal memisahkan keranjang:", error);
    return null;
  }
}

// 2. Fungsi Update Alamat Checkout 
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
      cartId, 
      payload, 
      { fields: "*shipping_address,*items,*shipping_methods" },
      headers
    );
    return cart;
  } catch (error) {
    console.error("Error update address:", error);
    throw error;
  }
}

// 3. Fungsi Ambil Kurir 
export const getShippingOptionsAction = async (cartId: string) => {
  try {
    const headers = await getAuthHeaders();
    const { shipping_options } = await (sdk.store.fulfillment as any).listCartOptions(
      { cart_id: cartId },
      headers
    );
    return shipping_options;
  } catch (error) {
    return [];
  }
}

// 4. Fungsi Pilih Kurir
export const setShippingMethodAction = async (cartId: string, optionId: string) => {
  try {
    const headers = await getAuthHeaders();
    const { cart } = await (sdk.store.cart as any).addShippingMethod(
      cartId, 
      { option_id: optionId },
      undefined,
      headers
    );
    return cart;
  } catch (error) {
    throw error;
  }
}

// 5. Fungsi Apply Promo
export const applyPromoCodeAction = async (cartId: string, code: string) => {
  try {
    const headers = await getAuthHeaders();
    const { cart } = await (sdk.store.cart as any).update(
      cartId, 
      { promo_codes: [code] },
      undefined,
      headers
    );
    return cart;
  } catch (error) {
    throw error;
  }
}

// 6. Fungsi Inisiasi Pembayaran (Xendit) 
export const initiatePaymentAction = async (cartId: string, providerId: string = "xendit") => {
  try {
    const headers = await getAuthHeaders();

    const { cart } = await (sdk.store.cart as any).retrieve(
      cartId, 
      { fields: "*payment_collection" }, 
      headers
    );

    let paymentCollectionId = cart.payment_collection?.id;

    if (!paymentCollectionId) {
      const collectionRes = await (sdk.client as any).fetch(`/store/payment-collections`, {
        method: "POST",
        body: { cart_id: cartId },
        headers: headers 
      }); 
      
      paymentCollectionId = collectionRes.payment_collection?.id || collectionRes.id;
    }

    await (sdk.client as any).fetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: "POST",
      body: { provider_id: providerId },
      headers: headers
    });

    const finalCartRes = await (sdk.store.cart as any).retrieve(
      cartId, 
      { fields: "*payment_collection,*payment_collection.payment_sessions" }, 
      headers
    );

    return finalCartRes.cart;

  } catch (error: any) {
    const errMsg = error?.response?.data || error.message;
    console.error("🔥 Error V2 Medusa:", errMsg);
    throw new Error(error.message || "Gagal menyambung ke Xendit.");
  }
}

// 7. Robot Tukang Bersih-Bersih (Partial Checkout)
export const cleanUpMainCartAction = async (purchasedVariantIds: string[]) => {
  try {
    const headers = await getAuthHeaders();
    const cookieStore = await cookies();
    const rawCartId = cookieStore.get("_medusa_cart_id")?.value || cookieStore.get("cart_id")?.value;
    
    if (!rawCartId) return false;
    
    const mainCartId = rawCartId as string; 
    const { cart } = await (sdk.store.cart as any).retrieve(
      mainCartId, 
      { fields: "*items" }, 
      headers
    );
    
    if (!cart || !cart.items) return false;

    for (const item of cart.items) {
      if (item.variant_id && purchasedVariantIds.includes(item.variant_id)) {
        await (sdk.client as any).fetch(`/store/carts/${mainCartId}/line-items/${item.id}`, {
          method: "DELETE",
          headers: headers
        });
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}