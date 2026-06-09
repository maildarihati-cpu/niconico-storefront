"use client"

import React, { useState, useMemo, useEffect, ReactNode } from "react"
import { ShoppingCart, Heart, X, Ruler } from "lucide-react"
import { addToCart } from "@lib/data/cart" 
import { useParams, useRouter } from "next/navigation" 
import { updateCustomerWishlist } from "@lib/data/customer"
import { usePostHog } from 'posthog-js/react'

import { useCart } from "@/context/cart-context/cart-context"

interface SizeData {
  label: string
  inStock: boolean
  variant: any
  qty: number
}

// 🌟 PERBAIKAN: Menambahkan `children` agar Accordion bisa diselipkan sesuai desain
const ProductActions = ({ product, region, customer, children }: { product: any, region: any, customer: any, children?: ReactNode }) => {
  const countryCode = useParams().countryCode as string
  const router = useRouter() 
  const { cart: mainCart, addToCart: refreshCartCount } = useCart() 
  const posthog = usePostHog()

  // 🌟 LOGIKA WARNA
  const colorName = product?.metadata?.color_name || "White"
  const colorId = product?.metadata?.color_id || "#FFFFFF" 
  const groupId = product?.metadata?.group_id || null 

  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  // 🌟 FETCH PRODUK SAUDARA (PAKAI HANDLE LOGIC BYPASS MEDUSA)
  useEffect(() => {
    const fetchRelatedColors = async () => {
      if (!groupId) {
        setRelatedProducts([product]); 
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

        // Tarik 100 produk terbaru
        const res = await fetch(`${backendUrl}/store/products?limit=100`, {
          method: "GET",
          headers: {
            "x-publishable-api-key": apiKey,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          
          // Filter saudara berdasarkan kemiripan 'handle' (karena metadata disembunyikan API)
          const trueSiblings = data.products?.filter((p: any) => {
            return p.handle?.toLowerCase().includes(groupId.toLowerCase());
          }) || [];

          if (trueSiblings.length > 0) {
            setRelatedProducts(trueSiblings);
          } else {
            setRelatedProducts([product]);
          }
        } else {
          setRelatedProducts([product]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([product]);
      }
    };

    fetchRelatedColors();
  }, [groupId, product]);

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
      
      if (sizeVal.toLowerCase().includes("default option")) {
        sizeVal = "All Size"
      }

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

  const [isSetModalOpen, setIsSetModalOpen] = useState(false)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  
  const [topSize, setTopSize] = useState<string | null>(null)
  const [bottomSize, setBottomSize] = useState<string | null>(null)
  const [setQuantity, setSetQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const getModalSizes = (variants: any[]) => {
    return variants.map((v: any) => {
      let sizeVal = v.options?.find((o: any) => !["top", "bottom"].includes(o.value?.toLowerCase().trim()))?.value || "All Size"
      
      if (sizeVal.toLowerCase().includes("default option")) {
        sizeVal = "All Size"
      }

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setIsWishlisted(savedWishlist.includes(product.id))
    }
  }, [product.id])

  // 🌟 LOGIKA WISHLIST YANG SUDAH DIPERBAIKI (SINKRONISASI AKTIF)
  const toggleWishlist = async () => {
    const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    let updatedWishlist = []

    if (isWishlisted) {
      updatedWishlist = localWishlist.filter((id: string) => id !== product.id)
    } else {
      updatedWishlist = [...localWishlist, product.id]
    }
    
    // 1. Selalu simpan di Local Storage agar responsif di sisi kustomer
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    setIsWishlisted(!isWishlisted)

    // 2. Jurus Update Database Medusa Jika Login
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.niconicoresort.com"
    try {
      const customerRes = await fetch(`${backendUrl}/store/customers/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      }).catch(() => null)

      if (customerRes && customerRes.ok) {
        const { customer } = await customerRes.json()
        await fetch(`${backendUrl}/store/customers/me`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            metadata: {
              ...customer.metadata,
              wishlist: updatedWishlist
            }
          })
        })
      }
    } catch (err) {
      console.error("Error synchronizing wishlist with database:", err)
    }
  }

  // 🌟 LOGIKA BUY NOW YANG SUDAH DIUBAH (Langsung Lempar ke Cart)
  const handleBuyNow = async (isSetBundle = false, redirectToCart = false) => {
    setIsAdding(true)
    try {
      if (isSetBundle) {
        if (!selectedModalTopVariant || !selectedModalBottomVariant) return alert("Please select a size for both Top and Bottom!")
        const uniqueSetId = `BUNDLE-${Date.now()}`
        
        await addToCart({ 
          variantId: selectedModalTopVariant.id, 
          quantity: setQuantity, 
          countryCode: countryCode || "id",
          metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "TOP", size: topSize, color: colorName }
        })
        await addToCart({ 
          variantId: selectedModalBottomVariant.id, 
          quantity: setQuantity, 
          countryCode: countryCode || "id",
          metadata: { is_bundle: true, bundle_id: uniqueSetId, bundle_type: "BOTTOM", size: bottomSize, color: colorName }
        })

        // 🌟 SUNTIKKAN SENSOR 'ADD TO CART' UNTUK PEMBELIAN BUNDLE DI SINI
        if (posthog) {
          posthog.capture('add_to_cart', {
            product_id: product.id,
            product_name: `${product.title} (Set Bundle)`,
            product_type: "SET",
            quantity: setQuantity
          })
        }

        if (refreshCartCount) refreshCartCount();

        if (redirectToCart) {
          router.push(`/${countryCode}/cart`);
        } else {
          alert(`Successfully added ${setQuantity} bundle(s) to cart!`);
          setIsSetModalOpen(false);
        }

      } else {
        if (!selectedRegulerVariant?.id) return alert("Please select a size first!")
        await addToCart({ 
          variantId: selectedRegulerVariant.id, 
          quantity: setQuantity, 
          countryCode: countryCode || "id",
          metadata: { color: colorName }
        })
        
        // 🌟 SUNTIKKAN SENSOR 'ADD TO CART' UNTUK PEMBELIAN REGULER DI SINI
        if (posthog) {
          posthog.capture('add_to_cart', {
            product_id: product.id,
            product_name: product.title,
            product_type: selectedType, // Mencatat apakah dia beli Top saja atau Bottom saja
            quantity: setQuantity
          })
        }

        if (refreshCartCount) refreshCartCount();

        if (redirectToCart) {
          router.push(`/${countryCode}/cart`);
        } else {
          alert(`Successfully added ${setQuantity} item(s) to cart!`);
        }
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  if (!selectedType) return null;

  return (
    <div className="flex flex-col lg:mt-2">
      
      <h2 className="text-2xl md:text-3xl lg:text-[28px] font-bold text-[#EF7044] mb-6">{mainDisplayPrice}</h2>

      {/* ======================================================= */}
      {/* 🌟 DESKTOP UI (Layout presisi sesuai referensi gambar) */}
      {/* ======================================================= */}
      <div className="hidden lg:flex flex-col w-full">
        
        {/* Color Section */}
        <div className="flex items-center gap-3 mb-5">
          <p className="text-[15px] text-gray-500 font-medium">Color :</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-gray-300 p-[2px] shadow-sm flex-shrink-0">
              <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: colorId }}></div>
            </div>
            <span className="text-[15px] font-medium text-gray-900">{colorName}</span>
          </div>
          
          {/* Related Colors Logic */}
          <div className="flex flex-wrap gap-2 ml-4">
            {relatedProducts.length > 0 && relatedProducts.map((relProd: any) => {
              if (relProd.id === product.id) return null; // Skip active color, already shown
              
              let extractedColor = "#eeeeee"; 
              let displayName = "Unknown";
              
              if (relProd.metadata?.color_id) {
                 extractedColor = relProd.metadata.color_id;
                 displayName = relProd.metadata.color_name || "Unknown";
              } else if (relProd.handle) {
                 const handleStr = relProd.handle.toLowerCase();
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
                     extractedColor = cHex;
                     displayName = cName.toUpperCase();
                     foundColor = true;
                     break;
                   }
                 }
                 if (!foundColor) {
                   const parts = handleStr.split('-');
                   const lastWord = parts[parts.length - 1];
                   extractedColor = lastWord; 
                   displayName = lastWord.toUpperCase();
                 }
              }

              return (
                <button 
                  key={relProd.id}
                  title={displayName}
                  onClick={() => router.push(`/${countryCode}/products/${relProd.handle}`)}
                  className="w-7 h-7 rounded-full p-[2px] transition-all hover:scale-110 border border-gray-300 hover:border-gray-500 shadow-sm"
                >
                  <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: extractedColor }}></div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div className="flex flex-col gap-3 mb-5">
          {selectedType === "SET" ? (
             <p className="text-[15px] text-gray-500 font-medium">Size <span className="ml-1 text-gray-900">: Mix & Match</span></p>
          ) : (
             <p className="text-[15px] text-gray-500 font-medium">Size <span className="ml-1 text-gray-900">: {selectedSize || "Select"}</span></p>
          )}

          {selectedType === "SET" ? (
             <button onClick={() => setIsSetModalOpen(true)} className="w-max bg-gray-900 text-white text-[13px] font-bold px-6 py-2.5 rounded-full hover:bg-[#EF7044] transition-colors">
               Select Sizes
             </button>
          ) : (
             !(sizesForType.length === 1 && sizesForType[0].label === "All Size") && (
               <div className="flex flex-row flex-wrap gap-2.5">
                 {sizesForType.map((size: SizeData) => (
                   <button key={size.label} disabled={!size.inStock} onClick={() => setSelectedSize(size.label)}
                     className={`relative h-11 shrink-0 rounded-full border flex items-center justify-center text-[13px] font-bold transition-all
                       ${size.label === "All Size" ? "w-max px-6" : "w-11"}
                       ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : selectedSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-500 hover:border-[#EF7044] hover:text-[#EF7044]'}
                     `}>
                     {size.label}
                     {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                   </button>
                 ))}
               </div>
             )
          )}
        </div>

        {/* Size Guide Link */}
        <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-[12px] font-bold text-black hover:text-[#EF7044] transition-colors w-max mb-6">
          <Ruler className="w-4 h-4" /> Size Guide <span className="ml-1">›</span>
        </button>

        {/* Bundles Options */}
        {selectedType !== "REGULAR" && (
          <div className="flex flex-row gap-4 mb-4">
            {availableTypes.includes("SET") && (
              <button onClick={() => { setSelectedType("SET"); setIsSetModalOpen(true); }} className="w-[105px] flex flex-col gap-2 group">
                <div className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all ${selectedType === "SET" ? "border-[#EF7044] shadow-md" : "border-transparent"}`}>
                  <img src={mainImage} className="w-full h-full object-cover object-center" alt="Set" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30"><span className="text-white text-[11px] font-bold tracking-widest">SET</span></div>
                </div>
                <p className="text-[10px] text-center font-medium text-gray-500 truncate">{formatPrice(setPrice)}</p>
              </button>
            )}

            {availableTypes.includes("TOP") && (
              <button onClick={() => setSelectedType("TOP")} className="w-[105px] flex flex-col gap-2 group">
                <div className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all ${selectedType === "TOP" ? "border-[#EF7044] shadow-md" : "border-transparent"}`}>
                  <img src={mainImage} className="w-full h-full object-cover object-top scale-[1.3] origin-top" alt="Top" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30"><span className="text-white text-[11px] font-bold tracking-widest">TOP</span></div>
                </div>
                <p className="text-[10px] text-center font-medium text-gray-500 truncate">{formatPrice(getVariantPrice(topVariants[0]) || 0)}</p>
              </button>
            )}

            {availableTypes.includes("BOTTOM") && (
              <button onClick={() => setSelectedType("BOTTOM")} className="w-[105px] flex flex-col gap-2 group">
                <div className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all ${selectedType === "BOTTOM" ? "border-[#EF7044] shadow-md" : "border-transparent"}`}>
                  <img src={mainImage} className="w-full h-full object-cover object-bottom scale-[1.3] origin-bottom" alt="Bottom" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30"><span className="text-white text-[11px] font-bold tracking-widest">BOTTOM</span></div>
                </div>
                <p className="text-[10px] text-center font-medium text-gray-500 truncate">{formatPrice(getVariantPrice(bottomVariants[0]) || 0)}</p>
              </button>
            )}
          </div>
        )}

        {/* 🌟 Accordion Children diselipkan di sini (Sebelum tombol Cart) */}
        {children}

        {/* Desktop Actions (Quantity, Add to Cart, Buy Now, Wishlist) */}
        <div className="flex flex-col gap-6 w-full pt-4">
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-full px-5 py-2.5 gap-6">
              <button onClick={() => setSetQuantity(Math.max(1, setQuantity - 1))} className="text-gray-500 font-bold text-lg hover:text-[#EF7044] transition-colors leading-none pb-0.5">−</button>
              <span className="text-[15px] font-bold w-4 text-center leading-none">{setQuantity}</span>
              <button onClick={() => setSetQuantity(Math.min(maxAvailableSet, setQuantity + 1))} className="text-gray-500 font-bold text-lg hover:text-[#EF7044] transition-colors leading-none pb-0.5">+</button>
            </div>
            <span className="text-[14px] font-medium text-gray-800">Quantity</span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-4 w-full">
            <button 
              onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false, false)} 
              disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)}
              className="flex-1 border-2 border-[#EF7044] text-[#EF7044] bg-white h-[54px] rounded-full font-bold text-[15px] tracking-wide hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400"
            >
              Add to Cart
            </button>
            
            <button 
              onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false, true)} 
              disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)}
              className="flex-1 bg-[#EF7044] text-white h-[54px] rounded-full font-bold text-[15px] tracking-wide shadow-md hover:bg-[#d65f36] transition-colors disabled:opacity-50 disabled:bg-gray-300"
            >
              {isAdding ? "WAIT..." : "Buy Now"}
            </button>

            {/* Wishlist Circle Button */}
            <button 
              onClick={toggleWishlist} 
              className={`w-[54px] h-[54px] shrink-0 flex items-center justify-center border-2 rounded-full transition-colors ${
                isWishlisted ? 'border-[#EF7044] text-[#EF7044] bg-orange-50' : 'border-gray-300 text-gray-400 hover:border-[#EF7044] hover:text-[#EF7044]'
              }`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} strokeWidth={isWishlisted ? 2.5 : 2} />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================= */}
      {/* 📱 MOBILE UI (Layout Asli Tidak Dirubah) */}
      {/* ======================================================= */}
      <div className="lg:hidden flex flex-col w-full">
        
        {/* Warna & Ikon */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <p className="text-[13px] text-gray-500 font-medium">Color : {colorName}</p>
            
            <div className="flex flex-wrap gap-2">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((relProd: any) => {
                  const isActive = relProd.id === product.id;
                  let extractedColor = "#eeeeee"; 
                  let displayName = "Unknown";
                  
                  if (relProd.metadata?.color_id) {
                     extractedColor = relProd.metadata.color_id;
                     displayName = relProd.metadata.color_name || "Unknown";
                  } else if (relProd.handle) {
                     const handleStr = relProd.handle.toLowerCase();
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
                         extractedColor = cHex;
                         displayName = cName.toUpperCase();
                         foundColor = true;
                         break;
                       }
                     }
                     if (!foundColor) {
                       const parts = handleStr.split('-');
                       const lastWord = parts[parts.length - 1];
                       extractedColor = lastWord; 
                       displayName = lastWord.toUpperCase();
                     }
                  }

                  return (
                    <button 
                      key={relProd.id}
                      title={displayName}
                      onClick={() => {
                        if (!isActive) router.push(`/${countryCode}/products/${relProd.handle}`);
                      }}
                      className={`w-7 h-7 rounded-full p-[2px] transition-all hover:scale-110 ${isActive ? 'border-2 border-[#EF7044] cursor-default' : 'border border-gray-300 hover:border-gray-500 shadow-sm'}`}
                    >
                      <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: extractedColor }}></div>
                    </button>
                  )
                })
              ) : (
                <div className="w-7 h-7 rounded-full p-[2px] border-2 border-[#EF7044] shadow-sm cursor-default">
                  <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: colorId }}></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className={`p-2 border rounded-full transition-colors ${isWishlisted ? "border-[#EF7044] bg-[#EF7044] text-white" : "border-[#EF7044] text-[#EF7044] hover:bg-orange-50"}`}>
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false, false)} disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)} className="p-2 border border-[#EF7044] rounded-full hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart className={`w-5 h-5 ${isAdding ? "text-gray-400" : "text-[#EF7044]"}`} />
            </button>
          </div>
        </div>

        {/* Size Selection */}
        <div className="flex flex-row items-start justify-between gap-3 mb-8">
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
                  <p className="text-[13px] text-gray-500 font-medium">
                    Size <span className="ml-2">: {selectedSize || "Select"}</span>
                  </p>
                  {(() => {
                    const currentSize = sizesForType.find((s: SizeData) => s.label === selectedSize);
                    if (currentSize?.variant?.manage_inventory) {
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentSize.qty <= 3 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                          Stock Available: {currentSize.qty}
                        </span>
                      )
                    }
                    return null;
                  })()}
                </div>

                {!(sizesForType.length === 1 && sizesForType[0].label === "All Size") && (
                  <div className="flex flex-row flex-wrap gap-1.5 mb-4">
                    {sizesForType.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setSelectedSize(size.label)}
                        className={`relative h-8 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all
                          ${size.label === "All Size" ? "w-max px-3" : "w-8"}
                          ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : selectedSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700 hover:border-[#EF7044]'}
                        `}>
                        {size.label}
                        {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                      </button>
                    ))}
                  </div>
                )}
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

        {/* 🌟 Accordion Children ditaruh di sini untuk Mobile */}
        {children}

        {/* Sticky Buy Now Mobile */}
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto max-w-[480px]">
            <button onClick={() => selectedType === "SET" ? setIsSetModalOpen(true) : handleBuyNow(false, true)} disabled={isAdding || (selectedType !== "SET" && !selectedRegulerVariant)} className="w-full bg-[#EF7044] text-white py-4 rounded-full font-bold text-lg tracking-wide hover:bg-[#d65f36] active:scale-95 transition-all shadow-lg disabled:bg-gray-300">
              {isAdding ? "PROCESSING..." : "BUY NOW"}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 🌟 MODALS (BERLAKU UNTUK MOBILE & DESKTOP) */}
      {/* ======================================================= */}
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

              <div className="flex items-center gap-3 mb-6">
                <span className="text-[13px] text-gray-500 font-medium">Color : {colorName}</span>
                <div className="w-8 h-8 rounded-full border border-gray-300 p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full border border-gray-100" style={{ backgroundColor: colorId }}></div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-gray-500 font-medium">Top Size <span className="ml-2">: {topSize || "Select"}</span></p>
                    {(() => {
                      const cTop = modalTopSizes.find((s: SizeData) => s.label === topSize);
                      if (cTop?.variant?.manage_inventory) {
                        return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cTop.qty <= 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stok: {cTop.qty}</span>
                      }
                      return null;
                    })()}
                  </div>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-[11px] font-bold text-black border-b border-black pb-[1px]">
                    <Ruler className="w-3 h-3" /> Size Guide <span className="ml-1">›</span>
                  </button>
                </div>
                {!(modalTopSizes.length === 1 && modalTopSizes[0].label === "All Size") && (
                  <div className="flex gap-2">
                    {modalTopSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setTopSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all 
                          ${size.label === "All Size" ? "w-max px-4" : "w-10"}
                          ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : topSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                        {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[13px] text-gray-500 font-medium">Bottom Size <span className="ml-2">: {bottomSize || "Select"}</span></p>
                  {(() => {
                    const cBot = modalBottomSizes.find((s: SizeData) => s.label === bottomSize);
                    if (cBot?.variant?.manage_inventory) {
                      return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cBot.qty <= 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>Stok: {cBot.qty}</span>
                    }
                    return null;
                  })()}
                </div>
                {!(modalBottomSizes.length === 1 && modalBottomSizes[0].label === "All Size") && (
                  <div className="flex gap-2">
                    {modalBottomSizes.map((size: SizeData) => (
                      <button key={size.label} disabled={!size.inStock} onClick={() => setBottomSize(size.label)}
                        className={`relative h-10 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all 
                          ${size.label === "All Size" ? "w-max px-4" : "w-10"}
                          ${!size.inStock ? 'border-gray-200 text-gray-300 cursor-not-allowed' : bottomSize === size.label ? 'bg-[#EF7044] border-[#EF7044] text-white shadow-md' : 'border-gray-300 text-gray-700'}`}>
                        {size.label} {!size.inStock && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500 font-medium">Quantity :</span>
                  {topSize && bottomSize && (
                    <span className={`text-xs font-medium ${maxAvailableSet <= 5 ? 'text-red-500' : 'text-[#EF7044]'}`}>
                      Sisa Set: <span className="font-bold">{maxAvailableSet}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-4">
                  <button onClick={() => setSetQuantity(Math.max(1, setQuantity - 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity <= 1}>−</button>
                  <span className="text-sm font-bold w-4 text-center">{setQuantity}</span>
                  <button onClick={() => setSetQuantity(Math.min(maxAvailableSet, setQuantity + 1))} className="text-gray-500 font-bold text-lg disabled:opacity-30" disabled={setQuantity >= maxAvailableSet || !topSize || !bottomSize}>+</button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => handleBuyNow(true, false)} 
                disabled={isAdding || !topSize || !bottomSize}
                className="flex-1 border-2 border-[#EF7044] text-[#EF7044] bg-white py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400"
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => handleBuyNow(true, true)} 
                disabled={isAdding || !topSize || !bottomSize}
                className="flex-1 bg-[#EF7044] text-white py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-[#d65f36] transition-colors disabled:opacity-50 disabled:bg-gray-300"
              >
                {isAdding ? "WAIT..." : "BUY NOW"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {/* 🌟 INI BAGIAN YANG DIUBAH SESUAI REQUEST BOS */}
                <img src="/niconico-swimwear-meassurements-small.png" alt="Measurement Guide" className="w-full h-auto object-contain" />
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