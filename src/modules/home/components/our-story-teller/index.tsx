"use client"

import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules"
import { Star } from "lucide-react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"

const StoryTeller = () => {
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/reviews`)
        const data = await res.json()
        setReviews(data.reviews || [])
      } catch (err) {
        console.error("Error fetching reviews:", err)
      }
    }
    fetchStories()
  }, [])


  if (reviews.length === 0) return null

  return (
    /* 🌟 PERUBAHAN: Menggunakan mt-12 (Margin top 48px), padding vertikal dan margin bawah dihapus total */
    <section className="mt-12 bg-white overflow-hidden">
      
      {/* JUDUL */}
      <div className="container mx-auto text-center mb-5 px-4">
        <h2 className="text-[25px] text-justify-center font-heavy text-black tracking-tight">
          Our Story Teller
        </h2>
      </div>

      <div className="w-full relative max-w-[1000px] mx-auto px-0 md:px-4">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"} 
          loop={true}
          coverflowEffect={{
            rotate: 0,
            stretch: -60, 
            depth: 150,    
            modifier: 1.2,
            slideShadows: false, 
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="story-swiper !pb-14 !overflow-visible"
        >
          {reviews.map((item) => (
            <SwiperSlide key={item.id} className="!w-[240px] md:!w-[380px] ">
              
              <div className="bg-[#F6F6F6] rounded-[24px] p-6 md:p-10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col h-full min-h-[340px] md:min-h-[380px] border border-gray-100 mx-auto">
                
                {/* RATING */}
                <div className="flex justify-center gap-1.5 mb-5 text-[#DE7959]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < item.rating ? "currentColor" : "none"} 
                      strokeWidth={1}
                    />
                  ))}
                </div>

                {/* TEXT REVIEW */}
                <p className="text-black text-[13px] md:text-[16px] leading-relaxed text-left mb-6 font-regular">
                  {item.review_text}
                </p>

                {/* PROFILE */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 shadow-sm">
                    <img 
                      src={item.image_url} 
                      alt={item.customer_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <h4 className="text-[13px] md:text-[17px] font-heavy text-black leading-tight">
                        {item.customer_name}
                    </h4>
                    <div className="mt-1">
                        <span className="text-lg md:text-xl leading-none">
                            {getFlagEmoji(item.country_code)}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        /* KARTU BELAKANG */
        .story-swiper .swiper-slide {
          transition: all 0.4s ease-in-out;
          filter: blur(4px);
          opacity: 0.5;
        }

        /* KARTU TENGAH */
        .story-swiper .swiper-slide-active {
          filter: blur(0);
          opacity: 1;
          z-index: 50 !important;
        }

        /* PAGINATION */
        .story-swiper .swiper-pagination-bullet {
          background: #D1D5DB;
          width: 8px;
          height: 8px;
          opacity: 1;
        }
        .story-swiper .swiper-pagination-bullet-active {
          background: #DE7959 !important;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  )
}

const getFlagEmoji = (code: string) => {
  if (!code) return "🏳️"
  const codePoints = code.toUpperCase().split("").map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default StoryTeller