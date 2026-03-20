import { NextResponse } from "next/server"
import type { Product } from "@/lib/products"
import { products } from "@/lib/products"

function parseLimit(value: string | null): number {
    if (!value) return 0
    const parsed = Number(value)

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0
    }

    return Math.floor(parsed)
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const onSale = searchParams.get("onSale")
    const limit = parseLimit(searchParams.get("limit"))

    let result: Product[] = [...products]

    if (category && category.toLowerCase() !== "all") {
        result = result.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (featured === "true") {
        result = result.filter((product) => product.featured)
    }

    if (onSale === "true") {
        result = result.filter((product) => product.onSale)
    }

    if (limit > 0) {
        result = result.slice(0, limit)
    }

    return NextResponse.json({ products: result })
}
