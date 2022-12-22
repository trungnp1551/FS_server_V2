const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const notificationController = require('../controllers/notification')

router
    .route('/')
    .get(auth, notificationController.getNotification)
    .post(notificationController.addNotification)

module.exports = router