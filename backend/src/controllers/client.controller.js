// src/controllers/client.controller.js
const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')

const getAll = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, email: true, phone: true, cpf: true, status: true, createdAt: true,
        _count: { select: { vehicles: true, serviceOrders: true } }
      },
      orderBy: { name: 'asc' }
    })
    res.json(clients)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const getById = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: Number(req.params.id) },
      include: { vehicles: true, serviceOrders: { include: { vehicle: true, services: true, parts: true }, orderBy: { createdAt: 'desc' } }, budgets: { include: { vehicle: true, services: true, parts: true }, orderBy: { createdAt: 'desc' } } }
    })
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' })
    const { password, ...safe } = client
    res.json(safe)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

const create = async (req, res) => {
  const { name, email, phone, cpf, password } = req.body
  try {
    const hashed = await bcrypt.hash(password || '123456', 10)
    const client = await prisma.client.create({
      data: { name, email, phone, cpf, password: hashed },
      select: { id: true, name: true, email: true, phone: true, cpf: true, status: true }
    })
    res.status(201).json(client)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const update = async (req, res) => {
  const { name, email, phone, cpf, status, password } = req.body
  try {
    const data = { name, email, phone, cpf, status }
    if (password) data.password = await bcrypt.hash(password, 10)
    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, name: true, email: true, phone: true, cpf: true, status: true }
    })
    res.json(client)
  } catch (err) { res.status(400).json({ error: err.message }) }
}

const remove = async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Cliente removido' })
  } catch (err) { res.status(400).json({ error: err.message }) }
}

module.exports = { getAll, getById, create, update, remove }
