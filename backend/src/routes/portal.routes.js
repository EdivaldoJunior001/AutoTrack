// src/routes/portal.routes.js
const router = require('express').Router()
const ctrl = require('../controllers/portal.controller')
const { clientAuthMiddleware } = require('../middleware/auth.middleware')
router.use(clientAuthMiddleware)
router.get('/me', ctrl.getMyProfile)
router.get('/vehicles', ctrl.getMyVehicles)
router.get('/service-orders', ctrl.getMyServiceOrders)
router.get('/service-orders/:id', ctrl.getServiceOrderById)
router.get('/budgets', ctrl.getMyBudgets)
module.exports = router
