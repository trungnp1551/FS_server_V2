const mongoose = require('mongoose')

const musicSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    musicUrl: String
},
    {
        versionKey: false
    }
)

module.exports = mongoose.model('Music', musicSchema)