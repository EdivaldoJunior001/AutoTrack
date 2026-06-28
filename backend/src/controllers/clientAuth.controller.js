// src/controllers/clientAuth.controller.js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')

const clientLogin = async (req, res) => {
  const { email, password } = req.body
  try {
    const client = await prisma.client.findUnique({ where: { email } })
    if (!client) return res.status(401).json({ error: 'Credenciais inválidas' })

    const valid = await bcrypt.compare(password, client.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = jwt.sign(
      { id: client.id, name: client.name, email: client.email },
      process.env.JWT_CLIENT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({ token, client: { id: client.id, name: client.name, email: client.email, phone: client.phone } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { clientLogin }
