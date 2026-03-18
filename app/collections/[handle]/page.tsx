import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { ProductGrid } from "@/components/product-grid"
import {
  categories,
  getCategoryFromHandle,
  getCategoryHandle,
  getProductsByCategory,
} from "@/lib/products"

export function generateStaticParams() {
  return categories.map((category) => ({ handle: getCategoryHandle(category) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const category = getCategoryFromHandle(handle)

  if (!category) {
    return {
      title: "Collection Not Found",
    }
  }

  return {
    title: `${category} Collection - Posterwaala`,
    description: `Browse ${category} wall art curated for bold interiors.`,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const category = getCategoryFromHandle(handle)

  if (!category) notFound()

  const products = getProductsByCategory(category)

  return (
    <AppShell>
      <ContentPageShell
        backHref="/"
        backLabel="Back to home"
        eyebrow="Collections"
        title={category === "All" ? "All Collections" : `${category} Collection`}
        description="Use these curated sets to move quickly from discovery to checkout."
      >
        <ProductGrid products={products} hideTitle />
      </ContentPageShell>
    </AppShell>
  )
}
