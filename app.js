const express = require('express')
const app = express()

require('dotenv').config()
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser')


const userRouter = require('./routers/user')
const musicRouter = require('./routers/music')
const notificationRouter = require('./routers/notification')

mongoose
    .connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('mongo connected')
    })
    .catch(err => {
        console.log(err);
        console.log('connect fail')
    });

    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use('/user', userRouter)
    app.use('/music', musicRouter)
    app.use('/notification', notificationRouter)

module.exports = app 