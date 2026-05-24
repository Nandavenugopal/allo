import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createReservation } from '@/lib/reservations'

const ReserveSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ReserveSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { productId, warehouseId, quantity } = parsed.data
  const result = await createReservation(productId, warehouseId, quantity)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Not enough stock available' },
      { status: 409 }
    )
  }

  return NextResponse.json(result.reservation, { status: 201 })
}