"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, ShoppingBag } from "lucide-react"
import type { Product } from "@/lib/products"
import { getRelatedProducts } from "@/lib/products"
import { useAppStore } from "@/lib/store"
import { ProductCard } from "@/components/product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [selectedMaterial, setSelectedMaterial] = useState(
    product.materials.find((material) =>
      material.toLowerCase().includes("metal")
    ) ?? product.materials[0]
  )
  const openWaitlistModal = useAppStore((s) => s.openWaitlistModal)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image]

  const related = getRelatedProducts(product)

  useEffect(() => {
    if (!carouselApi) return

    const updateSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap())
    }

    updateSlide()
    carouselApi.on("select", updateSlide)
    carouselApi.on("reInit", updateSlide)

    return () => {
      carouselApi.off("select", updateSlide)
      carouselApi.off("reInit", updateSlide)
    }
  }, [carouselApi])

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-0">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
            aria-label="Bag"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
        {/* Gallery */}
        <div className="px-4 lg:px-0">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
              <CarouselContent className="-ml-0">
                {galleryImages.map((src, index) => (
                  <CarouselItem key={`${product.id}-${index}`} className="pl-0">
                    <div className="relative aspect-[4/5] w-full sm:aspect-square">
                      <Image
                        src={src}
                        alt={`${product.title} view ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="absolute left-3 top-3 flex flex-col gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
                Metal Poster
              </span>
              <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-sm ring-1 ring-border/60">
                Gloss Finish
              </span>
            </div>

            {product.onSale && (
              <span className="absolute right-3 top-3 rounded-md bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive-foreground">
                Sale
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={`${product.id}-dot-${index}`}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    activeSlide === index
                      ? "bg-foreground"
                      : "bg-muted-foreground/40"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-4 pt-5 lg:px-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {product.category} Series
        </p>
        <h1 className="mt-1 font-display text-3xl leading-none text-foreground">
          {product.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">by {product.artist}</p>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-base text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
          {product.onSale && product.originalPrice && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              % OFF
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {/* Size selector */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  selectedSize === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Material selector */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Material
          </p>
          <div className="flex flex-wrap gap-2">
            {product.materials.map((material) => (
              <button
                key={material}
                onClick={() => setSelectedMaterial(material)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  selectedMaterial === material
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => openWaitlistModal(product.id, product.title)}
          className="mt-6 w-full rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Notify Me for Drop
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Limited metal poster drops. No payment required.
        </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-10 px-4 pb-6">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            You May Also Like
          </h2>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto">
            {related.map((p) => (
              <div key={p.id} className="w-40 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
