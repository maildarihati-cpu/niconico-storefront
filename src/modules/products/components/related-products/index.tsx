import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
// 🌟 Import file Client Component yang baru saja kita buat
import RelatedProductsClient from "./related-products-client" 

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  // 🌟 PERBAIKAN: Tarik sampai 15 produk sekaligus sebagai cadangan agar tombol "View More" bisa bekerja
  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products
      .filter((responseProduct) => responseProduct.id !== product.id)
      .slice(0, 15) 
  })

  if (!products.length) {
    return null
  }

  // 🌟 Oper datanya ke komponen yang ada interaksinya
  return <RelatedProductsClient products={products} countryCode={countryCode} />
}