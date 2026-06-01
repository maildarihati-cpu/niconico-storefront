'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function ProductViewTracker({ product }: { product: any }) {
  const posthog = usePostHog()
  const hasTracked = useRef(false) // Mencegah sensor mengirim data dobel

  useEffect(() => {
    // Pastikan data produk ada dan sensor belum pernah mengirim laporan di halaman ini
    if (product && posthog && !hasTracked.current) {
      posthog.capture('view_item', {
        product_id: product.id,
        product_name: product.title,
        product_category: product.collection?.title || 'Uncategorized',
      })
      hasTracked.current = true
    }
  }, [product, posthog])

  return null // Komponen gaib, tidak menghasilkan tampilan apa-apa di layar
}