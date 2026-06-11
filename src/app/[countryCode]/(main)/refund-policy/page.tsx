"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";

// ==========================================
// 🌟 DATA REFUND POLICY (TEKS TERBARU DARI BOS)
// ==========================================
const refundPolicyData = [
  {
    category: "Returns & Refund Policy",
    items: [
      {
        question: "General Return Conditions",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              At niconico resort we are dedicated to customer service and satisfaction. If you are not happy with your purchase, you can return it within 14 days for an exchange assuming the item is unused and in perfect condition as received, and is returned in its original packaging. Please note that we’re unable to process a refund for any online or instore purchases.
            </p>
            <p>
              We want you to be completely satisfied with your online purchase, therefore if you change your mind for any reason, we’ll gladly accept a return of any full priced item subject to the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The item must be returned within 14 days of purchase;</li>
              <li>Items must be returned in original condition, unworn, unaltered, unwashed and with their tags attached;</li>
              <li>Must not be marked as a Last Chance/Sale item on our website or instore. Sale items can only be returned incases where the product is faulty or the incorrect item is received.</li>
              <li>Must not have any dirty marks, make-up or face tan marks</li>
              <li>Must not smell of perfume, deodorant, cosmetics or washing powder</li>
              <li>Swimwear can be returned if it is unworn, and in its original condition with all tags and protection stickers attached.</li>
              <li>Underwear must be worn when trying on swimwear for hygiene reasons.</li>
              <li>Please note that all swimwear that is sold in a set must be returned in a set.</li>
            </ul>
            <p>
              When trying on footwear we advise using a clean surface as shoes with marked or dirty soles may not be accepted for return.
            </p>
            <p className="italic">
              Note: Online purchases cannot be returned to a store or dropped off in person to any office or warehouse. Online purchases may only be retuned by sending them to the Returns Address as per this process. If you have any questions, please contact the customer service team for assistance at <a href="mailto:shop@niconicoswimwear.com" className="font-medium text-gray-900 hover:text-[#EF7044] underline">shop@niconicoswimwear.com</a>.
            </p>
          </div>
        ),
      },
      {
        question: "Sale & Last Chance Items",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            All Sale & Last Chance Items are final sale and cannot be used in conjunction with any other promotions. Returns and refunds for change of mind are not available on sale and last chance items. Sale and last chance items can only be refunded in cases where the product is faulty or the incorrect item is received.
          </p>
        ),
      },
      {
        question: "Refunds",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, your replacement or refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of 14 days.
          </p>
        ),
      },
      {
        question: "Late or Missing Refunds",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            If you haven’t received a refund yet, you may check your bank account again or contact your bank company. It may take some time before your refund is officially posted. There is often some processing time before a refund is posted. If you have done all of this and you still have not received your refund yet, please contact us at <a href="mailto:shop@niconicoswimwear.com" className="font-medium text-gray-900 hover:text-[#EF7044] underline">shop@niconicoswimwear.com</a>
          </p>
        ),
      },
    ],
  },
  {
    category: "Shipping & Process",
    items: [
      {
        question: "Delivery",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>To Return your product, you should contact us prior to shipping the items.</p>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you received a refund, the cost of shipping will be deducted from your refund.
              <br />
              Depending on where you live, the time it may take for your exchanged product to reach you, may vary.
            </p>
          </div>
        ),
      },
      {
        question: "Return in a Store",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            Online purchases shipped outside of Indonesia cannot be returned or exchanged in our stores.
          </p>
        ),
      },
      {
        question: "Return an Online Purchase by Mail",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">STEP 1:</p>
              <p>Complete the Return and/or Exchange section of the form that came with your order and email it to us at <a href="mailto:shop@niconicoswimwear.com" className="font-medium text-gray-900 hover:text-[#EF7044] underline">shop@niconicoswimwear.com</a>. If you no longer have your invoice or confirmation email, click here to print a blank form. You may need to access order details within your online order history to complete this form.</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">STEP 2:</p>
              <p>Prepare your package for shipment by ensuring your merchandise & paperwork are included. You are responsible for payment of the return shipping costs.</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">STEP 3:</p>
              <p>Choose a prepaid, insured traceable delivery service and mail your package to:</p>
              <p className="mt-2 font-medium text-gray-800">
                niconico swimwear<br />
                ATT: Returns Processing<br />
                Jl. Gunung Salak Utara, Gang Shangrila No. 1B<br />
                Kerobokan – 80361<br />
                Bali – Indonesia
              </p>
            </div>
          </div>
        ),
      },
      {
        question: "Additional Return Policy Guidelines",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Original shipping and handling fees are not refundable.</li>
              <li>Offers are subject to adjustment due to returns, cancellations, and exchanges.</li>
              <li>Please allow us to 14 days to process your request from the time we receive it.</li>
            </ul>
            <div>
              <p className="font-bold text-gray-900 mb-1 mt-4">STORE PURCHASES:</p>
              <p>Items purchased at niconico resort store must be returned or exchanged in a store located of purchase. Be sure to bring your original receipt to a store located of purchase.</p>
            </div>
            <p>
              Exchanges will only be issued on sale items if the product is deemed to be faulty, has a manufacturer fault or has arrived broken or damaged.<br />
              We check all the items as they leave niconico resort to ensure that only the highest level of quality is sent to our customers but unfortunately some things still manage to slip past us.
            </p>
            <p>
              For security and peace of mind, we strongly suggest using insured registered post as we are not liable for lost return parcels. Please allow up to 7 business days for us to receive your return.
            </p>
            <p>
              We do not currently offer a free returns service. We recommend insured registered post as we are not liable for lost return parcels. If any of the items in your order were faulty, damaged or incorrect, please contact our customer service team for assistance at <a href="mailto:shop@niconicoswimwear.com" className="font-medium text-gray-900 hover:text-[#EF7044] underline">shop@niconicoswimwear.com</a>.
            </p>
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
// 🌟 HALAMAN UTAMA REFUND POLICY
// ==========================================
export default function RefundPolicyPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => 
      prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id] 
    );
  };

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
    <div 
      className="min-h-screen bg-white text-gray-900 pb-20 relative" 
      style={{ fontFamily: "'Avenir Book', Avenir, 'Century Gothic', sans-serif" }}
    >
      
      {/* 🌟 CONTAINER KONTEN (PT-28 memberikan ruang agar tidak tertutup Navbar Global) */}
      <div className="max-w-[800px] mx-auto px-6 pt-28">
        
        {/* 🌟 JUDUL REFUND POLICY DI BAWAH NAVBAR */}
        <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-10 tracking-wide">
          Refund Policy
        </h1>
        
        {refundPolicyData.map((category, catIdx) => (
          <div key={category.category} className="mb-10">
            <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 tracking-wide">
              {category.category}
            </h2>
            
            <div className="border-t border-gray-200">
              {refundPolicyData[catIdx].items.map((item, itemIdx) => {
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

      {/* 🌟 TOMBOL BACK TO TOP */}
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