const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const auth = require('../middleware/auth')

router
    .route('/')
    .get(auth, userController.getOne)
    .post(userController.regiter)
    .delete(userController.deleteAll)
    .patch(auth, userController.updateProfile)

router
    .route('/login')
    .post(userController.logIn)

module.exports = router