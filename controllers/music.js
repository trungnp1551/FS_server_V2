const mongoose = require('mongoose')

const Music = require('../models/music')

exports.getAll = async (req, res) => {
    const data = await Music.find()

    res.status(200).json({
        success: true,
        message: 'get all',
        data
    })
}