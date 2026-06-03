"use server";

import { cookies } from "next/headers";

export async function saveAddressServerAction(payload: any, editingId: string | null) {
  // 🌟 PERBAIKAN DI SINI: Tambahkan 'await' karena di Next.js terbaru cookies() adalah Promise!
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

  // 2. Server yang menembak ke Backend Medusa
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

  return true;
}