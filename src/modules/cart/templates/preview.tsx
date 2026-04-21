"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Kita definisikan tipe datanya biar gak merah
type CartPreviewProps = {
  cart: any
}

const CartPreview = ({ cart }: CartPreviewProps) => {
  if (!cart || !cart.items) return null

  return (
    <div className="bg-white/95 backdrop-blur-xl p-5 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#ED5725]">
          Added to Cart
        </span>
        <span className="text-[10px] text-gray-400 font-bold">
          {cart.items.length} Items
        </span>
      </div>

      {/* List Item */}
      <div className="space-y-4 max-h-[280px] overflow-y-auto scrollbar-hide mb-5">
        {cart.items.slice(0, 2).map((item: any) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="w-16 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">{item.title}</h4>
              <p className="text-[11px] text-gray-400 font-medium text-left">Qty: {item.quantity}</p>
              <p className="text-sm font-black text-[#ED5725] mt-0.5 text-left">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.unit_price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <LocalizedClientLink 
          href="/cart" 
          className="py-3 rounded-full border-2 border-gray-100 text-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all"
        >
          View Cart
        </LocalizedClientLink>
        <LocalizedClientLink 
          href="/checkout" 
          className="py-3 rounded-full bg-[#ED5725] text-center text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Checkout
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default CartPreview