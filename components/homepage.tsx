"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryThumbnails } from "@/components/category-thumbnails"
import { ProductTabs } from "@/components/product-tabs"
import { type Category } from "@/lib/products"
import { Mail, MapPin, Calendar, Package } from "lucide-react"

export function Homepage() {
  const searchParams = useSearchParams()
  const selectedCategory = (searchParams.get("category") as Category) || "All"
  const section = searchParams.get("section")

  // Scroll to section when section param changes
  useEffect(() => {
    if (section) {
      const element = document.getElementById(section)
      if (element) {
        // Use setTimeout to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
          // Adjust for sticky header (56px = 14 * 4px)
          window.scrollBy(0, -80)
        }, 100)
      }
    }
  }, [section])

  return (
    <div className="w-full">
      <HeroBanner />
      <CategoryThumbnails />

      {/* All-Time Favorites section header */}
      <section className="px-4 py-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-4xl font-bold tracking-wide text-foreground">
            All-Time Favorites
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover the most loved metal posters in our collection
          </p>
        </div>
      </section>

      <div id="products" className="scroll-mt-32">
        <ProductTabs selectedCategory={selectedCategory} />
      </div>

      {/* Order Section */}
      <section id="order" className="border-t border-border bg-card/30 px-4 py-16 scroll-mt-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Track Your Order
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Stay updated on your metal poster delivery. Once you join the waitlist and complete your order during the drop, you&apos;ll receive tracking information via email. All orders are carefully packaged to ensure your artwork arrives in perfect condition. Expect delivery within 5-7 business days across India.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Processing</p>
              <p className="mt-1 text-sm text-muted-foreground">1-2 days</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Shipping</p>
              <p className="mt-1 text-sm text-muted-foreground">3-5 days</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Delivery</p>
              <p className="mt-1 text-sm text-muted-foreground">5-7 days total</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-4 py-16 scroll-mt-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            About METAL POSTERS
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to India&apos;s premier destination for premium metal posters. We bring together bold artistry and unmatched durability to transform your spaces with stunning visual narratives.
            </p>
            <p>
              Every piece in our collection is carefully curated from talented artists across diverse genres—from anime and gaming to nature, abstract, and music. Our metal prints feature vibrant colors, exceptional detail, and a premium finish that elevates any wall.
            </p>
            <p>
              We operate on an exclusive drop model: limited quantities, high demand, and no compromises on quality. Join our waitlist to be notified when your favorite pieces become available. Each drop sells out fast, ensuring your collection remains unique and valuable.
            </p>
            <p className="font-semibold text-foreground">
              Bold. Durable. Limited. That&apos;s our promise.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="border-t border-border bg-card/30 px-4 py-16 scroll-mt-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Upcoming Events
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Stay connected with exclusive artist collaborations, pop-up exhibitions, and limited edition launches. Our events bring the community together to celebrate art, culture, and creativity.
          </p>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">Anime Artist Showcase</p>
                  <p className="mt-1 text-sm text-muted-foreground">Featuring exclusive prints from top anime illustrators</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Coming Soon</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">Limited Drop: Music Legends Series</p>
                  <p className="mt-1 text-sm text-muted-foreground">Iconic musicians immortalized in metal</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 py-16 scroll-mt-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Get in Touch
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Have questions about our metal posters, upcoming drops, or custom orders? We&apos;d love to hear from you. Our team is here to help you find the perfect artwork for your space.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-6">
              <Mail className="h-5 w-5 text-primary mb-3" />
              <p className="font-semibold text-foreground mb-1">Email Us</p>
              <a href="mailto:hello@metalposters.in" className="text-sm text-primary hover:underline">
                hello@metalposters.in
              </a>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <MapPin className="h-5 w-5 text-primary mb-3" />
              <p className="font-semibold text-foreground mb-1">Location</p>
              <p className="text-sm text-muted-foreground">
                Mumbai, India
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Business Inquiries:</span> For partnerships, bulk orders, or gallery collaborations, reach out to us at{" "}
              <a href="mailto:business@metalposters.in" className="text-primary hover:underline">
                business@metalposters.in
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
