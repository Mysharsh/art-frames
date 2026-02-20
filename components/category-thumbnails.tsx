"use client"

import Image from "next/image"
import Link from "next/link"
import { categories, getProductsByCategory, getFirstProductByCategory } from "@/lib/products"

export function CategoryThumbnails() {
    const allCategories = categories.map((cat) => {
        const firstProduct = getFirstProductByCategory(cat)
        return {
            name: cat,
            count: getProductsByCategory(cat).length,
            image: firstProduct?.image || "",
        }
    })

    return (
        <section className="px-4 py-8">
            <h2 className="mb-6 font-display text-xl font-bold uppercase tracking-wider text-foreground">
                Browse By Category
            </h2>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                {allCategories.map((cat) => (
                    <Link
                        key={cat.name}
                        href={`/?category=${cat.name === "All" ? "All" : cat.name}`}
                        className="group relative flex flex-col items-center gap-2 transition-transform hover:scale-105"
                    >
                        {/* Image Circle with Overlay */}
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-card sm:h-20 sm:w-20">
                            {cat.image ? (
                                <>
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 640px) 64px, 80px"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 group-hover:to-black/60" />
                                </>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-secondary" />
                            )}
                            {/* Category label */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center">
                                <p className="text-[9px] font-bold uppercase leading-tight text-white">
                                    {cat.name}
                                </p>
                            </div>
                        </div>
                        {/* Item count */}
                        <div className="text-center">
                            <p className="text-xs font-bold text-foreground">{cat.count}</p>
                            <p className="text-[10px] text-muted-foreground">items</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
