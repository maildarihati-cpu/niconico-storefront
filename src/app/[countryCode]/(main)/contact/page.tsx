"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function ContactUsPage() {
  return (
    <main className="w-full min-h-screen bg-white text-[#111111]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center bg-black pb-12 md:pb-16">
        <div className="absolute inset-0 w-full h-full opacity-70">
          <Image
            src="/contact-hero.webp" 
            alt="Contact Us Niconico Resort"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 w-full">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.1em] text-white uppercase leading-tight drop-shadow-lg">
            CONTACT US
          </h1>
        </div>
      </section>

      {/* ================= FORM SECTION (OTOMATIS KIRIM KE EMAIL) ================= */}
      <section className="w-full max-w-lg mx-auto px-6 py-10 md:py-16">
        
        {/* 🌟 ACTION DIARAHKAN KE FORMSUBMIT DENGAN EMAIL BOS */}
        <form 
          action="https://formsubmit.co/niconicogd@gmail.com" 
          method="POST" 
          className="flex flex-col gap-4 mb-12"
        >
          {/* Setting tambahan FormSubmit (Opsional tapi bikin rapi) */}
          <input type="hidden" name="_subject" value="New Message from Niconico Website!" />
          <input type="hidden" name="_captcha" value="false" />
          
          <input 
            type="text" 
            name="Name" // Wajib ada name biar datanya kebaca di email
            placeholder="Name" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all"
          />
          
          <input 
            type="email" 
            name="Email" 
            placeholder="E-Mail" 
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all"
          />
          
          <input 
            type="tel" 
            name="Phone" 
            placeholder="Phone" 
            className="w-full border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all"
          />
          
          <textarea 
            name="Message" 
            placeholder="Message" 
            rows={5}
            required
            className="w-full border border-gray-600 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#EF7044] focus:ring-1 focus:ring-[#EF7044] transition-all resize-none"
          ></textarea>

          <button 
            type="submit"
            className="w-full bg-[#EF7044] text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-[#d65f36] active:scale-[0.98] transition-all mt-2"
          >
            Send Message
          </button>
        </form>

        {/* ================= SOCIAL MEDIA ================= */}
        <div className="flex flex-col items-center justify-center gap-4 border-t border-gray-200 pt-8">
          <h3 className="text-[#EF7044] font-bold text-sm md:text-base">
            Follow Us On Social Media
          </h3>
          
          <div className="flex items-center gap-6 mt-2">
            {/* Facebook */}
            <Link href="#" className="hover:scale-110 transition-transform">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#EF7044" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12.061C22 6.504 17.523 2 12 2C6.477 2 2 6.504 2 12.061C2 17.069 5.657 21.214 10.438 21.96V14.96H7.898V12.061H10.438V9.845C10.438 7.343 11.928 5.961 14.184 5.961C15.278 5.961 16.425 6.156 16.425 6.156V8.62H15.163C13.92 8.62 13.562 9.392 13.562 10.183V12.061H16.313L15.873 14.96H13.563V21.96C18.343 21.214 22 17.069 22 12.061Z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link href="#" className="hover:scale-110 transition-transform">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#EF7044" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>

            {/* TikTok */}
            <Link href="#" className="hover:scale-110 transition-transform">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#EF7044" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.53 2.01C12.54 2.01 12.54 2.02 12.55 2.02V8.34C13.9 8.1 15.3 8.35 16.49 9.07C17.65 9.77 18.52 10.84 18.96 12.13H15.48C15.22 11.38 14.67 10.76 13.98 10.38C13.56 10.15 13.08 10.02 12.58 10.02V15.53C12.58 17.75 10.78 19.55 8.56 19.55C6.34 19.55 4.54 17.75 4.54 15.53C4.54 13.31 6.34 11.51 8.56 11.51C8.82 11.51 9.07 11.53 9.32 11.58V14.88C9.07 14.82 8.82 14.79 8.56 14.79C8.16 14.79 7.78 14.95 7.5 15.23C7.22 15.51 7.06 15.89 7.06 16.29C7.06 16.69 7.22 17.07 7.5 17.35C7.78 17.63 8.16 17.79 8.56 17.79C9.37 17.79 10.03 17.13 10.03 16.32V2.01H12.53ZM12.53 2.01H12.55V2.01H12.53ZM19.49 5.01H19.5V5.01H19.49Z" />
              </svg>
            </Link>

            {/* YouTube */}
            <Link href="#" className="hover:scale-110 transition-transform">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#EF7044" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.543 6.498C21.543 6.498 21.33 5.006 20.672 4.341C19.837 3.468 18.9 3.46 18.473 3.409C14.168 3.097 12 3.097 12 3.097C12 3.097 9.832 3.097 5.527 3.409C5.1 3.46 4.163 3.468 3.328 4.341C2.67 5.006 2.457 6.498 2.457 6.498C2.457 6.498 2.242 8.272 2.242 10.046V11.936C2.242 13.711 2.457 15.485 2.457 15.485C2.457 15.485 2.67 16.977 3.328 17.642C4.163 18.515 5.253 18.486 5.743 18.578C8.115 18.805 12 18.887 12 18.887C12 18.887 14.17 18.877 18.475 18.565C18.902 18.514 19.839 18.506 20.674 17.633C21.332 16.968 21.545 15.476 21.545 15.476C21.545 15.476 21.76 13.702 21.76 11.927V10.037C21.758 8.263 21.543 6.498 21.543 6.498ZM9.957 13.974V8.471L15.335 11.233L9.957 13.974Z" />
              </svg>
            </Link>
          </div>
          
        </div>
      </section>

    </main>
  );
}