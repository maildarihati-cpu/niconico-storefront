'use client'

import posthog from 'posthog-js'
import { PostHogProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// 1. Inisialisasi PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true, 
    capture_pageview: false, // 🌟 Sengaja dimatikan karena kita pakai radar Next.js di bawah
    person_profiles: 'identified_only',
  })
}

// 2. RADAR RUTE KHUSUS NEXT.JS (Untuk melacak kustomer pindah halaman)
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    // Setiap kali URL berubah, kirim laporan ke PostHog
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', { '$current_url': url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

// 3. Provider Utama
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      {/* Suspense wajib dipakai kalau kita menggunakan useSearchParams di Next.js 14 */}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}