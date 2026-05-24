import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create warehouses
  const mumbai = await prisma.warehouse.create({
    data: { name: 'Mumbai Central', location: 'Mumbai, India' }
  })
  const delhi = await prisma.warehouse.create({
    data: { name: 'Delhi North', location: 'Delhi, India' }
  })

  // Create products
  const laptop = await prisma.product.create({
    data: {
      name: 'Pro Laptop 15"',
      description: 'High performance laptop',
      price: 89999,
    }
  })
  const phone = await prisma.product.create({
    data: {
      name: 'Smartphone X12',
      description: 'Latest flagship phone',
      price: 49999,
    }
  })
  const headphones = await prisma.product.create({
    data: {
      name: 'Wireless Headphones',
      description: 'Noise cancelling',
      price: 12999,
    }
  })

  // Create stock (product in warehouses)
  await prisma.stock.createMany({
    data: [
      { productId: laptop.id, warehouseId: mumbai.id, total: 5, reserved: 0 },
      { productId: laptop.id, warehouseId: delhi.id, total: 3, reserved: 0 },
      { productId: phone.id, warehouseId: mumbai.id, total: 10, reserved: 0 },
      { productId: phone.id, warehouseId: delhi.id, total: 1, reserved: 0 }, // Only 1 left!
      { productId: headphones.id, warehouseId: mumbai.id, total: 20, reserved: 0 },
    ]
  })

  console.log('✅ Seeded successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())