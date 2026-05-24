import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id }
  })

  if (!reservation || reservation.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Reservation not found or not pending' },
      { status: 404 }
    )
  }

  const [, updated] = await prisma.$transaction([
    prisma.stock.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId
        }
      },
      data: {
        reserved: { decrement: reservation.quantity }
      }
    }),
    prisma.reservation.update({
      where: { id },
      data: { status: 'RELEASED' }
    })
  ])

  return NextResponse.json(updated)
}