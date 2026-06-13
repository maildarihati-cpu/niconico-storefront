import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.niconicoresort.com"
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = []

  // Add static routes
  const staticRoutes = [
    "",
    "/store",
    "/about",
    "/contact",
    "/faq",
    "/our-store",
    "/privacy-policy",
    "/refund-policy",
    "/terms-of-service",
    "/make-your-own-brand",
    "/categories",
    "/collections",
  ]

  for (const route of staticRoutes) {
    routes.push({
      url: `${BASE_URL}/${DEFAULT_REGION}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.8,
    })
  }

  // Add products
  try {
    const { response } = await listProducts({
      countryCode: DEFAULT_REGION,
      queryParams: { limit: 100 },
    })
    
    response.products.forEach((product) => {
      routes.push({
        url: `${BASE_URL}/${DEFAULT_REGION}/products/${product.handle}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: "daily",
        priority: 0.9,
      })
    })
  } catch (error) {
    console.error("Error fetching products for sitemap:", error)
  }

  // Add collections
  try {
    const { collections } = await listCollections({ limit: "100" })
    
    collections.forEach((collection) => {
      routes.push({
        url: `${BASE_URL}/${DEFAULT_REGION}/collections/${collection.handle}`,
        lastModified: new Date(collection.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })
  } catch (error) {
    console.error("Error fetching collections for sitemap:", error)
  }

  // Add categories
  try {
    const categories = await listCategories({ limit: 100 })
    
    categories.forEach((category) => {
      routes.push({
        url: `${BASE_URL}/${DEFAULT_REGION}/categories/${category.handle}`,
        lastModified: new Date(category.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error)
  }

  return routes
}
