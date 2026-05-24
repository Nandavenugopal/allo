import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id }
  })

  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  // Check if expired
  if (new Date() > reservation.expiresAt || reservation.status !== 'PENDING') {
    // If expired, release the stock
    if (reservation.status === 'PENDING') {
      await prisma.$transaction([
        prisma.stock.update({
          where: { productId_warehouseId: { 
            productId: reservation.productId, 
            warehouseId: reservation.warehouseId 
          }},
          data: { reserved: { decrement: reservation.quantity } }
        }),
        prisma.reservation.update({
          where: { id: params.id },
          data: { status: 'RELEASED' }
        })
      ])
    }
    return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 })
  }

  // Confirm: decrement total stock AND reserved (units are now "sold")
  const [, updated] = await prisma.$transaction([
    prisma.stock.update({
      where: { productId_warehouseId: { 
        productId: reservation.productId, 
        warehouseId: reservation.warehouseId 
      }},
      data: {
        total: { decrement: reservation.quantity },
        reserved: { decrement: reservation.quantity }
      }
    }),
    prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'CONFIRMED' }
    })
  ])

  return NextResponse.json(updated)
}