import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  // Find all expired pending reservations
  const expired = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() }
    }
  })

  // Release each one
  for (const res of expired) {
    await prisma.$transaction([
      prisma.stock.update({
        where: { productId_warehouseId: {
          productId: res.productId,
          warehouseId: res.warehouseId
        }},
        data: { reserved: { decrement: res.quantity } }
      }),
      prisma.reservation.update({
        where: { id: res.id },
        data: { status: 'RELEASED' }
      })
    ])
  }

  return NextResponse.json({ released: expired.length })
}