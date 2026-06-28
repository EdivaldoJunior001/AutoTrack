// src/controllers/vehicle.controller.js
const prisma = require('../prisma/client')

const getAll = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { client: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(vehicles)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getById = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        visits: { orderBy: { visitDate: 'desc' } },
        serviceOrders: { include: { services: true, parts: true, user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        budgets: { include: { services: true, parts: true }, orderBy: { createdAt: 'desc' } }
      }
    })
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json(vehicle)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const create = async (req, res) => {
  const { plate, brand, model, year, color, mileage, observations, clientId } = req.body
  try {
    const vehicle = await prisma.vehicle.create({
      data: { plate: plate.toUpperCase(), brand, model, year: Number(year), color, mileage: mileage ? Number(mileage) : null, observations, clientId: Number(clientId) },
      include: { client: { select: { name: true } } }
    })
    res.status(201).json(vehicle)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const update = async (req, res) => {
  const { plate, brand, model, year, color, mileage, observations, status } = req.body
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(req.params.id) },
      data: { plate: plate?.toUpperCase(), brand, model, year: year ? Number(year) : undefined, color, mileage: mileage ? Number(mileage) : undefined, observations, status },
      include: { client: { select: { name: true } } }
    })
    res.json(vehicle)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const remove = async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Veículo removido' })
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const registerVisit = async (req, res) => {
  const { mileage, reason, observations } = req.body
  try {
    const visit = await prisma.vehicleVisit.create({
      data: { vehicleId: Number(req.params.id), mileage: mileage ? Number(mileage) : null, reason, observations }
    })
    if (mileage) {
      await prisma.vehicle.update({ where: { id: Number(req.params.id) }, data: { mileage: Number(mileage) } })
    }
    res.status(201).json(visit)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

module.exports = { getAll, getById, create, update, remove, registerVisit }
