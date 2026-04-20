import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center bg-white">
      <h1 className="text-5xl font-black text-[#EF7044] mb-4 tracking-tighter">Oops!</h1>
      <p className="text-gray-400 mb-10 text-sm leading-relaxed max-w-[240px]">
        We couldn't retrieve your cart information. Please explore our latest collections.
      </p>
      <LocalizedClientLink href="/store">
        <button className="bg-[#EF7044] text-white px-10 py-4 rounded-full font-bold uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#EF7044]/20 hover:opacity-90 transition-opacity">
          Return to Shop
        </button>
      </LocalizedClientLink>
    </div>
  )
}