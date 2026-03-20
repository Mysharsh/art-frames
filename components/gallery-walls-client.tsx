"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/cart"

// Kit configurations: maps a kit to a set of representative product IDs + their default size/material
// These IDs correspond to real products in lib/products.ts
const galleryKits = [
  {
    title: "Modern Minimal Kit",
    pieces: "3-piece set",
    style: "Clean geometry, neutral textures, and high-contrast center art.",
    savings: "Save 12%",
    productItems: [
      { productId: "p20", title: "Minimalist Lines", artist: "Kai Simple", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop", price: 25, size: "M (12x16)", material: "Matte Paper" },
      { productId: "p21", title: "Geometric Pulse", artist: "Vector Prime", image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&h=600&fit=crop", price: 33, size: "M (12x16)", material: "Matte Paper" },
      { productId: "p24", title: "Fluid Motion", artist: "Aqua Arts", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop", price: 28, size: "M (12x16)", material: "Matte Paper" },
    ],
  },
  {
    title: "Bold Color Story Kit",
    pieces: "4-piece set",
    style: "Vibrant composition for living rooms and creative workspaces.",
    savings: "Save 15%",
    productItems: [
      { productId: "p22", title: "Color Explosion", artist: "Burst Studio", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=600&fit=crop", price: 30, size: "L (18x24)", material: "Glossy Paper" },
      { productId: "p17", title: "Abstract Flow", artist: "Iris Chroma", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop", price: 42, size: "L (18x24)", material: "Metal Print" },
      { productId: "p18", title: "Urban Canvas", artist: "Rex Street", image: "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=600&h=600&fit=crop", price: 35, size: "L (18x24)", material: "Glossy Paper" },
      { productId: "p26", title: "Electric Stage", artist: "Amp Visuals", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop", price: 31, size: "L (18x24)", material: "Metal Print" },
    ],
  },
  {
    title: "Cinematic Mood Kit",
    pieces: "5-piece set",
    style: "Dark palette and layered depth for statement walls.",
    savings: "Save 18%",
    productItems: [
      { productId: "p13", title: "Cinema Noir", artist: "Frank Ricci", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=600&fit=crop", price: 34, size: "XL (24x36)", material: "Metal Print" },
      { productId: "p14", title: "Sci-Fi Odyssey", artist: "Nova Kim", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=600&fit=crop", price: 38, size: "XL (24x36)", material: "Metal Print" },
      { productId: "p23", title: "Dark Matter", artist: "Void Collective", image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=600&fit=crop", price: 39, size: "XL (24x36)", material: "Metal Print" },
      { productId: "p25", title: "Jazz Session", artist: "Miles Blue", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop", price: 34, size: "L (18x24)", material: "Matte Paper" },
      { productId: "p31", title: "Galactic Empire", artist: "Nova Kim", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=600&fit=crop", price: 36, size: "XL (24x36)", material: "Metal Print" },
    ],
  },
  {
    title: "Anime Collector Kit",
    pieces: "4-piece set",
    style: "Character-led curation with dynamic movement and glow accents.",
    savings: "Save 14%",
    productItems: [
      { productId: "p1", title: "Neon Samurai", artist: "Yuki Tanaka", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop", price: 29, size: "L (18x24)", material: "Metal Print" },
      { productId: "p2", title: "Cyber Dragon", artist: "Hiro Matsuda", image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=600&h=600&fit=crop", price: 34, size: "L (18x24)", material: "Metal Print" },
      { productId: "p3", title: "Spirit Garden", artist: "Sakura Ito", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop", price: 27, size: "L (18x24)", material: "Glossy Paper" },
      { productId: "p29", title: "Mech Warrior", artist: "Hiro Matsuda", image: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&h=600&fit=crop", price: 36, size: "L (18x24)", material: "Metal Print" },
    ],
  },
  {
    title: "Nature Calm Kit",
    pieces: "3-piece set",
    style: "Earth tones and soft gradients built for bedrooms and lounges.",
    savings: "Save 10%",
    productItems: [
      { productId: "p9", title: "Mountain Serenity", artist: "Elara Voss", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop", price: 33, size: "L (18x24)", material: "Metal Print" },
      { productId: "p11", title: "Aurora Dreams", artist: "Nina Frost", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=600&fit=crop", price: 36, size: "L (18x24)", material: "Metal Print" },
      { productId: "p12", title: "Rainforest Canopy", artist: "Diego Silva", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=600&fit=crop", price: 29, size: "L (18x24)", material: "Glossy Paper" },
    ],
  },
]

type KitItem = {
  productId: string
  title: string
  artist: string
  image: string
  price: number
  size: string
  material: string
}

function KitCard({ kit }: { kit: typeof galleryKits[0] }) {
  const { addToCart } = useAppStore()
  const { toast } = useToast()
  const router = useRouter()

  const totalPrice = kit.productItems.reduce((sum, item) => sum + item.price, 0)

  function handleAddKit() {
    kit.productItems.forEach((item: KitItem) => {
      addToCart({
        productId: item.productId,
        title: item.title,
        artist: item.artist,
        image: item.image,
        price: item.price,
        size: item.size,
        material: item.material,
      })
    })
    toast({
      title: `${kit.title} added!`,
      description: `${kit.productItems.length} prints added to your cart.`,
    })
    router.push("/cart")
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
        {kit.pieces}
      </p>
      <h2 className="mt-2 font-display text-2xl text-foreground">{kit.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{kit.style}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {kit.savings}
          </span>
          <span className="text-xs text-muted-foreground">
            ${totalPrice} total
          </span>
        </div>
        <button
          onClick={handleAddKit}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          Add Kit →
        </button>
      </div>
    </article>
  )
}

export default function GalleryWallsClient() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {galleryKits.map((kit) => (
        <KitCard key={kit.title} kit={kit} />
      ))}
    </div>
  )
}
