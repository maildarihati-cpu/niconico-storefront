import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

let MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com"
// 🌟 PASTIKAN KUNCI DITARIK KE VARIABEL DULU
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: PUBLISHABLE_API_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  // 🌟 PERBAIKAN: KITA "PAKU" KTP DAN HEADER PENTING DI SINI
  const newHeaders = {
    ...localeHeader,
    ...headers,
    "x-publishable-api-key": PUBLISHABLE_API_KEY, // Paksa KTP selalu ikut!
  }
  
  init = {
    ...init,
    headers: newHeaders,
    credentials: "include", // 🌟 Paksa Cookie Sesi Login selalu terbawa ke Railway!
  }
  
  return originalFetch(input, init)
}