"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { addToCart } from "@lib/data/cart"; 
import { listProducts } from "@lib/data/products";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const collectionsConfig = {
  "New Arrivals": { handle: "new-arrivals", link: "/collections/new-arrivals" },
  "Best Seller": { handle: "best-seller", link: "/collections/best-seller" },
  "Signature": { handle: "signature", link: "/collections/signature" },
  "Island Escape": { handle: "island-escape", link: "/collections/island-escape" }
};

const tabs = ["New Arrivals", "Best Seller", "Signature", "Island Escape"];

export default function TopCollections() {
  const { countryCode } = useParams();
  const { addToCart: updateNavbarCartCount } = useCart();

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const activeConfig = collectionsConfig[activeTab as keyof typeof collectionsConfig];

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProductsByCollection = async () => {
      setIsLoading(true);
      setProducts([]); 
      try {
        const data = await listProducts({
          queryParams: { 
            limit: 100,
            order: "-created_at",
            fields: "*collection,*variants,*variants.prices" 
          }, 
          countryCode: countryCode as string,
        }).catch(() => null);

        if (data && data.response) {
          const filtered = data.response.products.filter((p: any) => {
            const productHandle = p.collection?.handle?.toLowerCase();
            const targetHandle = activeConfig.handle.toLowerCase();
            return productHandle === targetHandle;
          });
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsByCollection();
  }, [activeTab, countryCode, activeConfig.handle]);

  // SCROLL LOCK
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProduct]);

  const dynamicHeroImage = products.length > 0 ? products[0].thumbnail : null;

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

  const handleAddToCartClick = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (product.variants && product.variants.length > 1) {
      setSelectedProduct(product);
      setSelectedVariant(null); 
    } else {
      executeAddToCart(product, product.variants?.[0]);
    }
  };

  const executeAddToCart = async (product: any, variant: any) => {
    if (!variant) return;
    setIsAdding(true);
    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode: countryCode as string,
      });
      if (updateNavbarCartCount) updateNavbarCartCount();
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="py-12 bg-white max-w-[1200px] mx-auto md:max-w-6xl relative">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">Top Collections</h2>

      {/* TABS (UI ASLI) */}
      <div className="flex overflow-x-auto gap-6 md:gap-8 px-4 mb-10 border-b border-gray-100 scrollbar-hide">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex flex-col items-center whitespace-nowrap min-w-max pb-3 relative group">
            <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all duration-300 ${activeTab === tab ? "bg-[#EF7044]" : "bg-transparent"}`}></div>
            <span className={`text-sm md:text-base transition-all duration-300 ${activeTab === tab ? "text-[#EF7044] font-bold" : "text-gray-400 hover:text-[#EF7044]"}`}>
              {tab}
            </span>
            <div className={`absolute bottom-0 left-0 h-[2px] bg-[#EF7044] transition-all duration-300 ${activeTab === tab ? "w-full" : "w-0"}`}></div>
          </button>
        ))}
      </div>

      <div className="px-4">
        {/* HERO IMAGE */}
        <div className="mb-10 flex justify-center">
          <LocalizedClientLink href={activeConfig.link} className="w-full max-w-2xl aspect-[3/4] md:aspect-[4/5] rounded-[32px] overflow-hidden block relative group shadow-xl bg-gray-50 border border-gray-100">
            {isLoading ? (
               <div className="w-full h-full animate-pulse bg-gray-200" />
            ) : dynamicHeroImage ? (
              <>
                <img src={dynamicHeroImage} alt={activeTab} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-8">
                    <span className="text-white font-bold text-sm md:text-lg px-8 py-4 bg-[#EF7044] rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest">
                      Explore {activeTab}
                    </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-medium italic">No products in this collection</div>
            )}
          </LocalizedClientLink>
        </div>

        {/* PRODUCT CAROUSEL */}
        {!isLoading && products.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 scrollbar-hide flex-nowrap items-start">
            {products.map((product) => (
              <div key={product.id} className="min-w-[170px] max-w-[170px] md:min-w-[240px] md:max-w-[240px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-[24px] overflow-hidden relative mb-4 group border border-gray-100 shadow-sm">
                  <img src={product.thumbnail || "/placeholder.png"} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button onClick={(e) => handleAddToCartClick(e, product)} className="absolute bottom-3 right-3 w-10 h-10 bg-[#EF7044] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border-2 border-white">
                    +
                  </button>
                  <LocalizedClientLink href={`/products/${product.handle}`} className="absolute inset-0 z-0" />
                </div>
                <div className="flex flex-col items-center text-center px-2">
                  <h3 className="text-xs md:text-sm text-gray-800 font-bold line-clamp-2 h-10 mb-1">{product.title}</h3>
                  <p className="text-[#EF7044] text-sm md:text-base font-black">{formatMedusaPrice(product)}</p>
                </div>
              </div>
            ))}
            <LocalizedClientLink href={activeConfig.link} className="min-w-[170px] md:min-w-[240px] aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 hover:border-[#EF7044] hover:bg-orange-50 transition-all group flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#EF7044] group-hover:text-white text-gray-400 transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <span className="text-gray-600 group-hover:text-[#EF7044] font-bold text-sm">View All</span>
            </LocalizedClientLink>
          </div>
        ) : !isLoading && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">Koleksi ini sedang disiapkan.</p>
          </div>
        )}
      </div>

      {/* POPUP VARIAN (SCROLLABLE & FIXED BOTTOM) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          
          {/* Konten dengan Max Height agar tidak melebihi layar */}
          <div className="relative bg-white w-full max-w-md rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-full duration-300 flex flex-col max-h-[85vh]">
            
            {/* Header (Tetap di atas) */}
            <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-50 flex-shrink-0">
              <div className="flex gap-4">
                <img src={selectedProduct.thumbnail} alt="Thumb" className="w-20 h-20 object-cover rounded-2xl shadow-sm flex-shrink-0" />
                <div className="pt-1">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{selectedProduct.title}</h4>
                  <p className="text-[#EF7044] font-black text-xl">{formatMedusaPrice(selectedProduct)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-300 text-4xl leading-none hover:text-gray-500 transition-colors">&times;</button>
            </div>

            {/* Scrollable Area (Tempat Varian) */}
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

            {/* Footer (Tombol Confirm tetap di bawah) */}
            <div className="p-8 pt-4 border-t border-gray-50 flex-shrink-0">
              <button 
                onClick={() => executeAddToCart(selectedProduct, selectedVariant)} 
                disabled={!selectedVariant || isAdding} 
                className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                  selectedVariant && !isAdding ? "bg-[#EF7044] text-white shadow-xl shadow-[#EF7044]/30" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isAdding ? "Adding..." : "Confirm Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}