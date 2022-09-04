const express = require('express')
const app = express()

require('dotenv').config()
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser')


const userRouter = require('./routers/user')

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

    app.use('/user',userRouter)

module.exports = app 