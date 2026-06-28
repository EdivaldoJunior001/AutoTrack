// src/routes/vehicle.routes.js
const router = require('express').Router()
const ctrl = require('../controllers/vehicle.controller')
const { authMiddleware } = require('../middleware/auth.middleware')
router.use(authMiddleware)
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
router.post('/:id/visit', ctrl.registerVisit)
module.exports = router
