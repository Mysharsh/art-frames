import type { MetadataRoute } from "next"
import { products } from "@/lib/products"

const BASE_URL = (() => {
    try {
        const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").split(/[\s|]+/)[0].trim()
        return new URL(raw || "https://artframes.shop").origin
    } catch {
        return "https://artframes.shop"
    }
})()

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/waitlist`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/auth/login`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/auth/register`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ]

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }))

    return [...staticRoutes, ...productRoutes]
}
