import { prisma } from './db'

const RESERVATION_MINUTES = 10

export async function createReservation(
  productId: string,
  warehouseId: string,
  quantity: number
) {
  // THE KEY RACE-CONDITION FIX:
  // We use a raw SQL UPDATE that atomically:
  // 1. Checks if (total - reserved) >= quantity
  // 2. If yes, increments reserved by quantity
  // 3. Returns the number of rows updated (0 = failed, 1 = success)
  // This happens in a SINGLE database operation — no race condition possible.

  const result = await prisma.$executeRaw`
    UPDATE "Stock"
    SET reserved = reserved + ${quantity}
    WHERE "productId" = ${productId}
      AND "warehouseId" = ${warehouseId}
      AND (total - reserved) >= ${quantity}
  `

  // If result is 0, the update didn't happen — not enough stock
  if (result === 0) {
    return { success: false, error: 'NOT_ENOUGH_STOCK' }
  }

  // Stock was reserved, now create the reservation record
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)
  
  const reservation = await prisma.reservation.create({
    data: {
      productId,
      warehouseId,
      quantity,
      status: 'PENDING',
      expiresAt,
    },
    include: {
      product: true,
      warehouse: true,
    }
  })

  return { success: true, reservation }
}