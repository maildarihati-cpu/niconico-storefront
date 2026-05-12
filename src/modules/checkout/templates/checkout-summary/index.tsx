"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import DiscountCode from "@modules/checkout/components/discount-code"
import PaymentButton from "@modules/checkout/components/payment-button"

export default function CheckoutSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  return (
    <div className="lg:sticky lg:top-24 bg-gray-50 p-8 rounded-[40px] border border-gray-100">
      <Text className="text-xs font-bold uppercase tracking-[0.2em] mb-8 block text-gray-400">Your Selection</Text>
      
      <div className="flex flex-col gap-y-6 mb-10">
        {cart.items?.map((item) => (
          <div key={item.id} className="flex gap-x-4 items-start">
            <div className="w-20 h-24 bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
              <Thumbnail thumbnail={item.thumbnail} size="full" />
            </div>
            <div className="flex flex-col flex-1 gap-y-1">
              <Text className="text-[11px] font-black uppercase italic leading-tight">{item.title}</Text>
              <Text className="text-[10px] text-gray-400 uppercase">Qty: {item.quantity}</Text>
              
              {/* PERBAIKAN: Gunakan discount_total bawaan v2 */}
              {item.discount_total && item.discount_total > 0 ? (
                <div className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full w-fit font-bold uppercase">
                  Promo Applied
                </div>
              ) : null}
              
              <Text className="text-xs font-bold mt-2">
                Rp {((item.unit_price * item.quantity)).toLocaleString("id-ID")}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10 pt-6 border-t border-gray-200">
        {/* PERBAIKAN: Pakai 'as any' untuk by-pass type error dari template bawaan */}
        <DiscountCode cart={cart as any} />
      </div>

      <div className="flex flex-col gap-y-3 mb-10">
        <div className="flex justify-between">
          <Text className="text-[11px] uppercase text-gray-400 font-bold">Subtotal</Text>
          <Text className="text-xs font-bold">Rp {cart.subtotal?.toLocaleString("id-ID")}</Text>
        </div>
        <div className="flex justify-between text-green-600">
          <Text className="text-[11px] uppercase font-bold">Discount</Text>
          <Text className="text-xs font-bold">- Rp {cart.discount_total?.toLocaleString("id-ID") || 0}</Text>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-4 mt-2">
          <Text className="text-sm font-black uppercase italic">Total</Text>
          <Text className="text-xl font-black text-[#EF7044]">
             Rp {cart.total?.toLocaleString("id-ID")}
          </Text>
        </div>
      </div>

      {/* PERBAIKAN: Tambahkan data-testid yang diminta oleh komponen bawaan */}
      <PaymentButton cart={cart} data-testid="submit-payment-button" />
    </div>
  )
}