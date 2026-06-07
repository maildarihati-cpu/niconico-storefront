"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// 🌟 SENJATA 1: Simpan Alamat Baru / Edit Alamat
export async function saveAddressServerAction(payload: any, editingId: string | null) {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value;

  if (!token) {
    throw new Error("Sesi login tidak valid (Token kosong)");
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  const endpoint = editingId
    ? `${BACKEND_URL}/store/customers/me/addresses/${editingId}`
    : `${BACKEND_URL}/store/customers/me/addresses`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Gagal menyimpan alamat di database Medusa.");
  }

  revalidatePath("/", "layout"); 
  return true;
}

// 🌟 SENJATA 2: Jadikan Alamat Utama (Default)
export async function setDefaultAddressServerAction(addressId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value;

  if (!token) throw new Error("Sesi login tidak valid");

  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
  
  const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    },
    body: JSON.stringify({
      metadata: { default_address_id: addressId }
    }),
  });

  if (!response.ok) throw new Error("Gagal set default address");
  
  revalidatePath("/", "layout");
  return true;
}

// 🌟 SENJATA 3: Jurus Nuklir Logout (Bantai Cookie)
export async function logoutServerAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value;

  // 1. Lapor ke Medusa untuk bunuh sesi di backend
  if (token) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
    await fetch(`${BACKEND_URL}/store/auth`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).catch(() => null);
  }

  // 2. Bunuh paksa cookie di browser
  cookieStore.set("_medusa_jwt", "", { maxAge: 0, path: "/" });
  cookieStore.delete("_medusa_jwt");

  cookieStore.set("_medusa_session", "", { maxAge: 0, path: "/" });
  cookieStore.delete("_medusa_session");

  // 3. Hancurkan cache
  revalidatePath("/", "layout");
  return true;
}

// 🌟 SENJATA 4: Hapus Alamat dari Database (MENGHILANGKAN ERROR CHECKOUT)
export async function deleteAddressServerAction(addressId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value;

  if (!token) {
    throw new Error("Sesi login tidak valid (Token kosong)");
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  // Endpoint Medusa untuk delete address: DELETE /store/customers/me/addresses/{address_id}
  const response = await fetch(`${BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Gagal menghapus alamat dari database Medusa.");
  }

  // Refresh cache agar daftar alamat langsung update di layar
  revalidatePath("/", "layout"); 
  return true;
}