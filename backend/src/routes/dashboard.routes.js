// src/routes/dashboard.routes.js
const router = require('express').Router()
const { getStats } = require('../controllers/dashboard.controller')
const { authMiddleware } = require('../middleware/auth.middleware')
router.use(authMiddleware)
router.get('/', getStats)
module.exports = router
