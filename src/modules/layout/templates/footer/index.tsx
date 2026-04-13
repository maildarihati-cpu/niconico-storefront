"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronUp } from "lucide-react"

const Footer = () => {
  const [email, setEmail] = useState("")

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return alert("Masukkan email dulu bos!")
    // Tempat narik ke database Medusa nanti
    console.log("Email siap dikirim:", email)
    alert("Berhasil subscribe!")
    setEmail("") 
  }

  return (
    <footer className="relative bg-black text-white pt-16 flex flex-col items-center">
      
      <button 
        onClick={scrollToTop}
        className="absolute -top-6 right-6 md:right-12 w-14 h-14 bg-[#E5E7EB] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20"
        aria-label="Back to top"
      >
        <ChevronUp className="text-[#DE7959] w-8 h-8" strokeWidth={2.5} />
      </button>

      <div className="container mx-auto px-6 w-full max-w-[1200px] flex flex-col items-center">
        
        {/* --- WADAH DIPERLEBAR JADI 600px BIAR 'OFF' GAK JATUH --- */}
        <div className="w-full max-w-[600px] text-center mb-16 mx-auto">
          
          <h3 className="text-[16px] md:text-lg mb-6 font-medium leading-relaxed">
            <span className="font-bold">Subscribe</span> to our newsletter and get upto <span className="font-bold whitespace-nowrap">20% off</span><br className="hidden md:block" />
            <span className="md:hidden"> </span>
            on our exclusive <span className="font-bold">products.</span>
          </h3>

          <form onSubmit={handleSubscribe} className="flex w-full bg-white rounded-full overflow-hidden p-1 shadow-sm mx-auto">
            <input
              type="email"
              placeholder="E-mail Address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-5 text-black outline-none italic placeholder:text-gray-400 text-[15px]"
              required
            />
            <button 
              type="submit" 
              className="bg-[#DE7959] text-white px-6 md:px-8 py-3 rounded-full font-bold tracking-wide text-sm hover:bg-[#c96a4c] transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>

        {/* --- SECTION MENU & LOGO --- */}
        <div className="w-full flex justify-between items-start mb-16">
          
          <div className="w-1/2 pr-4">
            {/* PASTIKAN NAMA FILE DAN EKSTENSI DI BAWAH INI SAMA PERSIS DENGAN YANG ADA DI FOLDER PUBLIC BOS */}
            <img 
              src="/logo-niconico-white.png" 
              alt="Niconico Resort" 
              className="w-[140px] md:w-[180px] object-contain"
            />
          </div>

          <div className="w-1/2 flex justify-between gap-4">
            <div className="flex flex-col gap-y-5 text-[15px] text-gray-200">
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
              <Link href="/make-your-own-brand" className="hover:text-white transition-colors">Make Your <br />Own Brand</Link>
              <Link href="/stores" className="hover:text-white transition-colors">Stores</Link>
            </div>

            <div className="flex flex-col gap-y-4 text-[15px] text-gray-200">
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link>
              <Link href="/returns" className="hover:text-white transition-colors">Returns</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Journal</Link>
            </div>
          </div>
        </div>

        {/* --- SECTION SOCIAL MEDIA --- */}
        <div className="flex items-center gap-6 mb-10 text-white">
          <Link href="https://facebook.com" target="_blank" className="hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </Link>
          <Link href="https://instagram.com" target="_blank" className="hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.975-10.457a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" clipRule="evenodd"/></svg>
          </Link>
          <Link href="https://tiktok.com" target="_blank" className="hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </Link>
          <Link href="https://youtube.com" target="_blank" className="hover:text-gray-300 transition-colors">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </Link>
        </div>
      </div>

      <div className="w-full bg-white text-black text-center py-2.5">
        <p className="text-[11px] md:text-xs tracking-wide">
          niconicoresort <span className="font-bold">@2026</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer