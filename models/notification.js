const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    senderId: String,
    targetId: String,
    type: String,
    content: String,
    read: Boolean
},
    {
        versionKey: false
    }
)

module.exports = mongoose.model('Notification', notificationSchema)