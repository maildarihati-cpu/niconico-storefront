import { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

// Karena StoreTemplate sekarang sudah mengurus dirinya sendiri (Client Component),
// kita tidak perlu lagi melempar parameter apa pun dari sini.
export default function StorePage() {
  return (
    <StoreTemplate />
  )
}