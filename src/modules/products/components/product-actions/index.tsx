"use client"

import React, { useState, useMemo, useEffect } from "react"
import { ShoppingCart, Heart, X, Ruler } from "lucide-react"
import { addToCart } from "@lib/data/cart" 
import { useParams } from "next/navigation"
import { updateCustomerWishlist } from "@lib/data/customer"

// --- TIPE DATA ---
interface SizeData {
  label: string
  inStock: boolean
  variant: any
  qty: number
}

const ProductActions = ({ product, region, customer }: { product: any, region: any, customer: any }) => {
  const countryCode = useParams().countryCode as string

  // 1. DATA UMUM PRODUK
  const colorName = product?.metadata?.color_name || "White"
  const mainImage = product?.thumbnail || product?.images?.[0]?.url || "/placeholder.png"
  
  // 🌟 LOGIC CERDAS: Cek ini produk 2-piece atau Regular?
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

  // Tentukan Tipe yang tersedia
  const availableTypes = useMemo(() => {
    if (hasSet) return ["SET", "TOP", "BOTTOM"]
    if (hasTop) return ["TOP"]
    if (hasBottom) return ["BOTTOM"]
    return ["REGULAR"] 
  }, [hasSet, hasTop, hasBottom])

  const [selectedType, setSelectedType] = useState<string>("")

  // Set default type
  useEffect(() => {
    if (availableTypes.length > 0 && !selectedType) {
      setSelectedType(availableTypes[0])
    }
  }, [availableTypes, selectedType])

  // 2. LOGIC TARIK SIZE
  const sizesForType: SizeData[] = useMemo(() => {
    if (selectedType === "SET" || !selectedType) return []
    
    let variantsToUse = []
    if (selectedType === "TOP") variantsToUse = topVariants
    else if (selectedType === "BOTTOM") variantsToUse = bottomVariants
    else variantsToUse = product?.variants || []

    const sizes = variantsToUse.map((v: any) => {
      const sizeOpt = v.options?.find((o: any) => !["top", "bottom"].includes(o.value?.toLowerCase().trim()))
      const sizeVal = sizeOpt?.value || v.title?.replace(/top|bottom/i, '').trim() || "OS"
      const qty = v.inventory_quantity || 0
      const inStock = v.manage_inventory === false || v.allow_backorder === true || qty > 0
      return { label: sizeVal, inStock, variant: v, qty }
    })
    
    return Array.from(new Map<string, SizeData>(sizes.map((item: SizeData) => [item.label, item])).values())
  }, [selectedType, topVariants, bottomVariants, product])

  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    if (selectedType !== "SET" && sizesForType.length > 0) {
      const firstInStock = sizesForType.find((s: SizeData) => s.inStock)
      setSelectedSize(firstInStock ? firstInStock.label : sizesForType[0].label)
    }
  }, [sizesForType, selectedType])

  // 3. STATE UNTUK MODAL SET & SIZE GUIDE
  const [isSetModalOpen, setIsSetModalOpen] = useState(false)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  
  const [topSize, setTopSize] = useState<string | null>(null)
  const [bottomSize, setBottomSize] = useState<string | null>(null)
  const [setQuantity, setSetQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Modal Size logic
  const getModalSizes = (variants: any[]) => {
    return variants.map((v: any) => {
      const sizeVal = v.options?.find((o: any) => !["top", "bottom"].includes(o.value?.toLowerCase().trim()))?.value || "OS"
      const qty = v.inventory_quantity || 0
      const inStock = v.manage_inventory === false || v.allow_backorder === true || qty > 0
      return { label: sizeVal, inStock, variant: v, qty }
    })
  }
  const modalTopSizes = useMemo(() => getModalSizes(topVariants), [topVariants])
  const modalBottomSizes = useMemo(() => getModalSizes(bottomVariants), [bottomVariants])

  const selectedModalTopVariant = modalTopSizes.find(s => s.label === topSize)?.variant
  const selectedModalBottomVariant = modalBottomSizes.find(s => s.label === bottomSize)?.variant

  const maxAvailableSet = useMemo(() => {
    if (!selectedModalTopVariant || !selectedModalBottomVariant) return 1
    return Math.min(selectedModalTopVariant.inventory_quantity || 99, selectedModalBottomVariant.inventory_quantity || 99)
  }, [selectedModalTopVariant, selectedModalBottomVariant])

  // 4. FORMAT HARGA
  const formatPrice = (amount: number) => {
    const finalPrice = countryCode === "id" ? amount : amount / 100
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(finalPrice)
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

  // 5. WISHLIST & CART LOGIC
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setIsWishlisted(savedWishlist.includes(product.id))
    }
  }, [product.id])

  const toggleWishlist = async () => {
  const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
  let updatedWishlist = []

  if (customer) {
    // MODE CLOUD (LOGIN)
    const cloudWishlist = customer.metadata?.wishlist || []
    if (isWishlisted) {
      updatedWishlist = cloudWishlist.filter((id: string) => id !== product.id)
    } else {
      updatedWishlist = [...cloudWishlist, product.id]
    }
    await updateCustomerWishlist(updatedWishlist)
  } else {
    // MODE LOKAL (GUEST)
    if (isWishlisted) {
      updatedWishlist = localWishlist.filter((id: string) => id !== product.id)
    } else {
      updatedWishlist = [...localWishlist, product.id]
    }
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
  }
  
  setIsWishlisted(!isWishlisted)
}

  const handleBuyNow = async (isSetBundle = false) => {
    setIsAdding(true)
    try {
      if (isSetBundle) {
        if (!selectedModalTopVariant || !selectedModalBottomVariant) return alert("Pilih size Top & Bottom dulu say!")
        
        const uniqueSetId = `BUNDLE-${Date.now()}`

        // 1. Masukin TOP dengan metadata Color
        await addToCart({ 
          variantId: selectedModalTopVariant.id, 
          quantity: setQuantity, 
          countryCode: countryCode || "id",
          metadata: { 
            is_bundle: true, 
            bundle_id: uniqueSetId, 
            bundle_type: "TOP",
            size: topSize,
            color: colorName, // 🌟 Logic Color masuk sini say!
          }
        })
        
        // 2. Masukin BOTTOM dengan metadata Color
        await addToCart({ 
          variantId: selectedModalBottomVariant.id, 
          quantity: setQuantity, 
          countryCode: countryCode || "id",
          metadata: { 
            is_bundle: true, 
            bundle_id: uniqueSetId, 
            bundle_type: "BOTTOM",
            size: bottomSize,
            color: colorName, // 🌟 Logic Color masuk sini juga!
          }
        })

        alert(`Berhasil masuk keranjang!`)
        setIsSetModalOpen(false)
      } else {
        // Logic reguler (One-Piece) juga kita kasih metadata color
        if (!selectedRegulerVariant?.id) return alert("Pilih size dulu ya say!")
        await addToCart({ 
          variantId: selectedRegulerVariant.id, 
          quantity: 1, 
          countryCode: countryCode || "id",
          metadata: {
            color: colorName // 🌟 Biar admin tau warna apa yang dibeli
          }
        })
      }
    } catch (error) {
      alert("Gagal menambahkan ke keranjang.")
    } finally {
      setIsAdding(false)
    }
  }

  if (!selectedType) return null;

  return (
    <div className="flex flex-col mt-1">
      <h2 className="text-xl md:text-2xl font-black text-[#EF7044] mb-4">{mainDisplayPrice}</h2>

      <div className="flex justify-between items-center mb-6">
        <p className="text-[13px] text-gray-500 font-medium">Color : {colorName}</p>
        <div className="flex items-center gap-2">
          <button onClick={toggleWishlist} className={`p-2 border rounded-full transition-colors ${isWishlisted ? "border-[#EF7044] bg-[#EF7044] text-white" : "border-[#EF7044] text-[#EF7044] hover:bg-orange-50"}`}>
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false)} disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)} className="p-2 border border-[#EF7044] rounded-full hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingCart className={`w-5 h-5 ${isAdding ? "text-gray-400" : "text-[#EF7044]"}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-row items-start justify-between gap-3 mb-8">
        
        {/* KIRI: SIZE */}
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
              <p className="text-[13px] text-gray-500 font-medium mb-3">
                Size <span className="ml-2">: {selectedSize || "Select"}</span>
              </p>
              <div className="flex flex-row flex-wrap gap-1.5 mb-4">
                {sizesForType.map((size: SizeData) => (
                  <button key={size.label} disabled={!size.inStock} onClick={() => setSelectedSize(size.label)}
                    className={`relative w-8 h-8 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all
                      ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : selectedSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700 hover:border-[#EF7044]'}
                    `}>
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

        {/* KANAN: SET / TOP / BOTTOM */}
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

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-[480px]">
          <button onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false)} disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)} className="w-full bg-[#EF7044] text-white py-4 rounded-full font-bold text-lg tracking-wide hover:bg-[#d65f36] active:scale-95 transition-all shadow-lg disabled:bg-gray-300">
            {isAdding ? "PROCESSING..." : "BUY NOW"}
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 MODAL POPUP SET (BUNDLING) */}
      {/* ========================================= */}
      {isSetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="relative bg-white w-full max-w-[480px] h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-20">
            
            <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-center">
              <button onClick={() => setIsSetModalOpen(false)} className="absolute left-4 p-1 text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
              <h3 className="font-bold text-lg">Product Variant</h3>
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

              {/* Thumbnails SET/TOP/BOTTOM */}
              <div className="flex gap-2 mb-6">
                <div className="w-16 h-16 rounded-xl border-2 border-[#EF7044] overflow-hidden relative opacity-70">
                   <img src={mainImage} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-[#EF7044]/30 flex items-center justify-center"><span className="text-white text-[9px] font-bold">SET</span></div>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden relative">
                   <img src={mainImage} className="w-full h-full object-cover object-top scale-[1.5]" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><span className="text-white text-[9px] font-bold">TOP</span></div>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden relative">
                   <img src={mainImage} className="w-full h-full object-cover object-bottom scale-[1.5]" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><span className="text-white text-[9px] font-bold">BOTTOM</span></div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-[13px] text-gray-500 font-medium">Color : {colorName}</span>
                <div className="w-8 h-8 rounded-full border-2 border-[#EF7044] p-[2px]">
                  <div className="w-full h-full rounded-full bg-white border border-gray-200 shadow-sm"></div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-end mb-3">
                  <p className="text-[13px] text-gray-500 font-medium">Top Size <span className="ml-2">: {topSize || "Select"}</span></p>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-[11px] font-bold text-black border-b border-black pb-[1px]">
                    <Ruler className="w-3 h-3" /> Size Guide <span className="ml-1">›</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  {modalTopSizes.map((size: SizeData) => (
                    <button key={size.label} disabled={!size.inStock} onClick={() => setTopSize(size.label)}
                      className={`relative w-10 h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : topSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                      {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[13px] text-gray-500 font-medium mb-3">Bottom Size <span className="ml-2">: {bottomSize || "Select"}</span></p>
                <div className="flex gap-2">
                  {modalBottomSizes.map((size: SizeData) => (
                    <button key={size.label} disabled={!size.inStock} onClick={() => setBottomSize(size.label)}
                      className={`relative w-10 h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : bottomSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                      {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500 font-medium">Quantity :</span>
                  {topSize && bottomSize && maxAvailableSet <= 5 && (
                    <span className="text-xs text-[#EF7044] font-medium">Hurry! Only <span className="font-bold">{maxAvailableSet}</span> left.</span>
                  )}
                </div>
                <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-4">
                  <button onClick={() => setSetQuantity(Math.max(1, setQuantity - 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity <= 1}>−</button>
                  <span className="text-sm font-bold w-4 text-center">{setQuantity}</span>
                  <button onClick={() => setSetQuantity(Math.min(maxAvailableSet, setQuantity + 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity >= maxAvailableSet || !topSize || !bottomSize}>+</button>
                </div>
              </div>
            </div>

            {/* DUA TOMBOL SESUAI DESAIN */}
            <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => handleBuyNow(true)} 
                disabled={isAdding || !topSize || !bottomSize}
                className="flex-1 border-2 border-[#EF7044] text-[#EF7044] bg-white py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400"
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => handleBuyNow(true)} 
                disabled={isAdding || !topSize || !bottomSize}
                className="flex-1 bg-[#EF7044] text-white py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-[#d65f36] transition-colors disabled:opacity-50 disabled:bg-gray-300"
              >
                {isAdding ? "WAIT..." : "BUY NOW"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 📐 POPUP SIZE GUIDE (FULL CODE) */}
      {/* ========================================= */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
          
          <div className="relative bg-white w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[20px] p-6 shadow-2xl animate-in zoom-in-95 scrollbar-hide">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-medium text-gray-900">Size Guide</h2>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-gray-900 hover:text-gray-500 transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <img src="/logo-niconico-black.png" alt="Niconico Resort" className="h-16 object-contain" />
            </div>

            <div className="mb-8 px-2">
              <h3 className="font-bold text-[14px] text-center mb-3">How to measure</h3>
              <p className="text-[12px] text-gray-800 text-center leading-relaxed">
                Every body is different, and we at Niconico celebrate that fact with swimsuits and bikinis catered to all shapes and sizes. When measuring your body, the measuring tape should be as close to your skin as possible. It's best not to measure over thick layers of clothing; thin undergarments or none at all will give you the most accurate numbers.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-[14px] text-center mb-3">Swimwear</h3>
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-center">
                  <thead className="font-bold text-gray-900">
                    <tr>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Size</th>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Bust</th>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Waist</th>
                      <th className="py-3 border-b border-gray-200 w-1/4">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-medium">
                    <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">S</td><td className="py-3 border-b border-r border-gray-200">80-86</td><td className="py-3 border-b border-r border-gray-200">62-68</td><td className="py-3 border-b border-gray-200">86-92</td></tr>
                    <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">M</td><td className="py-3 border-b border-r border-gray-200">86-92</td><td className="py-3 border-b border-r border-gray-200">68-74</td><td className="py-3 border-b border-gray-200">92-98</td></tr>
                    <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">L</td><td className="py-3 border-b border-r border-gray-200">92-98</td><td className="py-3 border-b border-r border-gray-200">74-80</td><td className="py-3 border-b border-gray-200">98-104</td></tr>
                    <tr><td className="py-3 border-r border-gray-200 text-gray-900">XL</td><td className="py-3 border-r border-gray-200">98-104</td><td className="py-3 border-r border-gray-200">80-86</td><td className="py-3 border-gray-200">104-110</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-[14px] text-center mb-3">Resort Wear</h3>
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-center">
                  <thead className="font-bold text-gray-900">
                    <tr>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Size</th>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Bust</th>
                      <th className="py-3 border-b border-r border-gray-200 w-1/4">Waist</th>
                      <th className="py-3 border-b border-gray-200 w-1/4">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-medium">
                    <tr><td className="py-3 border-b border-r border-gray-200 text-gray-900">S-M</td><td className="py-3 border-b border-r border-gray-200">80-90</td><td className="py-3 border-b border-r border-gray-200">62-74</td><td className="py-3 border-b border-gray-200">86-98</td></tr>
                    <tr><td className="py-3 border-r border-gray-200 text-gray-900">M-L</td><td className="py-3 border-r border-gray-200">90-100</td><td className="py-3 border-r border-gray-200">74-86</td><td className="py-3 border-gray-200">98-110</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="w-40 shrink-0">
                <img src="/size-guide-model.png" alt="Measurement Guide" className="w-full h-auto object-contain" />
              </div>
              <div className="flex flex-col gap-5 pt-2">
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-1">Bust</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed">Measure around the fullest part of your bust.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-1">Waist</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed">Find your natural waistline. Generally, it's just below your last rib and a couple of inches above your navel.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-1">Hips</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed">Find the widest part of your hips. Generally, it's 20 cm below your waist.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pb-2">
              <button className="bg-[#EF7044] text-white text-[11px] font-bold uppercase tracking-wide px-6 py-2.5 rounded-full hover:bg-[#d65f36] transition-colors shadow-md">
                Download Size Guide
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default ProductActions