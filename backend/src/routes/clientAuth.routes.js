// src/routes/clientAuth.routes.js
const router = require('express').Router()
const { clientLogin } = require('../controllers/clientAuth.controller')
router.post('/login', clientLogin)
module.exports = router
