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
    id_fake: String,
    listFriendId: [],
    token: String,
    resetTokenExpires: Date,
    imageId: [{
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
    recentState: {
        type: String,
        default: false,
    },
    settingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Setting'
    }
}, {
    versionKey: false
})

module.exports = mongoose.model('User', userSchema)