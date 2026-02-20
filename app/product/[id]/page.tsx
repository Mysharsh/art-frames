import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { ProductDetail } from "@/components/product-detail"
import { getProductById, products } from "@/lib/products"

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return { title: "Product Not Found" }

  return {
    title: `${product.title} by ${product.artist} - ArtFrames`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) notFound()

  return (
    <AppShell>
      <ProductDetail product={product} />
    </AppShell>
  )
}
