// src/controllers/dashboard.controller.js
const prisma = require('../prisma/client')

const getStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [openOrders, completedThisMonth, monthRevenue, pendingRevenue, recentOrders] = await Promise.all([
      prisma.serviceOrder.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.serviceOrder.count({ where: { status: 'COMPLETED', completionDate: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.serviceOrder.aggregate({ where: { status: 'COMPLETED', completionDate: { gte: startOfMonth, lte: endOfMonth } }, _sum: { totalValue: true } }),
      prisma.serviceOrder.aggregate({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }, _sum: { totalValue: true } }),
      prisma.serviceOrder.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } }, vehicle: { select: { plate: true, brand: true, model: true } }, user: { select: { name: true } } }
      })
    ])

    res.json({
      openOrders,
      completedThisMonth,
      monthRevenue: Number(monthRevenue._sum.totalValue || 0),
      pendingRevenue: Number(pendingRevenue._sum.totalValue || 0),
      recentOrders
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

module.exports = { getStats }
