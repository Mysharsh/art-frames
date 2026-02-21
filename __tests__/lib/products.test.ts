import { describe, it, expect } from "vitest"
import {
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    getSaleProducts,
    getRelatedProducts,
    getFirstProductByCategory,
} from "@/lib/products"

describe("Products Library", () => {
    describe("getProductById", () => {
        it("should return a product by ID", () => {
            const product = getProductById("p1")
            expect(product).toBeDefined()
            expect(product?.id).toBe("p1")
            expect(product?.title).toBeDefined()
        })

        it("should return undefined for non-existent product", () => {
            const product = getProductById("non-existent")
            expect(product).toBeUndefined()
        })

        it("should return the correct product details", () => {
            const product = getProductById("p1")
            expect(product?.artist).toBeDefined()
            expect(product?.price).toBeGreaterThan(0)
            expect(product?.category).toBeDefined()
            expect(product?.sizes).toBeInstanceOf(Array)
            expect(product?.materials).toBeInstanceOf(Array)
        })
    })

    describe("getProductsByCategory", () => {
        it("should return products for a valid category", () => {
            const products = getProductsByCategory("Anime")
            expect(Array.isArray(products)).toBe(true)
            expect(products.length).toBeGreaterThan(0)
            expect(products.every((p) => p.category === "Anime")).toBe(true)
        })

        it("should return all products for All category", () => {
            const allProducts = getProductsByCategory("All")
            const animeProducts = getProductsByCategory("Anime")
            expect(allProducts.length).toBeGreaterThanOrEqual(animeProducts.length)
        })

        it("should return all products when category is All", () => {
            const allProducts = getProductsByCategory("All")
            expect(allProducts.length).toBeGreaterThan(0)
        })
    })

    describe("getFeaturedProducts", () => {
        it("should return featured products", () => {
            const featured = getFeaturedProducts()
            expect(Array.isArray(featured)).toBe(true)
            expect(featured.every((p) => p.featured === true)).toBe(true)
        })

        it("should return at least one featured product", () => {
            const featured = getFeaturedProducts()
            expect(featured.length).toBeGreaterThan(0)
        })
    })

    describe("getSaleProducts", () => {
        it("should return sale products", () => {
            const onSale = getSaleProducts()
            expect(Array.isArray(onSale)).toBe(true)
            expect(onSale.every((p) => p.onSale === true)).toBe(true)
        })

        it("should have discounted prices", () => {
            const onSale = getSaleProducts()
            onSale.forEach((product) => {
                if (product.originalPrice) {
                    expect(product.price).toBeLessThan(product.originalPrice)
                }
            })
        })

        it("should return at least one sale product", () => {
            const onSale = getSaleProducts()
            expect(onSale.length).toBeGreaterThan(0)
        })
    })

    describe("getRelatedProducts", () => {
        it("should return related products from same category", () => {
            const product = getProductById("p1")
            if (product) {
                const related = getRelatedProducts(product)
                expect(Array.isArray(related)).toBe(true)
                expect(related.every((p) => p.category === product.category)).toBe(true)
                expect(related.every((p) => p.id !== product.id)).toBe(true)
            }
        })

        it("should limit results", () => {
            const product = getProductById("p1")
            if (product) {
                const related = getRelatedProducts(product, 3)
                expect(related.length).toBeLessThanOrEqual(3)
            }
        })
    })

    describe("getFirstProductByCategory", () => {
        it("should return first product for a category", () => {
            const product = getFirstProductByCategory("Anime")
            expect(product).toBeDefined()
            expect(product?.category).toBe("Anime")
        })

        it("should return first product overall for All category", () => {
            const product = getFirstProductByCategory("All")
            expect(product).toBeDefined()
            expect(product?.id).toBe("p1")
        })
    })
})
