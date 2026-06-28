// src/controllers/budget.controller.js
const prisma = require('../prisma/client')

const generateBudgetNumber = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `ORC${year}${month}${rand}`
}

const getAll = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        client: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(budgets)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getById = async (req, res) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: Number(req.params.id) },
      include: { client: true, vehicle: true, user: { select: { name: true } }, services: true, parts: true }
    })
    if (!budget) return res.status(404).json({ error: 'Orçamento não encontrado' })
    const { client: { password, ...clientSafe }, ...rest } = budget
    res.json({ ...rest, client: clientSafe })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const create = async (req, res) => {
  const { clientId, vehicleId, observations, validUntil, services = [], parts = [] } = req.body
  try {
    const totalValue = [...services, ...parts].reduce((s, i) => s + (i.unitValue * (i.quantity || 1)), 0)
    const budget = await prisma.budget.create({
      data: {
        budgetNumber: generateBudgetNumber(),
        clientId: Number(clientId),
        vehicleId: Number(vehicleId),
        userId: req.user.id,
        observations,
        validUntil: validUntil ? new Date(validUntil) : null,
        totalValue,
        services: { create: services.map(s => ({ description: s.description, unitValue: s.unitValue, quantity: s.quantity || 1, totalValue: s.unitValue * (s.quantity || 1) })) },
        parts: { create: parts.map(p => ({ name: p.name, partNumber: p.partNumber, quantity: p.quantity || 1, unitValue: p.unitValue, totalValue: p.unitValue * (p.quantity || 1), warrantyMonths: p.warrantyMonths || 0 })) }
      },
      include: { services: true, parts: true, client: { select: { name: true } }, vehicle: { select: { plate: true } } }
    })
    res.status(201).json(budget)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const update = async (req, res) => {
  try {
    const budget = await prisma.budget.update({
      where: { id: Number(req.params.id) },
      data: { status: req.body.status, observations: req.body.observations }
    })
    res.json(budget)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const remove = async (req, res) => {
  try {
    await prisma.serviceItem.deleteMany({ where: { budgetId: Number(req.params.id) } })
    await prisma.partItem.deleteMany({ where: { budgetId: Number(req.params.id) } })
    await prisma.budget.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Orçamento removido' })
  } catch (err) { res.status(400).json({ error: err.message }) }
}

module.exports = { getAll, getById, create, update, remove }
