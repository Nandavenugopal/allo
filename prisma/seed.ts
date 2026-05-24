import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create warehouses
  const Hyderabad = await prisma.warehouse.create({
    data: { name: 'Hyderabad', location: 'Hyderabad India' }
  })
  const VijayawadaNorth = await prisma.warehouse.create({
    data: { name: 'Vijayawada North', location: 'Vijayawada, India' }
  })

  // Create products
  const bottle = await prisma.product.create({
    data: {
      name: 'milton waterbottle"',
      description: 'Highly durable and insulated water bottle',
      price: 999,
    }
  })
  const shoes = await prisma.product.create({
    data: {
      name: 'nike running shoes',
      description: 'Comfortable and durable running shoes',
      price: 3999,
    }
  })
  const Notebooks = await prisma.product.create({
    data: {
      name: 'spiral notebooks',
      description: 'Set of 5 spiral notebooks with 200 pages each',
      price: 999,
    }
  })
  const Honey = await prisma.product.create({
    data: {
      name: 'honey',
      description: 'Pure and natural honey sourced from locals',
      price: 699,
    }
  })
  const TrackPants = await prisma.product.create({
    data: {
      name: 'track pants',
      description: 'Comfortable and durable track pants',
      price: 1999,
    }
  })
  const IndianMasalas = await prisma.product.create({
    data: {
      name: 'indian masalas',
      description: 'A set of authentic indian spices and masalas',
      price: 399,
    }
  })

  // Create stock (product in warehouses)
  await prisma.stock.createMany({
    data: [
      { productId: bottle.id, warehouseId: Hyderabad.id, total: 5, reserved: 0 },
      { productId: bottle.id, warehouseId: VijayawadaNorth.id, total: 3, reserved: 0 },
      { productId: shoes.id, warehouseId: Hyderabad.id, total: 10, reserved: 0 },
      { productId: shoes.id, warehouseId: VijayawadaNorth.id, total: 1, reserved: 0 }, // Only 1 left!
      { productId: Notebooks.id, warehouseId: Hyderabad.id, total: 20, reserved: 0 },
      { productId: Honey.id, warehouseId: Hyderabad.id, total: 15, reserved: 0 },
      { productId: TrackPants.id, warehouseId: VijayawadaNorth.id, total: 8, reserved: 0 },
      { productId: IndianMasalas.id, warehouseId: Hyderabad.id, total: 25, reserved: 0 },
    ]
  })

  console.log('✅ Seeded successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
