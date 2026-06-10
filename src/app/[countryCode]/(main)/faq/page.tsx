"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";

// ==========================================
// 🌟 DATA FAQ (SESUAI GAMBAR REFERENSI)
// ==========================================
const faqData = [
  {
    category: "Shopping",
    items: [
      {
        question: "What Shipping Method Are Available",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">Worldwide</p>
              <p>We are pleased to offer an express international courier service using Express Mail Service Post Indonesia with an estimated 'time of arrival' within 3-7 working days to deliver to 232 countries.</p>
              <p className="mt-2">If your order is over 200US$ (or the equivalent in IDR) we ship for free.</p>
              <p className="mt-2">If your order is less than 200US$ (or the equivalent in IDR), we charge a shipping flat rate of only 25US$.</p>
              <p>100% free shipping in Indonesia.</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Indonesia</p>
              <p>Free shipping to all Domestic Addresses for order above Rp500,000.</p>
              <p>For local shipment, we can deliver your order with the local courier; (JNE, TIKI, POST, Gojek, etc).</p>
            </div>
          </div>
        ),
      },
      {
        question: "Do You Ship Internationally ?",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            We ship internationally using EMS (Express Mail Service) a subsidiary of POS Indonesia. With it's global network EMS can deliver to over 100 countries worldwide. To see who is your global network partner in your country please visit the <a href="#" className="underline font-medium hover:text-[#EF7044]">EMS website</a>. For International orders not covered by free delivery we charge a shipping flat rate of 25$. Orders above 100$ are free for delivery.
          </p>
        ),
      },
      {
        question: "How Long Will It Take To Get My Package ?",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            Delivery time is depending on your location and order day and may vary between 3-10 working days.
          </p>
        ),
      },
    ],
  },
  {
    category: "Payment",
    items: [
      {
        question: "What Payment Methods Are Accepted ?",
        answer: (
          <div className="space-y-3 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="text-gray-900 mb-0.5">International</p>
              <p>For our International customers we offer the following payment methods:</p>
              <p>Credit Card, Paypal</p>
            </div>
            <div>
              <p className="text-gray-900 mb-0.5">Indonesia</p>
              <p>For our Indonesian customers we offer the following payment methods:</p>
              <p>Credit Card, ATM/Bank Transfer, GO-PAY, Clickpay, Indomaret</p>
            </div>
          </div>
        ),
      },
      {
        question: "Is Buying On-Line Safe",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            We make great strides in making the payment process safe. Our shopping cart is SSL (Secure Sockets Layer) protected, establishing a secure encrypted link between our website and your computer. We don't store your credit card information on our server. Only the payment provider can see your sensitive data.
          </p>
        ),
      },
    ],
  },
  {
    category: "Order & Returns",
    items: [
      {
        question: "How do I Place an Order ?",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            Orders are placed by fulfilling the checkout process.
          </p>
        ),
      },
      {
        question: "Do I Need an Account to Place an Order ?",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            We also allow "guest" orders in our on line shop without the need to create an account. For your convenience and better tracking, we recommend to create an account.
          </p>
        ),
      },
      {
        question: "How Do I Track My Order ?",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            During the order process you can track your order at the <a href="#" className="underline font-medium hover:text-[#EF7044]">EMS website</a>.
          </p>
        ),
      },
      {
        question: "How Can I Return a Product ?",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>You have two ways to return a product.</p>
            <div>
              <p className="text-gray-900 mb-0.5">Online</p>
              <p>Complete the Return Form, which was sent out with your order.</p>
              <p>Include a copy of your original invoice and your completed Return Form in your parcel. Post it back to Niconico Swimwear HQ:</p>
              <p className="mt-1">
                Jl. Gunung Salak Utara<br />
                Gg. Shangrila No.1b<br />
                Denpasar 80117<br />
                Bali, Indonesia
              </p>
            </div>
            <div>
              <p className="text-gray-900 mb-0.5">Niconico Store</p>
              <p>All items purchased online can be exchanged at any of our Niconico Swimwear retail stores. Therefore head into a store with the item you like to change, the complete the Return Form and a copy of your original invoice.</p>
            </div>
            <p>For all returns, our <a href="#" className="underline font-medium hover:text-[#EF7044]">Returns and Refund Policy</a> applies.</p>
          </div>
        ),
      },
    ],
  },
];

// ==========================================
// 🌟 KOMPONEN ACCORDION ITEM
// ==========================================
function AccordionItem({ question, answer, isOpen, onClick }: { question: string, answer: React.ReactNode, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button 
        onClick={onClick}
        className="w-full flex justify-between items-center py-4 text-left transition-colors hover:text-[#EF7044]"
      >
        <span className="text-[14px] md:text-[15px] font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
        )}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] pb-5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {answer}
      </div>
    </div>
  );
}

// ==========================================
// 🌟 HALAMAN UTAMA FAQ & RETURNS
// ==========================================
export default function FAQReturnsPage() {
  const router = useRouter();
  
  // State untuk melacak accordion mana yang terbuka
  // Disimpan dalam bentuk "kategoriIndex-itemIndex"
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => 
      prev.includes(id) 
        ? prev.filter((item) => item !== id) // Tutup jika sudah terbuka
        : [...prev, id] // Buka jika tertutup (bisa buka lebih dari 1 sekaligus)
    );
  };

  // Logic memunculkan tombol "Back to Top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // 🌟 KUNCI: Memaksa penggunaan font Avenir Book sesuai request
    <div 
      className="min-h-screen bg-white text-gray-900 pb-20 relative" 
      style={{ fontFamily: "'Avenir Book', Avenir, 'Century Gothic', sans-serif" }}
    >
      
      {/* 🌟 HEADER HEADER (Mengikuti referensi desain) */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-bold tracking-wide">
          FAQ & Returns
        </h1>
      </div>

      {/* 🌟 KONTEN FAQ */}
      <div className="max-w-[800px] mx-auto px-6 pt-10">
        
        {faqData.map((category, catIdx) => (
          <div key={category.category} className="mb-10">
            {/* Judul Kategori */}
            <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 tracking-wide">
              {category.category}
            </h2>
            
            {/* List Accordion di dalam kategori */}
            <div className="border-t border-gray-200">
              {category.items.map((item, itemIdx) => {
                const uniqueId = `${catIdx}-${itemIdx}`;
                return (
                  <AccordionItem
                    key={uniqueId}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openItems.includes(uniqueId)}
                    onClick={() => toggleAccordion(uniqueId)}
                  />
                );
              })}
            </div>
          </div>
        ))}

      </div>

      {/* 🌟 TOMBOL BACK TO TOP (Sesuai ujung kanan bawah gambar referensi) */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center shadow-lg hover:bg-[#EF7044] hover:text-white transition-all z-50 animate-in fade-in slide-in-from-bottom-5"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

    </div>
  );
}