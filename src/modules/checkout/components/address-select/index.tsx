"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import React, { useState } from "react"

export default function AddressSelect({ customer }: { customer: HttpTypes.StoreCustomer }) {
  // PERBAIKAN: Ambil ID dari alamat pertama di dalam array jika ada
  const [selectedId, setSelectedId] = useState<string | undefined>(
    customer.addresses && customer.addresses.length > 0 ? customer.addresses[0].id : undefined
  )

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center gap-x-2">
        <span className="bg-[#EF7044] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
        <Text className="text-sm font-bold uppercase tracking-widest">Shipping Address</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customer.addresses?.map((address) => (
          <div 
            key={address.id}
            onClick={() => setSelectedId(address.id)}
            className={`p-5 rounded-[25px] border-2 transition-all cursor-pointer ${
              selectedId === address.id 
              ? "border-[#EF7044] bg-[#EF7044]/5" 
              : "border-gray-100 hover:border-[#EF7044]/30"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <Text className="font-black text-xs uppercase italic">{address.first_name} {address.last_name}</Text>
              {selectedId === address.id && <div className="w-2 h-2 rounded-full bg-[#EF7044]" />}
            </div>
            <Text className="text-[11px] leading-relaxed text-gray-500 uppercase">
              {address.address_1}, {address.city}<br />
              {address.province}, {address.postal_code}<br />
              {address.phone}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}