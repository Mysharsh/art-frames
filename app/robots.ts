import type { MetadataRoute } from "next"

const BASE_URL = (() => {
    try {
        const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").split(/[\s|]+/)[0].trim()
        return new URL(raw || "https://artframes.shop").origin
    } catch {
        return "https://artframes.shop"
    }
})()

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/auth/", "/profile/", "/api/", "/monitoring/"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
