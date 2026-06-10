"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";

// ==========================================
// 🌟 DATA PRIVACY POLICY (UPDATE TERBARU)
// ==========================================
const privacyPolicyData = [
  {
    category: "Privacy Policy & Consent",
    items: [
      {
        question: "Introduction",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              This privacy policy (this “Privacy Policy“) sets out the privacy policies and practices for niconico swimwear Holdings, LLC and its subsidiaries and affiliates (collectively “niconico swimwear“) with respect to how niconico swimwear collects your personal information. It also describes how niconico swimwear maintains, uses, and discloses personal information. This Privacy Policy applies to information collected from you by niconico swimwear or our affiliates via this website and websites operated or provided by niconico swimwear or our affiliates, including www.niconicoswimwear.com and various subdomains, as well as various third-party websites operated or controlled by niconico swimwear, our festivals and other events (the “Events”); and other places where we may collect personal information. This Privacy Policy also sets out how you can access certain information that niconico swimwear may collect about you. In this Privacy Policy, “personal information” means information or opinion about an individual whose identity is apparent or can be reasonably ascertained from the information or opinion as further defined under applicable privacy laws.
            </p>
            <p>
              Please note that the Sites may contain links to other third party websites that are not controlled or operated by niconico swimwear. This Privacy Policy does not apply to such third party websites, and niconico swimwear is not responsible for the content of such third party websites or the privacy practices of such third parties. Therefore niconico swimwear encourages you to request and review the privacy policies of any third parties upon disclosing your personal information to such parties or when visiting such third party websites.
            </p>
          </div>
        ),
      },
      {
        question: "Consent",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p className="font-bold text-gray-900 uppercase">
              BY SUBMITTING PERSONAL INFORMATION TO NICONICO SWIMWEAR OR ITS SERVICE PROVIDERS AND AGENTS, YOU AGREE THAT NICONICO SWIMWEAR MAY COLLECT YOUR PERSONAL INFORMATION AND YOU CONSENT TO THE USE, DISCLOSURE AND TRANSFER OF YOUR PERSONAL INFORMATION IN ACCORDANCE WITH THIS PRIVACY POLICY AND AS PERMITTED OR REQUIRED BY LAW.
            </p>
            <p>
              Subject to legal and contractual requirements, you may refuse or withdraw your consent to certain of the identified purposes at any time by contacting niconico swimwear at the address provided below. If you refuse or withdraw your consent, you acknowledge that niconico swimwear may not be able to provide you or continue to provide you with certain services or information that may be of value to you.
            </p>
          </div>
        ),
      },
      {
        question: "Revisions to This Privacy Policy",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            niconico swimwear reserves the right, in niconico swimwear’s discretion, to change, modify, add or remove portions of this Privacy Policy at any time and from time to time, without prior notice to you. However, niconico swimwear will treat your continued use of the Sites following such revision as your acceptance of the revised terms. All revisions will be posted to the Sites and will apply to any personal information collected on or after the date posted. niconico swimwear will obtain the necessary consents required under applicable privacy laws if it seeks to collect, use or disclose your personal information for purposes other than those to which consent has been obtained unless otherwise required or permitted by law. This Privacy Policy was last updated May 15, 2018.
          </p>
        ),
      },
    ],
  },
  {
    category: "Information Collection & Protection",
    items: [
      {
        question: "Collection of Your Information",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              niconico swimwear may collect personal information in connection with your use or purchase of niconico swimwear’s products and services, including at the Studios, Events or through your use of the Sites, which may include information provided in connection with the following activities:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Registering or filling in forms on the Sites or at our Events or Studios. This includes information you may provide when you request additional information about niconico swimwear’s products and services or sign up to receive niconico swimwear’s email newsletters or coupons.</li>
              <li>Your usage of the Sites and your IP address, for the purpose of informing user experience and providing personalised ads.</li>
              <li>Completing your user profile on the Sites.</li>
              <li>Purchasing any product or service from niconico swimwear through the Sites.</li>
              <li>Requesting information or assistance from niconico swimwear. niconico swimwear may keep a copy of any communications or correspondence you may send to it, including any email communications.</li>
              <li>Participating or responding to consumer survey or requests for consumer’s opinions, concerns, and preferences regarding niconico swimwear’s products and services.</li>
              <li>Participating in consumer contests, sweepstakes and other promotions.</li>
              <li>Using other features of the Sites that may be offered from time to time, and may require such information in order to utilize the feature (including but not limited to making a Submission as defined in the Terms of Use).</li>
            </ul>
            <p>
              The personal information that niconico swimwear may collect may include your name, username, password, email address, age, date of birth, gender, address, telephone number, credit card and debit card numbers (with expiration dates), personal preferences, and any other personal information that you choose to include in your profile, your submissions of your goals to niconico swimwear, or in other communications to niconico swimwear. You represent and warrant that you have the right and authority or have obtained all necessary consents to provide any information, including any personal information of another individual that is provided by you to niconico swimwear.
            </p>
            <p>
              niconico swimwear may also collect information that may not be personal information, which may include, but is not limited to, your IP address, the frequency of user visits to the Sites, the routes by which users access the Sites and use of any hyperlinks available on the Sites. niconico swimwear or its service providers and agents may process and use this aggregate data for various purposes including, but not limited to, analysis of this data for trends and statistics, development of the Sites and the Sites’ features and offerings, assessing patterns of use, or planning and evaluating marketing initiatives. This information is gathered by certain tools and methods such as the collection of your IP address or the use of cookies and is maintained, used and disclosed in aggregate form unless otherwise noted.
            </p>
          </div>
        ),
      },
      {
        question: "Cookies & IP Addresses",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">Cookies</p>
              <p>
                Like many websites, niconico swimwear utilizes “cookies” to maintain a record of your visit to the Sites. A cookie is a small text file that is transferred by a web server and stored on the hard drive of your computer. It can only be read by the server that sent it to you. This information does not identify you personally and you remain anonymous unless you have otherwise provided niconico swimwear with personal information. Cookies help niconico swimwear to improve the Sites and to deliver more personalized service by enabling niconico swimwear to estimate audience size and usage patterns; to store information about your preferences; to speed up your searches and to recognize you when you return to the Sites. Most web browsers automatically accept cookies. If you would prefer to prevent your computer from accepting niconico swimwear’s cookies, you may follow your Internet browser’s steps for doing so. Please note, however, that if you do disable cookies from your browser, you may not be able to access certain sections of the Sites.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">IP Addresses</p>
              <p>
                An IP address is a computer’s numeric address within a network. niconico swimwear may record your IP address when you visit or use services or features on the Sites. niconico swimwear may use your IP address for the purposes noted above, and also to help diagnose problems with niconico swimwear’s server, or to administer the Sites. niconico swimwear may also use your IP address to identify you when niconico swimwear feels it is necessary to enforce compliance with this Privacy Policy or the Terms of Use, or to protect the Sites, systems, information, employees, service providers, business partners, users, customers and others.
              </p>
            </div>
          </div>
        ),
      },
      {
        question: "Protection of Your Information",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              To prevent unauthorized access or disclosure, maintain data accuracy and facilitate the appropriate use of information, niconico swimwear uses physical, technological and administrative procedures to protect the personal information that niconico swimwear collects from loss, unauthorized access, modification, disclosure or other misuse.
            </p>
            <p>
              Nevertheless, Internet transmissions are never completely private or secure. You understand that any messages or information you send to the Sites may be read or intercepted by others. If you have any questions about the security of personal information collected by niconico swimwear, please contact <a href="mailto:shop@niconicoswimwear.com" className="text-blue-600 hover:text-[#EF7044] underline">shop@niconicoswimwear.com</a>.
            </p>
            <p>
              Many sections of the Sites are not confidential and are available for public viewing. Any submissions that you may post to any publicly available blogs or other publicly available features of the Sites are not confidential and may be viewed by other users of the Sites. By making personal information publicly available where the Sites allow you to do so, you consent to such publication by niconico swimwear or its service providers and agents. Please refer to the Terms of Use for additional provisions relating to user submissions that may apply to you.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    category: "Use & Disclosure",
    items: [
      {
        question: "Use of Your Personal Information",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              Upon niconico swimwear’s collection of your personal information, niconico swimwear may use such personal information internally, separately or in combination with pre-existing information, for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To develop, enhance, market, sell or otherwise provide information, products or services;</li>
              <li>To establish and conduct commercial relationships, including to process purchases or other transactions and to conduct or administer other transactions that you may engage in with niconico swimwear including at the Studios, on or through the Sites or through the Events;</li>
              <li>To conduct or administer contests, sweepstakes or other promotions in which you have participated;</li>
              <li>To contact you and to respond to any communications that you may have had with us;</li>
              <li>To troubleshoot problems with the Sites;</li>
              <li>To customize your experience or homepage on the Sites;</li>
              <li>To develop and manage niconico swimwear’s business and operations;</li>
              <li>To enforce niconico swimwear’s Terms of Use or comply with this Privacy Policy;</li>
              <li>To detect and protect niconico swimwear and other third parties against error, negligence, breach of contract, fraud, theft and other illegal activity, and to audit compliance with niconico swimwear’s policies and contractual obligations;</li>
              <li>To engage in business transactions, including the purchase, sale, lease, merger, amalgamation or any other type of acquisition, disposal, securitization or financing involving niconico swimwear;</li>
              <li>As permitted by, and to comply with, any legal or regulatory requirements or provisions; or</li>
              <li>To access, preserve, disclose and use your personal information contained in your account, all Submissions (as defined in the Terms of Use), all communications to and from you, all information relating to your use of the Sites, if niconico swimwear is required to do so by law or legal process or if niconico swimwear determines, in its sole discretion, that such action is necessary to protect the rights of niconico swimwear, third parties, and other users of the Sites or for purposes of responding to your request for customer service.</li>
              <li>For any other purpose to which you consent.</li>
            </ul>
            <p>
              Personal information collected by niconico swimwear may be transferred to, stored and processed in the United States. While in another jurisdiction for processing, the information may be accessed by the courts, law enforcement, and national security authorities of that jurisdiction.
            </p>
          </div>
        ),
      },
      {
        question: "Disclosure of Your Information",
        answer: (
          <p className="text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            niconico swimwear may disclose your personal information to its subsidiaries or affiliates and to third parties whom niconico swimwear hires to provide services on niconico swimwear’s behalf, including, but not limited to, support services, website services, delivering promotional materials, contests, sweepstakes and other promotions, and answering customer questions about niconico swimwear’s products and services. These subsidiaries, affiliates and third parties may be located overseas. niconico swimwear will only provide those third parties with the personal information that they need to deliver the services to niconico swimwear and/or on niconico swimwear’s behalf. In the event that niconico swimwear is involved in a business transaction, including the purchase, sale, lease, merger, amalgamation or any other type of acquisition, disposal, securitization or financing involving niconico swimwear, you consent to your personal information and any other information niconico swimwear may have collected being transferred to another party in connection with such transaction. You also consent to niconico swimwear disclosing your personal information to legal, financial, insurance, or other advisors in connection with such business transaction or management of all or part of niconico swimwear’s business or operations; as consented to by you from time to time, including to fulfill any other purposes that are identified when the personal information is collected; or as otherwise permitted or required by law.
          </p>
        ),
      },
    ],
  },
  {
    category: "Preferences & Contact",
    items: [
      {
        question: "Retention & Children's Privacy",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">Retention of Your Personal information</p>
              <p>
                The personal information that you provide will be retained by niconico swimwear in accordance with applicable laws. However, niconico swimwear will destroy or permanently de-identify personal information it holds if requested by you.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Children’s Privacy</p>
              <p>
                niconico swimwear recognizes the privacy interests of children and niconico swimwear encourages parents and guardians to take an active role in their children’s online activities and interests. The Sites are not intended for children under the age of 18. niconico swimwear does not target its services or the Sites to children under 18. niconico swimwear does not knowingly collect personal information from children under the age of 18.
              </p>
            </div>
          </div>
        ),
      },
      {
        question: "Choice and Opt-Out Preferences",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <p>
              niconico swimwear collects the following information via first party cookies: IP address and website usage; in the case of one-on-one marketing promotion: your first name, last name, email address, city, country and postal code, obtained at your provision through newsletter subscription opt-in. If at any time you prefer not to receive further email communications from niconico swimwear (except with respect to transactional communications regarding information, products or services specifically purchased or requested by you), you will have the ability to unsubscribe from such communications by means of a link provided in every broadcast e-mail that is sent to you by niconico swimwear. 
            </p>
            <p>
              To opt out of receiving behavior-based advertising, please visit Google’s Ads Settings, the DoubleClick opt-out page, Facebook’s Ad Settings manager, and LinkedIn’s Cookie Settings. To opt out of personalized content, please visit MailChimp’s Website Cookies Preferences tool on their Cookies Statement page and Google’s User Privacy Hub.
            </p>
            <p>
              We and our third party partners may use other technologies from time to time, like web beacons, pixels (or “clear gifs”) and other tracking technologies. While you may not have the ability to specifically reject or disable these tracking technologies, in most instances, these technologies are reliant on cookies to function properly; accordingly, in those instances, declining cookies will impair functioning of these technologies.
            </p>
          </div>
        ),
      },
      {
        question: "Access, Correction & Contact Us",
        answer: (
          <div className="space-y-4 text-gray-600 leading-relaxed text-[13px] md:text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">Access and Correction</p>
              <p>
                niconico swimwear will take reasonable steps to ensure the personal information it holds is accurate, complete and up to date. Upon your written request, subject to certain exceptions, niconico swimwear will inform you of the existence, use and disclosure of your personal information and provide you with a copy of that information. Additionally, if you have any questions or enquiries relating to our privacy practices or procedures, or if you believe that the personal information that niconico swimwear holds about you is not accurate, complete or up to date, you may write to us at the address provided below. If you are able to establish that the information is not accurate, complete or up to date, niconico swimwear will take reasonable steps to correct the information so that it is accurate, complete and up to date.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Request for Access and Correction, Questions or Comments</p>
              <p>
                niconico swimwear welcomes questions and comments about this Privacy Policy. Requests for access and correction of your personal information, and questions or comments should be directed to the niconico swimwear at:
              </p>
              <p className="mt-2 font-medium text-gray-800">
                niconico swimwear<br />
                Attention: Privacy Officer<br />
                Jl. Kayu Aya NO. 5B B LINGK.BASANGKASA NO. RT. RW.<br />
                KEL. SEMINYAK KEC. KUTA<br />
                BADUNG, Bali 80361<br />
                INDONESIA
              </p>
            </div>
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
// 🌟 HALAMAN UTAMA PRIVACY POLICY
// ==========================================
export default function PrivacyPolicyPage() {
  const router = useRouter();
  
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
      
      {/* 🌟 HEADER LOKAL */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-[18px] font-bold tracking-wide leading-tight">Privacy Policy</h1>
        </div>
      </div>

      {/* 🌟 KONTEN ACCORDION */}
      <div className="max-w-[800px] mx-auto px-6 pt-10">
        
        {privacyPolicyData.map((category, catIdx) => (
          <div key={category.category} className="mb-10">
            {/* Judul Kategori */}
            <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 tracking-wide">
              {category.category}
            </h2>
            
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