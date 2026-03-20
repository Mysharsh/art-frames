import { notFound } from "next/navigation"
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
    title: `${product.title} by ${product.artist} - Posterwaala`,
    description: product.description,
  }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
