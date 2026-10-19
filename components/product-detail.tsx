"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import type { Product } from "@/lib/products"
import { getRelatedProducts } from "@/lib/products"
import { formatPrice } from "@/lib/pricing"
import { useAppStore } from "@/lib/store"
import { ProductCard } from "@/components/product-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
  const toggleWishlist = useAppStore((s) => s.toggleWishlist)
  const isInWishlist = useAppStore((s) => s.isInWishlist)
  const addToCart = useAppStore((s) => s.addToCart)
  const { toast } = useToast()
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image]

  const related = getRelatedProducts(product)
  const inWishlist = isInWishlist(product.id)

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} by ${product.artist}`,
      url: window.location.href,
    }

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err)
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Product link copied to clipboard",
        })
      } catch (err) {
        console.error("Copy failed:", err)
        toast({
          title: "Failed to copy",
          description: "Please copy the URL manually",
          variant: "destructive",
        })
      }
    }
  }

  const handleWishlistToggle = () => {
    toggleWishlist(product)
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: inWishlist
        ? `${product.title} removed from your wishlist`
        : `${product.title} added to your wishlist`,
    })
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      image: product.image,
      artist: product.artist,
      price: product.price,
      size: selectedSize,
      material: selectedMaterial,
    })

    toast({
      title: "Added to cart",
      description: `${product.title} (${selectedSize}, ${selectedMaterial})`,
    })
  }

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
          className={buttonVariants({ variant: "secondary", size: "icon" })}
          aria-label="Back to home"
        >
          <ArrowLeft />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={handleShare} aria-label="Share">
            <Share2 />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleWishlistToggle}
            aria-label="Wishlist"
            aria-pressed={inWishlist}
          >
            <Heart className={inWishlist ? "fill-destructive text-destructive" : ""} />
          </Button>
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

            {/* Reflects the material actually selected below. */}
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-2xs font-semibold uppercase tracking-widest text-foreground shadow-sm ring-1 ring-border/60">
              {selectedMaterial}
            </span>

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
                  className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      activeSlide === index ? "bg-foreground" : "bg-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-4 pt-5 lg:px-0">
        <p className="text-xs font-semibold uppercase tracking-kicker text-muted-foreground">
          {product.category} Series
        </p>
        <h1 className="mt-1 font-display text-3xl leading-none text-foreground">
          {product.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">by {product.artist}</p>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
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
          <p id="size-label" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Size
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="size-label">
            {product.sizes.map((size) => (
              <Button
                key={size}
                variant="chip"
                size="chip"
                aria-pressed={selectedSize === size}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Material selector */}
        <div className="mt-5">
          <p id="material-label" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Material
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="material-label">
            {product.materials.map((material) => (
              <Button
                key={material}
                variant="chip"
                size="chip"
                aria-pressed={selectedMaterial === material}
                onClick={() => setSelectedMaterial(material)}
              >
                {material}
              </Button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button size="block" className="mt-6" onClick={handleAddToCart}>
          Add To Cart
        </Button>

        <Button
          variant="outline"
          size="block"
          className="mt-3 h-12 text-xs font-semibold tracking-label"
          onClick={() => openWaitlistModal(product.id, product.title)}
        >
          Notify Me For Drop
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Cash on Delivery · Pan-India delivery in 5–7 business days
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
