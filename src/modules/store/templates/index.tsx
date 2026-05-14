"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { Heart, Search, X, ChevronDown, ArrowUp, ShoppingCart, Ruler } from "lucide-react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listProducts } from "@lib/data/products";
import { useCart } from "@/context/cart-context";
import { addToCart as medusaAddToCart } from "@lib/data/cart";

// Kategori Atas
const topCategories = [
  { name: "ALL", handle: "all", img: "/category/all.png" },
  { name: "BIKINIS", handle: "bikinis", img: "/category/bikinis.png" },
  { name: "SWIMSUIT", handle: "swimsuit", img: "/category/swimsuit.png" },
  { name: "RESORT WEAR", handle: "resort-wear", img: "/category/resort-wear.png" },
  { name: "MEN'S WEAR", handle: "mens-wear", img: "/category/mens-wear.png" },
  { name: "ACCESORIES", handle: "accesories", img: "/category/accessories.png" },
];

// ==========================================
// 🌟 FUNGSI PEMBANTU UNTUK URUTAN SIZE (S, M, L, XL)
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
// 🌟 1. KOMPONEN QUICK SHOP MODAL (DENGAN PORTAL)
// ==========================================
const QuickShopModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
  const countryCode = useParams().countryCode as string
  const router = useRouter() 
  const { cart: mainCart, addToCart: updateNavbarCartCount } = useCart() 
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // 🌟 LOGIKA WARNA PINTAR (Metadata + Fallback Ekstrak URL)
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
    
    for (const [cName, cHex] of Object.entries(colorDictionary)) {
      if (handleStr.includes(`-${cName}`) || handleStr.endsWith(cName)) {
        if (!colorName) colorName = cName.charAt(0).toUpperCase() + cName.slice(1);
        if (!colorId) colorId = cHex;
        break;
      }
    }
    if (!colorName) colorName = "All Variant";
    if (!colorId) colorId = "#eeeeee";
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
      
      // 🌟 FIX: Cegah bocornya teks 'Default Option' atau 'Option'
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
      
      // 🌟 FIX: Cegah bocornya teks 'Default Option' atau 'Option'
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

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[13px] text-gray-500 font-medium">Top Size <span className="ml-2">: {topSize || "Select"}</span></p>
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
// 🌟 2. KOMPONEN UTAMA STORE
// ==========================================
export default function StoreTemplate() {
  const { countryCode } = useParams();
  
  // STATE UTAMA
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // STATE UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // STATE POPUP VARIAN
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // STATE FILTER
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(200000);
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedDrawerCategory, setSelectedDrawerCategory] = useState("");

  // 🌟 Ambil Wishlist dari LocalStorage saat Load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(stored);
    }
  }, []);

  // Kunci scroll body saat popup atau filter terbuka
  useEffect(() => {
    if (selectedProduct || isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProduct, isFilterOpen]);

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

  // 1. FUNGSI FETCH PRODUK
  const fetchStoreProducts = useCallback(async (pageNumber: number, reset = false) => {
    setIsLoading(true);
    try {
      const limit = 100; 
      const offset = (pageNumber - 1) * limit;
      
      const data = await listProducts({
        queryParams: { 
          limit,
          offset,
          order: "-created_at",
          fields: "*collection,*variants,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder",
          q: searchQuery || undefined 
        }, 
        countryCode: countryCode as string,
      }).catch(() => null);

      if (data && data.response) {
        let fetched = data.response.products;

        if (activeCategory !== "all") {
          fetched = fetched.filter((p: any) => p.collection?.handle?.toLowerCase() === activeCategory.toLowerCase());
        }

        fetched = fetched.filter((p: any) => {
          const finalPrice = getProductPrice(p);
          return finalPrice >= minPrice && finalPrice <= maxPrice;
        });

        if (selectedSize) {
          fetched = fetched.filter((p: any) => 
            p.variants?.some((v: any) => v.title.toLowerCase().includes(selectedSize.toLowerCase()))
          );
        }

        if (selectedDrawerCategory) {
          fetched = fetched.filter((p: any) => 
            p.collection?.title?.toLowerCase() === selectedDrawerCategory.toLowerCase()
          );
        }

        if (reset) {
          setProducts(fetched);
        } else {
          setProducts(prev => [...prev, ...fetched]); 
        }
        
        setHasMore(data.response.products.length === limit);
      }
    } catch (error) {
      console.error("Filter Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, searchQuery, activeCategory, minPrice, maxPrice, selectedSize, selectedDrawerCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStoreProducts(1, true);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    setPage(1);
    fetchStoreProducts(1, true);
  };

  const handleResetFilter = () => {
    setMinPrice(200000);
    setMaxPrice(5000000);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedDrawerCategory("");
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStoreProducts(nextPage, false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="bg-white min-h-screen pb-20 mx-auto max-w-[1200px] md:max-w-md relative">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg pt-[100px] pb-4 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-b border-gray-50">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-100 rounded-full py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#EF7044] transition-colors shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Category</h1>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 border border-orange-200 text-[#EF7044] bg-orange-50/70 px-5 py-2 rounded-full text-sm font-bold hover:bg-orange-100 transition-colors"
          >
            Filter <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-5 scrollbar-hide pb-2">
          {topCategories.map((cat) => (
            <button key={cat.handle} onClick={() => setActiveCategory(cat.handle)} className="flex flex-col items-center min-w-[70px] gap-2 group">
              <div className={`w-[72px] h-[72px] rounded-full overflow-hidden border-2 transition-all p-0.5 ${activeCategory === cat.handle ? "border-[#EF7044]" : "border-transparent"}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                   <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider text-center leading-tight ${activeCategory === cat.handle ? "text-gray-900" : "text-gray-400"}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* GRID PRODUK */}
      <div className="px-4 pt-6 grid grid-cols-2 gap-x-3 gap-y-6 mb-10">
        {products.length > 0 ? (
          products.map((product) => (
            <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} className="flex flex-col group block animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative aspect-[3/4] bg-gray-50 rounded-[20px] overflow-hidden mb-3 border border-gray-100 shadow-sm">
                <img src={product.thumbnail || "/placeholder.png"} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* WISHLIST BUTTON */}
                <button onClick={(e) => toggleWishlist(e, product.id)} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${wishlist.includes(product.id) ? "bg-[#EF7044] text-white" : "bg-white/80 backdrop-blur-sm text-gray-300 hover:text-[#EF7044]"}`}>
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
                </button>

                {/* 🌟 ADD TO CART BUTTON (+) MEMBUKA QUICK SHOP MODAL */}
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
          ))
        ) : (
          <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products match your filter</p>
          </div>
        )}
      </div>

      {/* VIEW MORE & BACK TO TOP */}
      <div className="px-4">
        {hasMore && products.length > 0 && (
          <button onClick={handleLoadMore} disabled={isLoading} className="w-full py-4 rounded-full bg-gray-50 border border-gray-200 text-gray-600 font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors mb-8 shadow-sm">
            {isLoading ? "Loading..." : "View More"}
          </button>
        )}
      </div>

      {products.length > 0 && (
        <div className="flex justify-center mb-8">
          <button onClick={scrollToTop} className="flex flex-col items-center gap-2 text-gray-300 hover:text-[#EF7044] transition-colors">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm bg-white">
              <ArrowUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Top</span>
          </button>
        </div>
      )}

      {/* =========================================
          🌟 POPUP PILIH VARIAN (QUICK SHOP)
          ========================================= */}
      {selectedProduct && (
        <QuickShopModal 
          product={selectedProduct} 
          onClose={closeAndRefreshWishlist} 
        />
      )}


      {/* =========================================
          DRAWER FILTER
          ========================================= */}
      <div className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="pt-8 pb-4 px-6 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-medium text-gray-900">Filter</h2>
            <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5 text-gray-600" /></button>
          </div>
          <div className="border-b border-gray-100 mx-6"></div>

          <div className="p-6 overflow-y-auto flex-1 space-y-7">
            <div>
              <p className="text-[15px] font-medium text-gray-900 mb-4">Price</p>
              <div className="px-2">
                <input type="range" min="200000" max="5000000" step="50000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#EF7044]" />
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Rp 200K</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[15px] font-medium text-gray-900 mb-3">Size</p>
              <div className="flex flex-wrap gap-2.5">
                {["S", "M", "L", "XL"].map(size => (
                  <button key={size} onClick={() => setSelectedSize(selectedSize === size ? "" : size)} className={`px-6 py-1.5 rounded-full border transition-colors text-sm ${selectedSize === size ? "border-[#EF7044] text-[#EF7044]" : "border-gray-300 text-gray-700 bg-white"}`}>{size}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[15px] font-medium text-gray-900 mb-4">Color</p>
              <div className="flex flex-wrap gap-3.5">
                {["#DAA520", "#CD5C5C", "#1C2833", "#4A5D6B", "#E5E7EB", "#5C4033", "#E6B0AA"].map((color, i) => (
                  <button key={i} onClick={() => setSelectedColor(selectedColor === color ? "" : color)} className={`w-7 h-7 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "border border-gray-100"}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[15px] font-medium text-gray-900 mb-3">Category</p>
              <div className="flex flex-wrap gap-2.5">
                {["Bikinis", "Swimsuit", "Resort Wear", "Men's Wear", "Accesories"].map(cat => (
                  <button key={cat} onClick={() => setSelectedDrawerCategory(selectedDrawerCategory === cat ? "" : cat)} className={`px-5 py-1.5 rounded-full border transition-colors text-sm ${selectedDrawerCategory === cat ? "border-[#EF7044] text-[#EF7044]" : "border-gray-300 text-gray-700 bg-white"}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[15px] font-medium text-gray-900 mb-3">Collections</p>
              <div className="flex flex-wrap gap-2.5">
                {["New Realese", "Best Seller", "Signature", "Island Escape", "Discount %"].map(col => (
                  <button key={col} className="px-5 py-1.5 rounded-full border border-gray-300 text-gray-700 bg-white hover:border-[#EF7044] hover:text-[#EF7044] transition-colors text-sm">{col}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mx-6 pt-5 pb-8 bg-white flex gap-3 flex-shrink-0">
            <button onClick={handleResetFilter} className="flex-1 py-3 rounded-full border border-orange-200 text-orange-400/80 font-medium text-sm transition-colors">Reset</button>
            <button onClick={handleApplyFilter} className="flex-1 py-3 rounded-full bg-[#EF7044] text-white font-medium text-sm hover:opacity-90 transition-opacity">Apply</button>
          </div>
        </div>
      </div>

    </div>
  );
}