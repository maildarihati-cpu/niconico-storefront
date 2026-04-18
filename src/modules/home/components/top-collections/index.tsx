"use client";

import { useState } from "react";
import Image from "next/image";
// IMPORT COLOKAN KERANJANG GLOBAL
import { useCart } from "@/context/cart-context"; 

// --- MOCK DATA (Tetap Sama) ---
const collectionsData = {
  "New Arrivals": {
    heroImage: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1000&auto=format&fit=crop",
    products: [
      { id: 1, name: "Jenna Bikini Black", price: "Rp. 550,000", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop", hasVariants: true, variants: ["S", "M", "L"] },
      { id: 2, name: "Debbie Swimsuit", price: "Rp. 1,200,000", image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=600&auto=format&fit=crop", hasVariants: true, variants: ["S", "M", "L", "XL"] },
      { id: 3, name: "Beach Hat (All Size)", price: "Rp. 300,000", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop", hasVariants: false, variants: [] },
    ],
    collectionLink: "/collections/new-arrivals"
  },
  "Best Seller": {
    heroImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
    products: [
        { id: 4, name: "Midnight One Piece", price: "Rp. 1,200,000", image: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?q=80&w=600&auto=format&fit=crop", hasVariants: true, variants: ["S", "M", "L"] },
        { id: 5, name: "Ocean Breeze Dress", price: "Rp. 1,500,000", image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=600&auto=format&fit=crop", hasVariants: true, variants: ["S", "M", "L"] },
        { id: 6, name: "Ribbed Bandeau", price: "Rp. 550,000", image: "https://images.unsplash.com/photo-1434389678369-1836691456d3?q=80&w=600&auto=format&fit=crop", hasVariants: false, variants: [] },
    ],
    collectionLink: "/collections/best-seller"
  },
  "Signature": {
    heroImage: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1000&auto=format&fit=crop",
    products: [], 
    collectionLink: "/collections/signature"
  },
  "Island Escape": {
    heroImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
    products: [],
    collectionLink: "/collections/island-escape"
  }
};

const tabs = ["New Arrivals", "Best Seller", "Signature", "Island Escape"];

export default function TopCollections() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const activeData = collectionsData[activeTab as keyof typeof collectionsData];

  // State UI
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  // AMBIL FUNGSI DARI CONTEXT
  const { addToCart } = useCart();

  // 1. LOGIC CLICK TOMBOL (+)
  const handleAddToCartClick = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation(); // Stop navigasi ke detail produk
    
    if (product.hasVariants) {
      // Jika ada varian -> Buka Bottom Sheet
      setSelectedProduct(product);
      setSelectedSize(""); 
    } else {
      // Jika tidak ada varian -> Langsung tembak ke keranjang
      executeAddToCart();
    }
  };

  // 2. EKSEKUSI FINAL MASUK KERANJANG
  const executeAddToCart = () => {
    // Jalankan animasi & update angka di Navbar
    addToCart(); 
    
    // Reset state UI
    setSelectedProduct(null);
    setSelectedSize("");
  };

  return (
    <section className="py-12 bg-white max-w-[1200px] mx-auto md:max-w-6xl relative">
      
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Top Collections</h2>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto gap-6 md:gap-8 px-4 mb-10 border-b border-gray-100 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center whitespace-nowrap min-w-max pb-3 relative group"
          >
            <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all duration-300 ${activeTab === tab ? "bg-[#ED5725]" : "bg-transparent"}`}></div>
            <span className={`text-sm md:text-base transition-all duration-300 ${activeTab === tab ? "text-[#ED5725] font-semibold" : "text-gray-500 hover:text-[#ED5725]"}`}>
              {tab}
            </span>
            <div className={`absolute bottom-0 left-0 h-[2px] bg-[#ED5725] transition-all duration-300 ${activeTab === tab ? "w-full" : "w-0"}`}></div>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4">
        
        {/* HERO IMAGE SECTION (PORTRAIT) */}
        <div key={`${activeTab}-hero`} className="mb-10 animate-in fade-in slide-in-from-right-4 duration-500 flex justify-center">
          <a 
            href={activeData.collectionLink} 
            className="w-full max-w-2xl aspect-[3/4] md:aspect-[4/5] max-h-[70vh] rounded-2xl overflow-hidden block relative group shadow-sm"
          >
            <img src={activeData.heroImage} alt={activeTab} className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 flex items-end justify-center p-6">
                <span className="text-white font-semibold text-sm md:text-lg px-6 py-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-[#ED5725] transition-all">
                  Explore {activeTab}
                </span>
            </div>
          </a>
        </div>

        {/* PRODUCT CAROUSEL */}
        {activeData.products.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide">
            {activeData.products.map((product) => (
              <div key={product.id} className="min-w-[150px] md:min-w-[200px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative mb-3 group shadow-sm">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  
                  {/* TOMBOL PLUS (+) ADD TO CART */}
                  <button 
                    onClick={(e) => handleAddToCartClick(e, product)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-[#ED5725] text-white rounded-full flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
                  >
                    +
                  </button>
                  <a href={`/products/${product.id}`} className="absolute inset-0 z-0"></a>
                </div>

                <h3 className="text-xs md:text-sm text-gray-800 font-medium truncate w-full text-center px-1">
                  {product.name}
                </h3>
                <p className="text-[#ED5725] text-sm md:text-base font-bold text-center mt-1">
                  {product.price}
                </p>
              </div>
            ))}
            
            {/* VIEW ALL BUTTON */}
            <a href={activeData.collectionLink} className="min-w-[150px] md:min-w-[200px] aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#ED5725] hover:bg-orange-50 transition-all group shadow-sm">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#ED5725] group-hover:text-white text-gray-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <span className="text-gray-600 group-hover:text-[#ED5725] font-semibold text-sm">View All</span>
            </a>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm">No products in {activeTab}.</p>
          </div>
        )}
      </div>

      {/* POPUP VARIAN (BOTTOM SHEET) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-[998] backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
      )}

      <div className={`fixed bottom-0 left-0 right-0 bg-white z-[999] rounded-t-3xl p-6 shadow-2xl transition-transform duration-300 ease-out max-w-md mx-auto ${selectedProduct ? "translate-y-0" : "translate-y-full"}`}>
        {selectedProduct && (
          <>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <img src={selectedProduct.image} alt="Thumb" className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-[#ED5725] font-semibold">{selectedProduct.price}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-3 font-medium">Select Size</p>
              <div className="flex gap-3">
                {selectedProduct.variants?.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-semibold transition-all ${
                      selectedSize === size ? "border-[#ED5725] bg-[#ED5725] text-white" : "border-gray-200 text-gray-600 hover:border-[#ED5725]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={executeAddToCart}
              disabled={!selectedSize} 
              className={`w-full py-4 rounded-full font-bold text-sm transition-all ${
                selectedSize ? "bg-[#ED5725] text-white shadow-lg" : "bg-gray-100 text-gray-400"
              }`}
            >
              ADD TO CART
            </button>
          </>
        )}
      </div>
    </section>
  );
}