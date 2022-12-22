const mongoose = require('mongoose')    

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        default: 'unknow'
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum:['user','admin']
    },
    emotion: {
        type: String,
        default: '...'
    },
    description: {
        type: String,
        default: '...'
    },
    gmail: String,
    id_fake: String,
    listFriendId: [],
    listPendingFriend: [],
    listRecentConnect: [],
    token: String,
    resetTokenExpires: Date,
    listImage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
    }],
    yearOfB: {
        type:String,
        default: '2001'
    },
    sex: {
        type: String,
        default: 'male'
    },
    settingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Setting'
    }
}, {
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)