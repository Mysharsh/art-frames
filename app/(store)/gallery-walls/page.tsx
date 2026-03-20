import type { Metadata } from "next"
import Link from "next/link"
import { ContentPageShell } from "@/components/page-shells"

const galleryKits = [
  {
    title: "Modern Minimal Kit",
    pieces: "3-piece set",
    style: "Clean geometry, neutral textures, and high-contrast center art.",
    savings: "Save 12%",
  },
  {
    title: "Bold Color Story Kit",
    pieces: "4-piece set",
    style: "Vibrant composition for living rooms and creative workspaces.",
    savings: "Save 15%",
  },
  {
    title: "Cinematic Mood Kit",
    pieces: "5-piece set",
    style: "Dark palette and layered depth for statement walls.",
    savings: "Save 18%",
  },
  {
    title: "Anime Collector Kit",
    pieces: "4-piece set",
    style: "Character-led curation with dynamic movement and glow accents.",
    savings: "Save 14%",
  },
  {
    title: "Nature Calm Kit",
    pieces: "3-piece set",
    style: "Earth tones and soft gradients built for bedrooms and lounges.",
    savings: "Save 10%",
  },
]

export const metadata: Metadata = {
  title: "Gallery Walls",
  description: "Curated gallery wall kits designed to ship as coordinated sets.",
}

export default function GalleryWallsPage() {
  return (
    <ContentPageShell
      eyebrow="Curated Kits"
      title="Gallery Walls"
      description="Ready-to-style wall bundles that remove guesswork and help you launch complete looks faster."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {galleryKits.map((kit) => (
          <article key={kit.title} className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {kit.pieces}
            </p>
            <h2 className="mt-2 font-display text-2xl text-foreground">{kit.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{kit.style}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {kit.savings}
              </span>
              <Link
                href="/cart"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-primary"
              >
                Add Kit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </ContentPageShell>
  )
}
