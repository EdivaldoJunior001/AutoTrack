// src/controllers/serviceOrder.controller.js
const prisma = require('../prisma/client')

const generateOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `OS${year}${month}${rand}`
}

const getAll = async (req, res) => {
  try {
    const orders = await prisma.serviceOrder.findMany({
      include: {
        client: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getById = async (req, res) => {
  try {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        vehicle: true,
        user: { select: { name: true } },
        services: true,
        parts: true
      }
    })
    if (!order) return res.status(404).json({ error: 'Ordem não encontrada' })
    res.json(order)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const create = async (req, res) => {
  const { clientId, vehicleId, observations, services = [], parts = [] } = req.body
  try {
    const servicesTotal = services.reduce((s, i) => s + (i.unitValue * i.quantity), 0)
    const partsTotal = parts.reduce((s, i) => s + (i.unitValue * i.quantity), 0)
    const totalValue = servicesTotal + partsTotal

    const order = await prisma.serviceOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        clientId: Number(clientId),
        vehicleId: Number(vehicleId),
        userId: req.user.id,
        observations,
        totalValue,
        services: {
          create: services.map(s => ({
            description: s.description,
            unitValue: s.unitValue,
            quantity: s.quantity || 1,
            totalValue: s.unitValue * (s.quantity || 1)
          }))
        },
        parts: {
          create: parts.map(p => {
            const warrantyExpires = p.warrantyMonths
              ? new Date(Date.now() + p.warrantyMonths * 30 * 24 * 60 * 60 * 1000)
              : null
            return {
              name: p.name,
              partNumber: p.partNumber,
              quantity: p.quantity || 1,
              unitValue: p.unitValue,
              totalValue: p.unitValue * (p.quantity || 1),
              warrantyMonths: p.warrantyMonths || 0,
              warrantyExpires
            }
          })
        }
      },
      include: { services: true, parts: true, client: { select: { name: true } }, vehicle: { select: { plate: true, model: true } } }
    })
    res.status(201).json(order)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const update = async (req, res) => {
  const { status, observations, completionDate, services, parts } = req.body
  try {
    const data = { status, observations }
    if (completionDate) data.completionDate = new Date(completionDate)
    if (status === 'COMPLETED' && !completionDate) data.completionDate = new Date()

    if (services) {
      await prisma.serviceItem.deleteMany({ where: { serviceOrderId: Number(req.params.id) } })
      data.services = { create: services.map(s => ({ description: s.description, unitValue: s.unitValue, quantity: s.quantity || 1, totalValue: s.unitValue * (s.quantity || 1) })) }
    }

    if (parts) {
      await prisma.partItem.deleteMany({ where: { serviceOrderId: Number(req.params.id) } })
      data.parts = {
        create: parts.map(p => {
          const warrantyExpires = p.warrantyMonths ? new Date(Date.now() + p.warrantyMonths * 30 * 24 * 60 * 60 * 1000) : null
          return { name: p.name, partNumber: p.partNumber, quantity: p.quantity || 1, unitValue: p.unitValue, totalValue: p.unitValue * (p.quantity || 1), warrantyMonths: p.warrantyMonths || 0, warrantyExpires }
        })
      }
    }

    const allServices = await prisma.serviceItem.findMany({ where: { serviceOrderId: Number(req.params.id) } })
    const allParts = await prisma.partItem.findMany({ where: { serviceOrderId: Number(req.params.id) } })
    data.totalValue = allServices.reduce((s, i) => s + Number(i.totalValue), 0) + allParts.reduce((s, i) => s + Number(i.totalValue), 0)

    const order = await prisma.serviceOrder.update({
      where: { id: Number(req.params.id) },
      data,
      include: { services: true, parts: true }
    })
    res.json(order)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const remove = async (req, res) => {
  try {
    await prisma.serviceItem.deleteMany({ where: { serviceOrderId: Number(req.params.id) } })
    await prisma.partItem.deleteMany({ where: { serviceOrderId: Number(req.params.id) } })
    await prisma.serviceOrder.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Ordem removida' })
  } catch (err) { res.status(400).json({ error: err.message }) }
}

module.exports = { getAll, getById, create, update, remove }
