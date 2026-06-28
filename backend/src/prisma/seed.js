// src/prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autotrack.com' },
    update: {},
    create: { name: 'Admin AutoTrack', email: 'admin@autotrack.com', password: adminPassword, role: 'ADMIN' }
  })

  const mechPassword = await bcrypt.hash('mecanico123', 10)
  await prisma.user.upsert({
    where: { email: 'mecanico@autotrack.com' },
    update: {},
    create: { name: 'João Mecânico', email: 'mecanico@autotrack.com', password: mechPassword, role: 'MECHANIC' }
  })

  const clientPassword = await bcrypt.hash('cliente123', 10)
  const client1 = await prisma.client.upsert({
    where: { email: 'edvaldo@email.com' },
    update: {},
    create: { name: 'Edvaldo Junior', email: 'edvaldo@email.com', phone: '(98)98877-3344', cpf: '123.456.789-00', password: clientPassword }
  })

  const vehicle1 = await prisma.vehicle.upsert({
    where: { plate: 'ORK2023' },
    update: {},
    create: { plate: 'ORK2023', brand: 'Toyota', model: 'Corolla', year: 2023, color: 'Prata', mileage: 25000, clientId: client1.id }
  })

  await prisma.vehicleVisit.create({
    data: { vehicleId: vehicle1.id, mileage: 25000, reason: 'Troca de óleo e filtros', visitDate: new Date('2024-06-01') }
  })

  await prisma.serviceOrder.create({
    data: {
      orderNumber: 'OS240601001',
      status: 'COMPLETED',
      clientId: client1.id,
      vehicleId: vehicle1.id,
      userId: admin.id,
      entryDate: new Date('2024-06-01'),
      completionDate: new Date('2024-06-01'),
      totalValue: 280.00,
      observations: 'Troca de óleo realizada com sucesso',
      services: {
        create: [{ description: 'Mão de obra - Troca de óleo', unitValue: 80.00, quantity: 1, totalValue: 80.00 }]
      },
      parts: {
        create: [
          { name: 'Óleo Motor 5W30 Sintético', partNumber: 'OL5W30-1L', quantity: 4, unitValue: 35.00, totalValue: 140.00, warrantyMonths: 0 },
          { name: 'Filtro de Óleo', partNumber: 'FO-2023-COR', quantity: 1, unitValue: 60.00, totalValue: 60.00, warrantyMonths: 6, warrantyExpires: new Date('2024-12-01') }
        ]
      }
    }
  })

  await prisma.budget.create({
    data: {
      budgetNumber: 'ORC240615001',
      status: 'PENDING',
      clientId: client1.id,
      vehicleId: vehicle1.id,
      userId: admin.id,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalValue: 850.00,
      observations: 'Revisão completa dos 25.000 km',
      services: {
        create: [
          { description: 'Revisão completa', unitValue: 200.00, quantity: 1, totalValue: 200.00 },
          { description: 'Alinhamento e balanceamento', unitValue: 120.00, quantity: 1, totalValue: 120.00 }
        ]
      },
      parts: {
        create: [
          { name: 'Kit de filtros completo', quantity: 1, unitValue: 180.00, totalValue: 180.00, warrantyMonths: 12 },
          { name: 'Pastilha de freio dianteira', partNumber: 'PF-2023', quantity: 1, unitValue: 350.00, totalValue: 350.00, warrantyMonths: 24 }
        ]
      }
    }
  })

  console.log('✅ Seed completo!')
  console.log('👤 Admin: admin@autotrack.com / admin123')
  console.log('🔧 Mecânico: mecanico@autotrack.com / mecanico123')
  console.log('🚗 Cliente: edvaldo@email.com / cliente123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
