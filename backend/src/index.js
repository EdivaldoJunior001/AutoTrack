// src/index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const clientAuthRoutes = require('./routes/clientAuth.routes')
const clientRoutes = require('./routes/client.routes')
const vehicleRoutes = require('./routes/vehicle.routes')
const serviceOrderRoutes = require('./routes/serviceOrder.routes')
const budgetRoutes = require('./routes/budget.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const portalRoutes = require('./routes/portal.routes')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Internal (mechanic/admin) routes
app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/service-orders', serviceOrderRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Client portal routes
app.use('/api/portal', clientAuthRoutes)
app.use('/api/portal', portalRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚗 AutoTrack API running on port ${PORT}`))
