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

  if (!reservation) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 }
    )
  }

  // Check if expired
  if (new Date() > reservation.expiresAt || reservation.status !== 'PENDING') {
    // If expired, release the stock
    if (reservation.status === 'PENDING') {
      await prisma.$transaction([
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
    }

    return NextResponse.json(
      { error: 'Reservation has expired' },
      { status: 410 }
    )
  }

  // Confirm reservation
  const [, updated] = await prisma.$transaction([
    prisma.stock.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId
        }
      },
      data: {
        total: { decrement: reservation.quantity },
        reserved: { decrement: reservation.quantity }
      }
    }),
    prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        product: true,
        warehouse: true
      }
    })
  ])

  return NextResponse.json(updated)
}