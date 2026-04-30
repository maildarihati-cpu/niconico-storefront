import React from "react"

const ProductOnboardingCta = ({ onClick, loading, disabled }: { onClick: () => void, loading: boolean, disabled: boolean }) => {
  return (
    <div className="w-full">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full bg-[#EF7044] text-white py-4 rounded-full font-bold text-lg tracking-wide hover:bg-[#d65f36] active:scale-95 transition-all shadow-lg disabled:bg-gray-300"
      >
        {loading ? "ADDING..." : "BUY NOW"}
      </button>
    </div>
  )
}

export default ProductOnboardingCta