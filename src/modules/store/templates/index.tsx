"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Heart, Search, X, ChevronDown, ArrowUp } from "lucide-react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listProducts } from "@lib/data/products";
import { useCart } from "@/context/cart-context";
import { addToCart as medusaAddToCart } from "@lib/data/cart";

// Kategori Atas
const topCategories = [
  { name: "ALL", handle: "all", img: "/all-cat.jpg" },
  { name: "BIKINIS", handle: "bikinis", img: "/bikini-cat.jpg" },
  { name: "SWIMSUIT", handle: "swimsuit", img: "/swimsuit-cat.jpg" },
  { name: "RESORT WEAR", handle: "resort-wear", img: "/resort-cat.jpg" },
  { name: "MEN'S WEAR", handle: "mens-wear", img: "/mens-cat.jpg" },
  { name: "ACCESORIES", handle: "accesories", img: "/acc-cat.jpg" },
];

export default function StoreTemplate() {
  const { countryCode } = useParams();
  const { addToCart: updateNavbarCartCount } = useCart();
  
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
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null); // Pakai ID produk biar spesifik
  
  // STATE FILTER
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(200000);
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedDrawerCategory, setSelectedDrawerCategory] = useState("");

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

  // 1. FUNGSI FETCH PRODUK (Filter Logic)
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
          fields: "*collection,*variants,*variants.prices",
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

  // ACTION FILTER
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
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  // 2. LOGIC ADD TO CART & POPUP VARIAN
  const handleAddToCartClick = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // Cek apakah varian lebih dari 1
    if (product.variants && product.variants.length > 1) {
      setSelectedProduct(product); // Buka popup
      setSelectedVariant(null); 
    } else {
      // Langsung eksekusi kalau gak ada varian
      executeAddToCart(product, product.variants?.[0]);
    }
  };

  const executeAddToCart = async (product: any, variant: any) => {
    if (!variant) return;
    setIsAdding(product.id);
    try {
      await medusaAddToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode: countryCode as string,
      });
      if (updateNavbarCartCount) updateNavbarCartCount();
      setSelectedProduct(null); // Tutup popup setelah sukses
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(null);
    }
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

                {/* ADD TO CART BUTTON (+) */}
                <button onClick={(e) => handleAddToCartClick(e, product)} className="absolute bottom-3 right-3 w-9 h-9 bg-[#EF7044] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-transform z-10">
                  {isAdding === product.id ? <span className="animate-spin text-xs">...</span> : "+"}
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
          POPUP PILIH VARIAN (ANTI-TENGGELAM)
          ========================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative bg-white w-full max-w-md rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-full duration-300 flex flex-col max-h-[85vh]">
            {/* Header Popup */}
            <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-50 flex-shrink-0">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                  <img src={selectedProduct.thumbnail} alt="Thumb" className="w-full h-full object-cover" />
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{selectedProduct.title}</h4>
                  <p className="text-[#EF7044] font-black text-xl">{formatPrice(getProductPrice(selectedProduct))}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-300 text-4xl leading-none hover:text-gray-500 transition-colors">&times;</button>
            </div>

            {/* Area Varian (Bisa di-scroll jika varian banyak) */}
            <div className="p-8 overflow-y-auto scrollbar-hide flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4 font-black">Select Option</p>
              <div className="flex flex-wrap gap-3 pb-4">
                {selectedProduct.variants?.map((v: any) => (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVariant(v)} 
                    className={`px-6 py-3 rounded-full border-2 font-bold transition-all text-sm ${
                      selectedVariant?.id === v.id ? "border-[#EF7044] bg-[#EF7044] text-white shadow-lg" : "border-gray-100 text-gray-600 bg-gray-50 hover:border-[#EF7044]"
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Popup (Tombol Confirm) */}
            <div className="p-8 pt-4 border-t border-gray-50 flex-shrink-0">
              <button 
                onClick={() => executeAddToCart(selectedProduct, selectedVariant)} 
                disabled={!selectedVariant || isAdding === selectedProduct.id} 
                className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                  selectedVariant && isAdding !== selectedProduct.id ? "bg-[#EF7044] text-white shadow-xl shadow-[#EF7044]/30" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isAdding === selectedProduct.id ? "Adding..." : "Confirm Add to Cart"}
              </button>
            </div>
          </div>
        </div>
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
              <p className="text-[15px] font-medium text-gray-900 mb-3">Category</p>
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