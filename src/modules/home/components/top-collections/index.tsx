"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context/cart-context";
import { addToCart } from "@lib/data/cart"; 
import { listProducts } from "@lib/data/products";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ShoppingCart, Heart, X, Ruler } from "lucide-react";

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
        if (!selectedModalTopVariant || !selectedModalBottomVariant) return alert("Choose Top & Bottom sizes first, please!")
        const uniqueSetId = `BUNDLE-${Date.now()}`
        await addToCart({ variantId: selectedModalTopVariant.id, quantity: setQuantity, countryCode: countryCode || "id", metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "TOP", size: topSize, color: colorName }})
        await addToCart({ variantId: selectedModalBottomVariant.id, quantity: setQuantity, countryCode: countryCode || "id", metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "BOTTOM", size: bottomSize, color: colorName }})
        if (updateNavbarCartCount) updateNavbarCartCount();
        setIsSetModalOpen(false)
        onClose() 
      } else {
        if (!selectedRegulerVariant?.id) return alert("Choose a size first, please!")
        await addToCart({ variantId: selectedRegulerVariant.id, quantity: 1, countryCode: countryCode || "id", metadata: { color: colorName }})
        if (updateNavbarCartCount) updateNavbarCartCount();
        onClose() 
      }
    } catch (error) {
      alert("An error occurred, please try again.")
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
            <h3 className="font-heavy text-gray-900 text-lg leading-tight mb-1">{product.title}</h3>
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
                <p className="text-[12px] text-gray-500 italic mb-2">Choose your sizes!</p>
                <button onClick={() => setIsSetModalOpen(true)} className="w-max bg-gray-900 text-white text-[11px] font-heavy px-4 py-2 rounded-full hover:bg-[#EF7044] transition-colors">
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
                      return <span className={`text-[10px] font-regular px-2 py-0.5 rounded-full ${currentSize.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {currentSize.qty}</span>
                    }
                    return null;
                  })()}
                </div>

                <div className="flex flex-row flex-wrap gap-1.5 mb-4">
                  {sizesForType.map((size: SizeData) => (
                    <button key={size.label} disabled={!size.inStock} onClick={() => setSelectedSize(size.label)}
                      className={`relative h-8 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-heavy transition-all
                        ${size.label.length > 3 ? "w-max px-3" : "w-8"}
                        ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : selectedSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700 hover:border-[#EF7044]'}`}>
                      {size.label}
                      {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-[11px] font-heavy text-black hover:text-[#EF7044] transition-colors w-max mt-auto">
              <Ruler className="w-3 h-3" /> Size Guide <span className="ml-1">›</span>
            </button>
          </div>

          {selectedType !== "REGULAR" && (
            <div className="w-[55%] flex flex-row gap-1.5">
              {availableTypes.includes("SET") && (
                <button onClick={() => { setSelectedType("SET"); setIsSetModalOpen(true); }} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "SET" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-center" alt="Set" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-heavy tracking-widest">Set</span></div>
                  </div>
                  <p className="text-[8px] text-center font-medium text-gray-500 truncate">{formatPrice(setPrice)}</p>
                </button>
              )}
              {availableTypes.includes("TOP") && (
                <button onClick={() => setSelectedType("TOP")} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "TOP" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-top scale-[1.3] origin-top" alt="Top" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-heavy tracking-widest">Top</span></div>
                  </div>
                  <p className="text-[8px] text-center font-medium text-gray-500 truncate">{formatPrice(getVariantPrice(topVariants[0]) || 0)}</p>
                </button>
              )}
              {availableTypes.includes("BOTTOM") && (
                <button onClick={() => setSelectedType("BOTTOM")} className="flex-1 flex flex-col gap-1.5 group">
                  <div className={`relative aspect-[3/4] w-full rounded-[5pt] overflow-hidden border-2 transition-all ${selectedType === "BOTTOM" ? "border-[#EF7044]" : "border-transparent"}`}>
                    <img src={mainImage} className="w-full h-full object-cover object-bottom scale-[1.3] origin-bottom" alt="Bottom" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40"><span className="text-white text-[8px] font-heavy tracking-widest">Bottom</span></div>
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
            className="w-full flex items-center justify-center gap-2 bg-[#EF7044] text-white py-4 rounded-full font-heavy text-lg tracking-wide hover:bg-[#d65f36] active:scale-95 transition-all shadow-lg disabled:bg-gray-300"
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
                <h3 className="font-heavy text-lg">Choose Your Sizes</h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto pb-32">
                <div className="flex gap-4 mb-6">
                  <div className="w-28 h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={mainImage} className="w-full h-full object-cover" alt="Product" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h4 className="text-[#EF7044] font-heavy text-sm leading-tight mb-1">{product.title}</h4>
                    <p className="text-[#EF7044] font-regular text-base mb-3">{formatPrice(setPrice * setQuantity)}</p>
                    <div className="flex flex-col gap-1.5">
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-heavy px-3 py-1 rounded w-max">Set</span>
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-heavy px-3 py-1 rounded w-max">{colorName}</span>
                      {(topSize || bottomSize) && (
                        <span className="bg-gray-200 text-gray-700 text-[10px] font-heavy px-3 py-1 rounded w-max">
                          {topSize && bottomSize ? `${topSize} / ${bottomSize}` : (topSize || bottomSize)}
                        </span>
                      )}
                      <span className="text-[11px] font-heavy text-gray-800 mt-1">Qty : {setQuantity}</span>
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
                        if (cTop?.variant?.manage_inventory) return <span className={`text-[10px] font-heavy px-1.5 py-0.5 rounded-full ${cTop.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {cTop.qty}</span>
                        return null;
                      })()}
                  </div>
                  <div className="flex gap-2">
                    {modalTopSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setTopSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-heavy transition-all 
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
                      if (cBot?.variant?.manage_inventory) return <span className={`text-[10px] font-heavy px-1.5 py-0.5 rounded-full ${cBot.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stock: {cBot.qty}</span>
                      return null;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {modalBottomSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setBottomSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-heavy transition-all 
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
                      <span className={`text-xs font-heavy ${maxAvailableSet <= 3 ? 'text-red-500' : 'text-[#EF7044]'}`}>Sisa: {maxAvailableSet}</span>
                    )}
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-4">
                    <button onClick={() => setSetQuantity(Math.max(1, setQuantity - 1))} className="text-gray-500 font-heavy text-lg disabled:opacity-30" disabled={setQuantity <= 1}>−</button>
                    <span className="text-sm font-heavy w-4 text-center">{setQuantity}</span>
                    <button onClick={() => setSetQuantity(Math.min(maxAvailableSet, setQuantity + 1))} className="text-gray-500 font-heavy text-lg disabled:opacity-30" disabled={setQuantity >= maxAvailableSet || !topSize || !bottomSize}>+</button>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 flex">
                <button 
                  onClick={() => handleAddToCart(true)} 
                  disabled={isAdding || !topSize || !bottomSize} 
                  className="w-full flex items-center justify-center gap-2 bg-[#EF7044] text-white py-3.5 rounded-full font-heavy text-sm tracking-wide shadow-lg hover:bg-[#d65f36] transition-colors disabled:opacity-50 disabled:bg-gray-300"
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
                <h3 className="font-Regular text-[14px] text-center mb-3">How to measure</h3>
                <p className="text-[12px] text-gray-800 text-center leading-relaxed">Every body is different, and we at Niconico celebrate that fact with swimsuits and bikinis catered to all shapes and sizes. When measuring your body, the measuring tape should be as close to your skin as possible.</p>
              </div>
              <div className="mb-8">
                <h3 className="font-heavy text-[14px] text-center mb-3">Swimwear</h3>
                <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-center">
                    <thead className="font-heavy text-gray-900">
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
// 🌟 2. KOMPONEN UTAMA TOP COLLECTIONS 
// ==========================================
const collectionsConfig = {
  "New Arrivals": { handle: "new-arrivals", link: "/collections/new-arrivals" },
  "Carvico": { handle: "carvico", link: "/collections/carvico" },
  "Signature": { handle: "signature", link: "/collections/signature" },
  "Island Escape": { handle: "island-escape", link: "/collections/island-escape" }
};

const tabs = ["New Arrivals", "Carvico", "Signature", "Island Escape"];

export default function TopCollections() {
  const { countryCode } = useParams();
  
  const [activeTab, setActiveTab] = useState(tabs[0]);
  
  // GUDANG TRANSIT DATA
  const [collectionsData, setCollectionsData] = useState<{ [key: string]: any[] }>({});
  
  // GLOBAL LOADING
  const [globalLoading, setGlobalLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // ==========================================
  // 🌟 TEKNIK OPTIMASI (Tarik Sekali Jaring Super Besar: 150 Produk)
  // ==========================================
  useEffect(() => {
    const fetchAllCollections = async () => {
      setGlobalLoading(true);
      try {
        const data = await listProducts({
          queryParams: { 
            limit: 90, 
            order: "-created_at",
            fields: "*collection,*categories,*variants,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder" 
          }, 
          countryCode: countryCode as string,
        }).catch(() => null);

        if (data && data.response) {
          const allProducts = data.response.products;
          const mappedData: { [key: string]: any[] } = {};
          
          tabs.forEach((tabName) => {
            const targetHandle = collectionsConfig[tabName as keyof typeof collectionsConfig].handle.toLowerCase();
            const filtered = allProducts.filter((p: any) => 
              p.categories?.some((c: any) => c.handle?.toLowerCase() === targetHandle)
            );
            mappedData[tabName] = filtered.slice(0, 4);
          });

          setCollectionsData(mappedData);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setGlobalLoading(false);
      }
    };
    
    fetchAllCollections();
  }, [countryCode]); // 👈 HANYA DIPANGGIL 1 KALI SAAT HALAMAN DIBUKA

  // SCROLL LOCK KETIKA POPUP TERBUKA
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProduct]);

  // Tampilkan data langsung dari gudang (Instan pas pindah tab!)
  const currentProducts = collectionsData[activeTab] || [];
  const activeConfig = collectionsConfig[activeTab as keyof typeof collectionsConfig];
  const dynamicHeroImage = currentProducts.length > 0 ? currentProducts[0].thumbnail : null;

  const formatMedusaPrice = (product: any) => {
    const variants = product.variants || [];
    if (variants.length === 0) return "N/A";
    const variant = variants[0];
    const targetCurrency = countryCode === "id" ? "idr" : "usd";
    const priceObject = variant.calculated_price || variant.prices?.find((p: any) => p.currency_code?.toLowerCase() === targetCurrency) || variant.prices?.[0];
    if (!priceObject) return "N/A";
    let amount = priceObject.calculated_amount || priceObject.amount;
    const currency = (priceObject.currency_code || targetCurrency).toLowerCase();
    const finalAmount = currency === "idr" ? amount : amount / 100;
    return new Intl.NumberFormat(currency === "idr" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(finalAmount);
  };

  return (
    /* 🌟 PERUBAHAN: Dipastikan mt-12 (48px) dan tanpa padding pt/pb/py */
    <section className="mt-12 bg-white max-w-[1200px] mx-auto md:max-w-6xl relative">
      
      {/* 🌟 HEADER JUDUL & TAB */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-0 md:mb-10 px-0 md:px-4 z-10 relative">
        <h2 className="text-3xl font-heavy text-[25px] text-center md:text-left text-gray-900 mb-2 md:mb-0 tracking-tight">
          Top Collections
        </h2>

        <div className="flex overflow-x-auto gap-6 md:gap-8 px-4 md:px-0 mb-10 md:mb-0 border-b border-gray-100 scrollbar-hide md:border-none z-10">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              disabled={globalLoading}
              className={`flex flex-col items-center md:items-start whitespace-nowrap min-w-max pb-3 relative group transition-opacity ${globalLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`md:hidden w-1.5 h-1.5 rounded-full mb-1 transition-all duration-300 ${activeTab === tab ? "bg-[#EF7044]" : "bg-transparent"}`}></div>
              <span className={`text-sm md:text-base transition-all duration-300 ${activeTab === tab ? "text-[#EF7044] font-heavy" : "text-gray-400 hover:text-[#EF7044]"}`}>
                {tab}
              </span>
              <div className={`absolute bottom-0 left-0 h-[2px] bg-[#EF7044] transition-all duration-300 ${activeTab === tab ? "w-full" : "w-0"}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* HERO IMAGE MOBILE */}
        <div className="mb-10 flex justify-center md:hidden">
          <LocalizedClientLink href={activeConfig.link} className="w-full max-w-2xl aspect-[3/4] rounded-[32px] overflow-hidden block relative group shadow-xl bg-gray-50 border border-gray-100">
            {globalLoading ? (
               <div className="w-full h-full animate-pulse bg-gray-200" />
            ) : dynamicHeroImage ? (
              <>
                <img src={dynamicHeroImage} alt={activeTab} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-8">
                    <span className="text-white font-heavy text-sm md:text-lg px-8 py-4 bg-[#EF7044] rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest">
                      Explore {activeTab}
                    </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-medium italic">No products in this collection</div>
            )}
          </LocalizedClientLink>
        </div>

        {/* 🌟 LOADING STATE UTAMA SKELETON */}
        {globalLoading ? (
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 scrollbar-hide md:overflow-visible flex-nowrap md:flex-wrap items-start">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[170px] max-w-[170px] md:min-w-0 md:max-w-none md:w-full flex flex-col animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-100 md:bg-white rounded-[24px] md:rounded-[20px] overflow-hidden relative mb-4 border border-gray-100 md:border-none shadow-sm md:shadow-[0_4px_20px_rgb(0,0,0,0.05)] md:p-2 z-0">
                   <div className="w-full h-full bg-gray-200 rounded-[16px]"></div>
                </div>
                <div className="flex flex-col items-center text-center px-2 md:px-0">
                  <div className="h-6 md:h-8 bg-gray-200 rounded-full w-full max-w-[180px] mb-2 md:mb-3"></div>
                  <div className="h-4 md:h-5 bg-gray-200 rounded-full w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : currentProducts.length > 0 ? (
          /* 🌟 RENDER PRODUK DARI GUDANG (PINDAH TAB INSTAN) */
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 scrollbar-hide md:overflow-visible flex-nowrap items-start">
            {currentProducts.map((product) => (
              <div key={product.id} className="min-w-[170px] max-w-[170px] md:min-w-0 md:max-w-none md:w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 relative group cursor-pointer z-0">
                
                {/* 🔗 LINK UTAMA (Z-0) Berada paling bawah menutupi seluruh card */}
                <LocalizedClientLink href={`/products/${product.handle}`} className="absolute inset-0 z-0" />
                
                {/* 🌟 WADAH GAMBAR */}
                <div className="w-full aspect-[3/4] bg-gray-50 md:bg-white rounded-[24px] md:rounded-[20px] overflow-hidden relative mb-4 border border-gray-100 md:border-none shadow-sm md:shadow-[0_4px_20px_rgb(0,0,0,0.05)] md:p-2 pointer-events-none">
                  <img src={product.thumbnail || "/placeholder.png"} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 md:rounded-[16px]" />
                  
                  {/* 🌟 TOMBOL + */}
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProduct(product); }} className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-10 h-10 bg-[#EF7044] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white pointer-events-auto">
                    +
                  </button>
                </div>
                
                {/* 🌟 WADAH TEKS */}
                <div className="flex flex-col items-center text-center px-2 md:px-0 relative pointer-events-none w-full">
                {/* 🌟 PERUBAHAN: Pakai 'truncate w-full' biar jadi 1 baris (...), dan naikin mb-2 & md:mb-3 biar jarak harga balikin normal */}
                <h3 className="text-sm text-gray-800 font-black truncate w-full mb-2 md:text-base md:text-[#EF7044] md:border md:border-[#EF7044] md:rounded-full md:px-4 md:py-1.5 md:max-w-[200px] md:mx-auto md:block md:mb-2 transition-colors duration-300 md:group-hover:bg-[#EF7044] md:group-hover:text-white">
                  {product.title}
                </h3>
                <p className="text-[#EF7044] text-sm md:text-base font-heavy">
                  {formatMedusaPrice(product)}
                </p>
              </div>
              </div>
            ))}
            
            {/* VIEW ALL CARD (MOBILE) */}
            <LocalizedClientLink href={activeConfig.link} className="md:hidden min-w-[170px] aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 transition-all group flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#EF7044] group-hover:text-white text-gray-400 transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <span className="text-gray-600 group-hover:text-[#EF7044] font-heavy text-sm">View All</span>
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">No products available in this collection.</p>
          </div>
        )}

        {/* 🌟 CHECK MORE BUTTON */}
        {!globalLoading && currentProducts.length > 0 && (
          <div className="hidden md:flex justify-center mt-12 z-0 relative">
            <LocalizedClientLink href={activeConfig.link}>
              <button className="flex items-center justify-center gap-3 bg-[#EF7044] text-white border-2 border-[#EF7044] px-10 py-3.5 rounded-full font-black italic text-sm tracking-widest hover:bg-white hover:text-[#EF7044] transition-all duration-300 group z-0 relative">
                <div className="w-6 h-6 rounded-full border-[2px] border-white flex items-center justify-center group-hover:border-[#EF7044] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="text-white group-hover:text-[#EF7044] transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </div>
                CHECK MORE
              </button>
            </LocalizedClientLink>
          </div>
        )}
      </div>

      {selectedProduct && (
        <QuickShopModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </section>
  );
}