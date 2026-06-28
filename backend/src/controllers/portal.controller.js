// src/controllers/portal.controller.js
const prisma = require('../prisma/client')

const getMyProfile = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.client.id },
      select: { id: true, name: true, email: true, phone: true, cpf: true, createdAt: true,
        _count: { select: { vehicles: true, serviceOrders: true } }
      }
    })
    res.json(client)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { clientId: req.client.id },
      include: { visits: { orderBy: { visitDate: 'desc' }, take: 5 }, _count: { select: { serviceOrders: true } } }
    })
    res.json(vehicles)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getMyServiceOrders = async (req, res) => {
  try {
    const orders = await prisma.serviceOrder.findMany({
      where: { clientId: req.client.id },
      include: {
        vehicle: { select: { plate: true, brand: true, model: true, year: true } },
        services: true,
        parts: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getMyBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { clientId: req.client.id },
      include: {
        vehicle: { select: { plate: true, brand: true, model: true } },
        services: true,
        parts: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(budgets)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getServiceOrderById = async (req, res) => {
  try {
    const order = await prisma.serviceOrder.findFirst({
      where: { id: Number(req.params.id), clientId: req.client.id },
      include: { vehicle: true, services: true, parts: true, user: { select: { name: true } } }
    })
    if (!order) return res.status(404).json({ error: 'Ordem não encontrada' })
    res.json(order)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

module.exports = { getMyProfile, getMyVehicles, getMyServiceOrders, getMyBudgets, getServiceOrderById }
