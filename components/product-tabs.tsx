"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGrid } from "@/components/product-grid"
import { getSaleProducts, getProductsByCategory, type Category } from "@/lib/products"

interface ProductTabsProps {
    selectedCategory: Category
}

export function ProductTabs({ selectedCategory }: ProductTabsProps) {
    const categoryProducts = getProductsByCategory(selectedCategory)

    // Sort products: "New Arrivals" by id descending (newest first), "Best Seller" by sale status
    const newArrivals = [...categoryProducts].reverse()
    const bestSellers = categoryProducts
        .filter((p) => p.onSale)
        .concat(categoryProducts.filter((p) => !p.onSale))

    const title = selectedCategory === "All" ? "All Posters" : selectedCategory

    return (
        <Tabs defaultValue="arrivals" className="w-full">
            <div className="sticky top-14 z-40 border-b border-border bg-background/95 backdrop-blur-sm py-0">
                <div className="px-4">
                    <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="arrivals"
                            className="rounded-none border-b-2 border-b-transparent px-0 py-3 font-semibold text-muted-foreground transition-colors data-[state=active]:border-b-primary data-[state=active]:text-foreground"
                        >
                            New Arrivals
                        </TabsTrigger>
                        <TabsTrigger
                            value="sellers"
                            className="rounded-none border-b-2 border-b-transparent px-3 py-3 font-semibold text-muted-foreground transition-colors data-[state=active]:border-b-primary data-[state=active]:text-foreground"
                        >
                            Best Sellers
                        </TabsTrigger>
                    </TabsList>
                </div>
            </div>

            <TabsContent value="arrivals" className="mt-0">
                <ProductGrid products={newArrivals} title="" hideTitle />
            </TabsContent>

            <TabsContent value="sellers" className="mt-0">
                <ProductGrid products={bestSellers} title="" hideTitle />
            </TabsContent>
        </Tabs>
    )
}
