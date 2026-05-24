import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      stock: {
        include: { warehouse: true }
      }
    }
  })

  // Add computed "available" field to each stock
  const productsWithAvailable = products.map(p => ({
    ...p,
    stock: p.stock.map(s => ({
      ...s,
      available: s.total - s.reserved
    }))
  }))

  return NextResponse.json(productsWithAvailable)
}