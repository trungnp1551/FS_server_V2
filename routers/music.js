const express = require('express')
const router = express.Router()

const musicController = require('../controllers/music')

router
    .route('/')
    .get(musicController.getAll)

module.exports = router