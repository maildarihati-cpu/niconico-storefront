import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  // 🌟 VAKSIN ANTI TIMEOUT 60 DETIK
  // Kita kembalikan array kosong agar Next.js tidak mencoba mencetak
  // ribuan halaman sekaligus saat proses Deploy (build).
  return []
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)
  
  // 🌟 PERBAIKAN 1: Tambahkan ? sebelum .length untuk mencegah error null
  if (!variant || !variant.images?.length) {
    return product.images
  }

  // 🌟 PERBAIKAN 2: Tambahkan any pada map dan ? pada filter
  const imageIdsMap = new Map(variant.images.map((i: any) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  // 🌟 VAKSIN ANTI-500 UNTUK SEO: Kita lindungi proses fetch metadata!
  try {
    const params = await props.params
    const { handle } = params
    const region = await getRegion(params.countryCode)

    if (!region) {
      return { title: "Not Found | Niconico Resort" }
    }

    const data = await listProducts({
      countryCode: params.countryCode,
      queryParams: { handle },
    })

    const product = data.response?.products?.[0]

    if (!product) {
      return { title: "Not Found | Niconico Resort" }
    }

    return {
      title: `${product.title} | Niconico Resort`,
      description: `${product.title}`,
      openGraph: {
        title: `${product.title} | Niconico Resort`,
        description: `${product.title}`,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  } catch (error) {
    console.error("💥 ERROR FETCH METADATA:", error)
    // Jika backend ngadat, jangan meledak 500! Kembalikan title darurat, 
    // lalu biarkan ProductPage di bawahnya yang mengarahkan ke halaman 404 dengan elegan.
    return {
      title: "Product | Niconico Resort",
    }
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // 🌟 PERBAIKAN 3: Timpa gambar varian langsung ke objek product
  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  if (images) {
    pricedProduct.images = images
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      // 🚫 Hapus props images={images} karena ProductTemplate tidak memintanya
    />
  )
}