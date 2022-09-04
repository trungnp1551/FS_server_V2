const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imageId: String,
    imageUrl: String,
    type: {
        type: String,
        enum:['message','avatar','wallpaper']
    }
}, {
    versionKey: false
})

module.exports = mongoose.model('Image', imageSchema)