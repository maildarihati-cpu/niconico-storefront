"use client"

import React, { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { useParams } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
// 👈 IMPORT listCategories SUDAH DIHAPUS AGAR TIDAK ERROR SERVER-ONLY
import { useCart } from "@/context/cart-context"
import { addToCart as medusaAddToCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShoppingCart, Heart, X, Ruler } from "lucide-react"
import Link from "next/link"

const COLLECTION_MAP: Record<string, any> = {
  "new-arrivals": {
    title: "NEW ARRIVALS",
    subtitle: "Niconico Resorts New Arrivals\nPrepare You For Your Summer 2026",
    heroImage: "/banners/hero-collection-new-arrivals.png",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "carvico": {
    title: "CARVICO",
    subtitle: "Niconico Resorts The Top Picks\nOur Loyal Customer",
    heroImage: "/banners/carvico.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "signature": {
    title: "SIGNATURE",
    subtitle: "Niconico Resorts Signature\nPrepare You For Your Summer 2026",
    heroImage: "/banners/signature.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  },
  "island-escape": {
    title: "ISLAND ESCAPE",
    subtitle: "Make You More Feel The Magical Island",
    heroImage: "/banners/island-escape.jpg",
    lookbookUrl: "https://online.fliphtml5.com/yftbr/shqn/"
  }
}

// ==========================================
// 🌟 FUNGSI PEMBANTU UNTUK URUTAN SIZE
// ==========================================
const sortSizes = (sizes: SizeData[]) => {
  const priority: Record<string, number> = {
    "all size": 0,
    "os": 1,
    "xs": 2,
    "s": 3,
    "m": 4,
    "l": 5,
    "xl": 6,
    "xxl": 7,
  };

  return [...sizes].sort((a, b) => {
    const labelA = a.label.toLowerCase();
    const labelB = b.label.toLowerCase();
    return (priority[labelA] ?? 99) - (priority[labelB] ?? 99);
  });
};

interface SizeData {
  label: string
  inStock: boolean
  variant: any
  qty: number
}

// ==========================================
// 🌟 KOMPONEN QUICK SHOP MODAL
// ==========================================
const QuickShopModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
  const countryCode = useParams().countryCode as string
  const { addToCart: updateNavbarCartCount } = useCart() 
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // LOGIKA WARNA PINTAR
  let colorName = product?.metadata?.color_name;
  let colorId = product?.metadata?.color_id;

  if (!colorName || !colorId) {
    const handleStr = product?.handle?.toLowerCase() || "";
    const colorDictionary: Record<string, string> = {
       "black": "#222222", "white": "#FFFFFF", "navy": "#000080", 
       "nude": "#E3BC9A", "pink": "#FFC0CB", "red": "#FF0000", 
       "blue": "#0000FF", "green": "#008000", "yellow": "#FFFF00", 
       "orange": "#FFA500", "purple": "#800080", "gray": "#808080", 
       "grey": "#808080", "brown": "#A52A2A", "gold": "#FFD700", 
       "silver": "#C0C0C0", "maroon": "#800000", "teal": "#008080", 
       "olive": "#808000"
    };
    
    let foundColor = false;
    for (const [cName, cHex] of Object.entries(colorDictionary)) {
      if (handleStr.includes(`-${cName}`) || handleStr.endsWith(cName)) {
        if (!colorName) colorName = cName.charAt(0).toUpperCase() + cName.slice(1);
        if (!colorId) colorId = cHex;
        foundColor = true;
        break;
      }
    }
    if (!foundColor) {
      if (!colorName) {
          const parts = handleStr.split('-');
          const lastWord = parts[parts.length - 1];
          colorName = lastWord ? lastWord.charAt(0).toUpperCase() + lastWord.slice(1) : "All Variant";
      }
      if (!colorId) colorId = "#eeeeee";
    }
  }

  const mainImage = product?.thumbnail || product?.images?.[0]?.url || "/placeholder.png"
  
  const topVariants = useMemo(() => {
    return product?.variants?.filter((v: any) => 
      v.options?.some((opt: any) => opt.value?.toLowerCase().trim() === "top")
    ) || []
  }, [product])

  const bottomVariants = useMemo(() => {
    return product?.variants?.filter((v: any) => 
      v.options?.some((opt: any) => opt.value?.toLowerCase().trim() === "bottom")
    ) || []
  }, [product])

  const hasTop = topVariants.length > 0
  const hasBottom = bottomVariants.length > 0
  const hasSet = hasTop && hasBottom

  const availableTypes = useMemo(() => {
    if (hasSet) return ["SET", "TOP", "BOTTOM"]
    if (hasTop) return ["TOP"]
    if (hasBottom) return ["BOTTOM"]
    return ["REGULAR"] 
  }, [hasSet, hasTop, hasBottom])

  const [selectedType, setSelectedType] = useState<string>("")

  useEffect(() => {
    if (availableTypes.length > 0 && !selectedType) {
      setSelectedType(availableTypes[0])
    }
  }, [availableTypes, selectedType])

  const sizesForType: SizeData[] = useMemo(() => {
    if (selectedType === "SET" || !selectedType) return []
    let variantsToUse = []
    if (selectedType === "TOP") variantsToUse = topVariants
    else if (selectedType === "BOTTOM") variantsToUse = bottomVariants
    else variantsToUse = product?.variants || []

    const sizes = variantsToUse.map((v: any) => {
      const sizeOpt = v.options?.find((o: any) => !["top", "bottom"].includes(o.value?.toLowerCase().trim()))
      let sizeVal = sizeOpt?.value || v.title?.replace(/top|bottom/i, '').trim() || "All Size"
      
      if (sizeVal.toLowerCase().includes("default") || sizeVal.toLowerCase().includes("option")) {
        sizeVal = "All Size"
      }

      const qty = v.inventory_quantity || 0
      const inStock = v.manage_inventory === false || v.allow_backorder === true || qty > 0
      return { label: sizeVal, inStock, variant: v, qty }
    })
    
    const uniqueSizes = Array.from(new Map<string, SizeData>(sizes.map((item: SizeData) => [item.label, item])).values())
    return sortSizes(uniqueSizes)
  }, [selectedType, topVariants, bottomVariants, product])

  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    if (selectedType !== "SET" && sizesForType.length > 0) {
      const firstInStock = sizesForType.find((s: SizeData) => s.inStock)
      setSelectedSize(firstInStock ? firstInStock.label : sizesForType[0].label)
    }
  }, [sizesForType, selectedType])

  const [isSetModalOpen, setIsSetModalOpen] = useState(false)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  
  const [topSize, setTopSize] = useState<string | null>(null)
  const [bottomSize, setBottomSize] = useState<string | null>(null)
  const [setQuantity, setSetQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const getModalSizes = (variants: any[]) => {
    const rawSizes = variants.map((v: any) => {
      let sizeVal = v.options?.find((o: any) => !["top", "bottom"].includes(o.value?.toLowerCase().trim()))?.value || "All Size"
      if (sizeVal.toLowerCase().includes("default") || sizeVal.toLowerCase().includes("option")) {
        sizeVal = "All Size"
      }
      const qty = v.inventory_quantity || 0
      const inStock = v.manage_inventory === false || v.allow_backorder === true || qty > 0
      return { label: sizeVal, inStock, variant: v, qty }
    })
    return sortSizes(rawSizes)
  }
  const modalTopSizes = useMemo(() => getModalSizes(topVariants), [topVariants])
  const modalBottomSizes = useMemo(() => getModalSizes(bottomVariants), [bottomVariants])

  const selectedModalTopVariant = modalTopSizes.find(s => s.label === topSize)?.variant
  const selectedModalBottomVariant = modalBottomSizes.find(s => s.label === bottomSize)?.variant

  const maxAvailableSet = useMemo(() => {
    if (!selectedModalTopVariant || !selectedModalBottomVariant) return 1
    return Math.min(selectedModalTopVariant.inventory_quantity || 99, selectedModalBottomVariant.inventory_quantity || 99)
  }, [selectedModalTopVariant, selectedModalBottomVariant])

  const formatPrice = (amount: number) => {
    const finalPrice = countryCode === "id" ? amount : amount / 100
    const currencyCode = countryCode === "id" ? "IDR" : "USD"
    return new Intl.NumberFormat(countryCode === "id" ? "id-ID" : "en-US", { style: "currency", currency: currencyCode, minimumFractionDigits: 0 }).format(finalPrice)
  }

  const getVariantPrice = (variant: any) => {
    if (!variant) return null
    return variant.calculated_price?.calculated_amount || variant.prices?.[0]?.amount || null
  }

  const fallbackPrice = useMemo(() => {
    const prices = product?.variants?.map(getVariantPrice).filter((p:any) => p !== null) || []
    return prices.length > 0 ? Math.min(...prices) : 0
  }, [product])

  const selectedRegulerVariant = sizesForType.find((s: SizeData) => s.label === selectedSize)?.variant
  let regulerPrice = fallbackPrice
  if (selectedRegulerVariant) {
    regulerPrice = getVariantPrice(selectedRegulerVariant) || fallbackPrice
  } else if (selectedType === "TOP" && topVariants.length > 0) {
    regulerPrice = getVariantPrice(topVariants[0]) || fallbackPrice
  } else if (selectedType === "BOTTOM" && bottomVariants.length > 0) {
    regulerPrice = getVariantPrice(bottomVariants[0]) || fallbackPrice
  }
  
  const setPrice = (getVariantPrice(selectedModalTopVariant || topVariants[0]) || 0) + (getVariantPrice(selectedModalBottomVariant || bottomVariants[0]) || 0)
  const mainDisplayPrice = formatPrice(selectedType === "SET" ? setPrice : regulerPrice)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setIsWishlisted(savedWishlist.includes(product.id))
    }
  }, [product.id])

  const toggleWishlist = () => {
    const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    let updatedWishlist = []
    if (isWishlisted) {
      updatedWishlist = localWishlist.filter((id: string) => id !== product.id)
    } else {
      updatedWishlist = [...localWishlist, product.id]
    }
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    setIsWishlisted(!isWishlisted)
  }

  const handleAddToCart = async (isSetBundle = false) => {
    setIsAdding(true)
    try {
      if (isSetBundle) {
        if (!selectedModalTopVariant || !selectedModalBottomVariant) return alert("Pilih size Top & Bottom dulu say!")
        const uniqueSetId = `BUNDLE-${Date.now()}`
        await medusaAddToCart({ variantId: selectedModalTopVariant.id, quantity: setQuantity, countryCode: countryCode || "id", metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "TOP", size: topSize, color: colorName }})
        await medusaAddToCart({ variantId: selectedModalBottomVariant.id, quantity: setQuantity, countryCode: countryCode || "id", metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "BOTTOM", size: bottomSize, color: colorName }})
        if (updateNavbarCartCount) updateNavbarCartCount();
        setIsSetModalOpen(false)
        onClose() 
      } else {
        if (!selectedRegulerVariant?.id) return alert("Pilih size dulu ya say!")
        await medusaAddToCart({ variantId: selectedRegulerVariant.id, quantity: 1, countryCode: countryCode || "id", metadata: { color: colorName }})
        if (updateNavbarCartCount) updateNavbarCartCount();
        onClose() 
      }
    } catch (error) {
      alert("Terjadi kesalahan, silakan coba lagi.")
    } finally {
      setIsAdding(false)
    }
  }

  if (!mounted || !selectedType) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity" style={{ position: "fixed" }}>
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[480px] h-auto max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-t-[32px] shadow-2xl flex flex-col p-6 animate-in slide-in-from-bottom-full scrollbar-hide">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black z-10 bg-white/80 rounded-full p-1">
          <X className="w-6 h-6" />
        </button>

        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
          <img src={mainImage} alt={product.title} className="w-20 h-24 object-cover rounded-xl shadow-sm flex-shrink-0" />
          <div className="flex flex-col justify-center pr-6">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{product.title}</h3>
            <h2 className="text-xl font-black text-[#EF7044]">{mainDisplayPrice}</h2>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <p className="text-[13px] text-gray-500 font-medium">Color : {colorName}</p>
            <div className="w-6 h-6 rounded-full border border-gray-300 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: colorId }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className={`p-2 border rounded-full transition-colors ${isWishlisted ? "border-[#EF7044] bg-[#EF7044] text-white" : "border-[#EF7044] text-[#EF7044] hover:bg-orange-50"}`}>
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-row items-start justify-between gap-3 mb-4 flex-1">
          <div className={selectedType === "REGULAR" ? "w-full flex flex-col" : "w-[45%] flex flex-col"}>
            {selectedType === "SET" ? (
              <div className="flex flex-col h-full justify-center">
                <p className="text-[12px] text-gray-500 italic mb-2">Mix & Match your size!</p>
                <button onClick={() => setIsSetModalOpen(true)} className="w-max bg-gray-900 text-white text-[11px] font-bold px-4 py-2 rounded-full hover:bg-[#EF7044] transition-colors">
                  Select Sizes
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[13px] text-gray-500 font-medium">Size <span className="ml-2">: {selectedSize || "Select"}</span></p>
                  {(() => {
                    const currentSize = sizesForType.find((s: SizeData) => s.label === selectedSize);
                    if (currentSize?.variant?.manage_inventory) {
                      return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentSize.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {currentSize.qty}</span>
                    }
                    return null;
                  })()}
                </div>

                <div className="flex flex-row flex-wrap gap-1.5 mb-4">
                  {sizesForType.map((size: SizeData) => (
                    <button key={size.label} disabled={!size.inStock} onClick={() => setSelectedSize(size.label)}
                      className={`relative h-8 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all
                        ${size.label.length > 3 ? "w-max px-3" : "w-8"}
                        ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : selectedSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700 hover:border-[#EF7044]'}`}>
                      {size.label}
                      {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-black hover:text-[#EF7044] transition-colors w-max mt-auto">
              <Ruler className="w-3 h-3" /> Size Guide <span className="ml-1">›</span>
            </button>
          </div>

          {selectedType !== "REGULAR" && (
            <div className="w-[55%] flex flex-row gap-1.5">
              {availableTypes.includes("SET") && (
                <button onClick={() => { setSelectedType("SET"); setIsSetModalOpen(true); }} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "SET" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-center" alt="Set" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-bold tracking-widest">SET</span></div>
                  </div>
                  <p className="text-[8px] text-center font-medium text-gray-500 truncate">{formatPrice(setPrice)}</p>
                </button>
              )}
              {availableTypes.includes("TOP") && (
                <button onClick={() => setSelectedType("TOP")} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "TOP" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-top scale-[1.3] origin-top" alt="Top" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-bold tracking-widest">TOP</span></div>
                  </div>
                  <p className="text-[8px] text-center font-medium text-gray-500 truncate">{formatPrice(getVariantPrice(topVariants[0]) || 0)}</p>
                </button>
              )}
              {availableTypes.includes("BOTTOM") && (
                <button onClick={() => setSelectedType("BOTTOM")} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "BOTTOM" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-bottom scale-[1.3] origin-bottom" alt="Bottom" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-bold tracking-widest">BOTTOM</span></div>
                  </div>
                  <p className="text-[8px] text-center font-medium text-gray-500 truncate">{formatPrice(getVariantPrice(bottomVariants[0]) || 0)}</p>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 -mx-6 -mb-6 mt-6 z-40">
          <button 
            onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleAddToCart(false)} 
            disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)} 
            className="w-full flex items-center justify-center gap-2 bg-[#EF7044] text-white py-4 rounded-full font-bold text-lg tracking-wide hover:bg-[#d65f36] active:scale-95 transition-all shadow-lg disabled:bg-gray-300"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAdding ? "ADDING..." : "ADD TO CART"}
          </button>
        </div>

        {isSetModalOpen && (
          <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity" style={{ position: "fixed" }}>
            <div className="absolute inset-0" onClick={() => setIsSetModalOpen(false)} />
            <div className="relative bg-white w-full max-w-[480px] h-auto max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full">
              <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-center">
                <button onClick={() => setIsSetModalOpen(false)} className="absolute left-4 p-1 text-gray-500 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
                <h3 className="font-bold text-lg">Mix & Match Set</h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto pb-32">
                <div className="flex gap-4 mb-6">
                  <div className="w-28 h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={mainImage} className="w-full h-full object-cover" alt="Product" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h4 className="text-[#EF7044] font-black text-sm uppercase leading-tight mb-1">{product.title}</h4>
                    <p className="text-[#EF7044] font-bold text-base mb-3">{formatPrice(setPrice * setQuantity)}</p>
                    <div className="flex flex-col gap-1.5">
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1 rounded w-max">Set</span>
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1 rounded w-max">{colorName}</span>
                      {(topSize || bottomSize) && (
                        <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1 rounded w-max">
                          {topSize && bottomSize ? `${topSize} / ${bottomSize}` : (topSize || bottomSize)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-gray-800 mt-1">Qty : {setQuantity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[13px] text-gray-500 font-medium">Color : {colorName}</span>
                  <div className="w-8 h-8 rounded-full border-2 border-[#EF7044] p-[2px]">
                    <div className="w-full h-full rounded-full bg-white border border-gray-200 shadow-sm" style={{ backgroundColor: colorId }}></div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[13px] text-gray-500 font-medium">Top Size <span className="ml-2">: {topSize || "Select"}</span></p>
                    {(() => {
                        const cTop = modalTopSizes.find((s: SizeData) => s.label === topSize);
                        if (cTop?.variant?.manage_inventory) return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cTop.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {cTop.qty}</span>
                        return null;
                      })()}
                  </div>
                  <div className="flex gap-2">
                    {modalTopSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setTopSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all 
                          ${size.label.length > 3 ? "w-max px-4" : "w-10"}
                          ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : topSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                        {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[13px] text-gray-500 font-medium">Bottom Size <span className="ml-2">: {bottomSize || "Select"}</span></p>
                    {(() => {
                      const cBot = modalBottomSizes.find((s: SizeData) => s.label === bottomSize);
                      if (cBot?.variant?.manage_inventory) return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cBot.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {cBot.qty}</span>
                      return null;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {modalBottomSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setBottomSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all 
                          ${size.label.length > 3 ? "w-max px-4" : "w-10"}
                          ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : bottomSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                        {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-gray-500 font-medium">Quantity :</span>
                    {topSize && bottomSize && (
                      <span className={`text-xs font-medium ${maxAvailableSet <= 3 ? 'text-red-500' : 'text-[#EF7044]'}`}>Sisa: {maxAvailableSet}</span>
                    )}
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-4">
                    <button onClick={() => setSetQuantity(Math.max(1, setQuantity - 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity <= 1}>−</button>
                    <span className="text-sm font-bold w-4 text-center">{setQuantity}</span>
                    <button onClick={() => setSetQuantity(Math.min(maxAvailableSet, setQuantity + 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity >= maxAvailableSet || !topSize || !bottomSize}>+</button>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 flex">
                <button 
                  onClick={() => handleAddToCart(true)} 
                  disabled={isAdding || !topSize || !bottomSize} 
                  className="w-full flex items-center justify-center gap-2 bg-[#EF7044] text-white py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-[#d65f36] transition-colors disabled:opacity-50 disabled:bg-gray-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdding ? "ADDING..." : "ADD TO CART"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100010] flex items-center justify-center p-4" style={{ position: "fixed" }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
            <div className="relative bg-white w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[20px] p-6 shadow-2xl animate-in zoom-in-95 scrollbar-hide">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[18px] font-medium text-gray-900">Size Guide</h2>
                <button onClick={() => setIsSizeGuideOpen(false)} className="text-gray-900 hover:text-gray-500 transition-colors"><X className="w-6 h-6"/></button>
              </div>
              <div className="mb-8 px-2">
                <h3 className="font-bold text-[14px] text-center mb-3">How to measure</h3>
                <p className="text-[12px] text-gray-800 text-center leading-relaxed">Every body is different, and we at Niconico celebrate that fact with swimsuits and bikinis catered to all shapes and sizes. When measuring your body, the measuring tape should be as close to your skin as possible.</p>
              </div>
              <div className="mb-8">
                <h3 className="font-bold text-[14px] text-center mb-3">Swimwear</h3>
                <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-center">
                    <thead className="font-bold text-gray-900">
                      <tr><th className="py-3 border-b border-r border-gray-200 w-1/4">Size</th><th className="py-3 border-b border-r border-gray-200 w-1/4">Bust</th><th className="py-3 border-b border-r border-gray-200 w-1/4">Waist</th><th className="py-3 border-b border-gray-200 w-1/4">Hip</th></tr>
                    </thead>
                    <tbody className="text-gray-600 font-medium">
                      <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">S</td><td className="py-3 border-b border-r border-gray-200">80-86</td><td className="py-3 border-b border-r border-gray-200">62-68</td><td className="py-3 border-b border-gray-200">86-92</td></tr>
                      <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">M</td><td className="py-3 border-b border-r border-gray-200">86-92</td><td className="py-3 border-b border-r border-gray-200">68-74</td><td className="py-3 border-b border-gray-200">92-98</td></tr>
                      <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">L</td><td className="py-3 border-b border-r border-gray-200">92-98</td><td className="py-3 border-b border-r border-gray-200">74-80</td><td className="py-3 border-b border-gray-200">98-104</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ==========================================
// 🌟 KOMPONEN UTAMA HALAMAN COLLECTION DETAIL
// ==========================================
export default function CollectionDetailPage() {
  const { countryCode, handle } = useParams()
  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [otherCollections, setOtherCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 🌟 STATE UNTUK POPUP DAN WISHLIST
  const [wishlist, setWishlist] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const config = COLLECTION_MAP[handle as string]

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setWishlist(stored)
    }
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProduct]);

  useEffect(() => {
    const fetchCollectionData = async () => {
      setIsLoading(true)
      try {
        const { collections } = await listCollections({ limit: "20", offset: "0" })
        const currentCol = collections.find((c: any) => c.handle === handle)
        
        if (currentCol) {
          setCollection(currentCol)
        }

        // 🌟 TRIK AJAIB: Bypass "server-only" dengan Native Fetch langsung ke Medusa API
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
        
        const catRes = await fetch(`${backendUrl}/store/product-categories?handle=${handle}`, {
          headers: { "x-publishable-api-key": apiKey }
        });
        const catData = await catRes.json();
        const matchedCategory = catData.product_categories?.[0];

        if (matchedCategory) {
          // 3. 🌟 Jika Kategori ketemu, tarik produk berdasarkan CATEGORY_ID
          const { response: productResponse } = await listProducts({
            queryParams: { 
              category_id: [matchedCategory.id], 
              limit: 12,
              fields: "*collection,*variants,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder" 
            },
            countryCode: countryCode as string,
          })
          setProducts(productResponse.products)
        } else {
          // Fallback: Kalau kategori gak ketemu, cari berdasarkan Collection ID
          if (currentCol) {
             const { response: fallbackResponse } = await listProducts({
              queryParams: { 
                collection_id: [currentCol.id], 
                limit: 12,
                fields: "*collection,*variants,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder" 
              },
              countryCode: countryCode as string,
            })
            setProducts(fallbackResponse.products)
          }
        }

        const others = collections.filter((c: any) => c.handle !== handle)
        setOtherCollections(others)

      } catch (err) {
        console.error("Gagal tarik data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollectionData()
  }, [handle, countryCode])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProductPrice = (product: any) => {
    const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
    return countryCode === "id" ? price : price / 100;
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    let updatedWishlist = [];
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
    } else {
      updatedWishlist = [...wishlist, productId];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const closeAndRefreshWishlist = () => {
    setSelectedProduct(null);
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(stored);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#EF7044] border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      
      {/* SECTION 1: HERO IMAGE */}
      <section className="relative w-full h-[450px]">
        <div className="absolute inset-0">
          <img 
            src={config?.heroImage || `/banners/hero-collection-${handle}.jpg`} 
            alt={handle as string} 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center pt-10 px-4 text-center">
          <h1 className="text-4xl font-[900] text-white uppercase tracking-wider drop-shadow-md">
            {config?.title || collection?.title?.toUpperCase()}
          </h1>
          <p className="mt-2 text-[11px] font-medium text-white whitespace-pre-line leading-relaxed opacity-90">
            {config?.subtitle || "Explore the exclusive collection"}
          </p>
        </div>
      </section>

      {/* SECTION 2: LOOKBOOK */}
      {config?.lookbookUrl && (
        <section className="relative z-20 px-4 -mt-[80px] mb-8">
          <div className="rounded-xl overflow-hidden shadow-2xl bg-white">
            <div style={{ position: "relative", paddingTop: "max(60%, 324px)", width: "100%", height: 0 }}>
              <iframe 
                style={{ position: "absolute", border: "none", width: "100%", height: "100%", left: 0, top: 0 }} 
                src={config.lookbookUrl} 
                title="Lookbook" 
                seamless 
                scrolling="no" 
                frameBorder="0" 
                allowTransparency 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* 🌟 SECTION 3: PRODUCT GRID */}
      <section className="px-4 mb-16 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6">
          {products.map((product) => (
            <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} className="flex flex-col group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative aspect-[3/4] bg-gray-50 rounded-[20px] overflow-hidden mb-3 border border-gray-100 shadow-sm">
                <img src={product.thumbnail || "/placeholder.png"} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* WISHLIST BUTTON */}
                <button onClick={(e) => toggleWishlist(e, product.id)} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${wishlist.includes(product.id) ? "bg-[#EF7044] text-white" : "bg-white/80 backdrop-blur-sm text-gray-300 hover:text-[#EF7044]"}`}>
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
                </button>

                {/* ADD TO CART BUTTON (+) MEMBUKA QUICK SHOP MODAL */}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProduct(product); }} 
                  className="absolute bottom-3 right-3 w-9 h-9 bg-[#EF7044] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-transform z-10"
                >
                  +
                </button>
              </div>
              
              <div className="border border-[#EF7044] rounded-full text-center py-1.5 px-2 mx-1 mb-1.5 flex items-center justify-center h-8">
                <h3 className="text-[11px] font-bold text-[#EF7044] truncate w-full px-1">{product.title}</h3>
              </div>
              <p className="text-[#EF7044] text-xs font-black text-center">
                {formatPrice(getProductPrice(product))}
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      {/* SECTION 4: OTHER COLLECTIONS */}
      <section className="mb-10">
        <h3 className="text-center text-[#EF7044] text-[16px] mb-6 font-bold uppercase tracking-widest">
          Other Collections
        </h3>
        
        <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar">
          {otherCollections.map((col) => {
            const thumbConfig = COLLECTION_MAP[col.handle]
            const imagePath = thumbConfig?.heroImage || `/banners/hero-collection-${col.handle}.png`
            
            return (
              <Link 
                key={col.id} 
                href={`/${countryCode}/collections/${col.handle}`}
                className="flex-shrink-0 block"
              >
                <div className="relative w-[280px] h-[155px] rounded-2xl overflow-hidden shadow-md group">
                  <img 
                    src={imagePath} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={col.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <h4 className="text-white text-3xl font-serif italic mb-1 drop-shadow-md">
                      {col.title}
                    </h4>
                    <p className="text-white text-[8px] uppercase tracking-[0.2em] mb-4 opacity-80">
                      {thumbConfig?.subtitle?.split('\n')[0] || "Luxury Resort Wear"}
                    </p>
                    <span className="border border-white text-white text-[10px] uppercase font-bold px-6 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                      Find More
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 🌟 RENDER QUICK SHOP MODAL */}
      {selectedProduct && (
        <QuickShopModal 
          product={selectedProduct} 
          onClose={closeAndRefreshWishlist} 
        />
      )}

    </div>
  )
}