import React from "react"
import Accordion from "./accordion"

const ProductTabs = ({ product }: { product: any }) => {
  return (
    <div className="w-full flex flex-col mt-4 border-t border-gray-200">
      {/* 1. DESKRIPSI DARI DATABASE */}
      <Accordion title="Description" defaultOpen={true}>
        {product.description || "No description available for this product."}
      </Accordion>

      {/* 2. SHIPPING (STATIS SESUAI UI) */}
      <Accordion title="Shipping & Returns">
        <div className="flex flex-col gap-y-4">
          <div>
            <p className="font-bold text-black mb-1">Worldwide</p>
            <p>
              We are pleased to offer an express international courier service using Express Mail Service Post Indonesia with an estimated time of arrival within 3-7 working days.
            </p>
          </div>
          <div>
            <p className="font-bold text-black mb-1">Indonesia</p>
            <p>
              Free shipping to all Domestic Addresses for order above Rp500,000. 
              Local couriers: JNE, TIKI, POST, Gojek, etc.
            </p>
          </div>
        </div>
      </Accordion>
    </div>
  )
}

export default ProductTabs