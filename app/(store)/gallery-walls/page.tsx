import type { Metadata } from "next"
import { ContentPageShell } from "@/components/page-shells"
import GalleryWallsClient from "@/components/gallery-walls-client"

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
      <GalleryWallsClient />
    </ContentPageShell>
  )
}
