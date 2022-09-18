const mongoose = require('mongoose')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
var nodemailer = require('nodemailer');

const User = require('../models/user')

const settingControler = require('../controllers/setting')
const imageController = require('../controllers/image')

exports.getAll = async (req, res) => {
    const data = await User.find()

    res.status(200).json({
        message: 'get all',
        data
    })
}

exports.getOne = async (req, res) => {
    const id = req.userId;
    console.log(id)
    try {
        const user = await User.findById(id).populate('imageId').populate('settingId')
        return res.status(200).json({
            success: true,
            message: 'get User',
            user
        })
    } catch (error) {
        console.log('err get user')
    }
}

exports.deleteAll = async () => {
    try {
        await settingControler.deleteAll()
        await User.find().remove()
        console.log('delete user')
    } catch (error) {
        console.log('err')
    }
}

exports.regiter = async (req, res) => {
    const { phoneNumber, password } = req.body

    const user = await User.findOne({ phoneNumber: phoneNumber })

    if (!phoneNumber || !password)
        return res.status(400).json({
            success: false,
            message: 'Missing phoneNumber and/or password'
        })

    if (user)
        return res.status(400).json({
            success: false,
            message: 'register fail, user exists'
        })

    const hashedPassword = await argon2.hash(password)

    const settingDefault = await settingControler.createDefaultSetting();
    const avtDefault = await imageController.getAvtDefault()

    ///fake id
    const fake_id = Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;

    const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: phoneNumber,
        password: hashedPassword,
        id_fake: fake_id,
        role: 'user',
        settingId: settingDefault._id.toString(),
        imageId: avtDefault._id.toString()
    })
    await newUser.save()
    return res.status(200).json({
        success: true,
        message: 'register',
        newUser
    })
}

exports.logIn = async (req, res) => {
    const { phoneNumber, password } = req.body

    if (!phoneNumber || !password)
        return res.status(400).json({
            success: false,
            message: 'Missing phoneNumber and/or password'
        })

    const user = await User.findOne({ phoneNumber: phoneNumber }).populate('imageId')

    if (!user) {
        console.log('type: Not exists user')
        return res.status(200).json({
            message: 'Not exists user'
        })
    }

    const passwordValid = await argon2.verify(user.password, password)

    if (!passwordValid)
        return res.status(400).json({
            success: false,
            message: 'Incorrect phoneNumber or password'
        })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '1d' })

    user.token = token
    await settingControler.setStatus(user.settingId, 'free')
    await user.populate('settingId')

    return res.status(200).json({
        success: true,
        message: 'Login',
        user
    })
}

exports.updateProfile = async (req, res) => {
    const id = req.userId;
    const { username, emotion, yearOfB, description } = req.body

    try {
        const user = await User.findById(id)
        if (username != '') {
            user.username = username
        }
        if (emotion != '') {
            user.emotion = emotion
        }
        if (yearOfB != '') {
            user.yearOfB = yearOfB
        }
        if (description != '') {
            user.description = description
        }

        await user.save()
        return res.status(200).json({
            success: true,
            message: "update profile"
        })
    } catch (error) {
        console.log('err update profile')
        return res.status(200).json({
            success: false,
            message: "update profile"
        })
    }
}

exports.changePassword = async (req, res) => {
    const id = req.userId
    const { password, newPassword } = req.body

    const user = await User.findById(id)

    const passwordValid = await argon2.verify(user.password, password)

    if (!passwordValid)
        return res.status(400).json({
            success: false,
            message: 'Incorrect old password'
        })

    const hashedNewPassword = await argon2.hash(newPassword)
    user.password = hashedNewPassword
    await user.save()

    return res.status(200).json({
        success: true,
        message: 'Change password'
    })
}

exports.upAvatar = async (req, res) => {
    const id = req.userId;
    try {
        const user = await User.findById(id)
        if (user.avatarId != undefined && user.avatarId != '001') {
            await ImageController.destroyImage(user.avatarId)
            //await cloudinary.uploader.destroy(user.avatarId)
        }
        if (req.file == undefined) {
            user.avatarId = '001'
            await user.save()
            res.status(200).json({
                message: "Up avatar successful",
                avatarId: user.avatarId,
                avatarUrl: await ImageController.getUrl(user.avatarId)
            })
            return;
        }
        const image = await ImageController.upload(req.file.path)
        user.avatarId = image._id
        await user.save()
        res.status(200).json({
            message: "Up avatar successful",
            avatar: user.avatarId,
            avatarUrl: image.imageUrl
        })

    } catch (error) {
        console.log(error)
    }
}

exports.changeStatus = async (req, res) => {
    const id = req.userId
    const { status } = req.body
    const user = await User.findById(id)

    try {
        var checkStatus
        if (status == 'offline') {
            checkStatus = 'offline'
        } else {
            // CHECK IN CHATROOM OR NOT

            if (await checkInChatRoom()) {
                checkStatus = 'busy'
            } else {
                checkStatus = 'free'
            }
        }
        var newSetting = await settingControler.setStatus(user.settingId, checkStatus)

        return res.status(200).json({
            success: true,
            message: 'change status',
            newSetting
        })
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            success: false,
            message: 'change setting'
        })
    }
}

exports.changeSetting = async (req, res) => {
    const id = req.userId
    const { position } = req.body
    const user = await User.findById(id)
    try {
        const newSetting = await settingControler.setSetting(user.settingId, position)

        return res.status(200).json({
            success: true,
            message: 'change setting',
            newSetting
        })
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            success: false,
            message: 'change setting'
        })
    }

}

async function sendMail(toMail, subject, content) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASS
        }
    });

    var mailOptions = {
        from: 'familiarstrangerv2@gmail.com',
        to: toMail,
        subject: subject + 'FORGOT PASSWORD',
        text: content
    };

    try {
        const result = await transporter.sendMail(mailOptions)

        if (!result) {
            console.log('err send mail')
        }
        else {
            console.log('send mail')
        }
    } catch (error) {
        console.log(error + '123')
    }
}

async function checkInChatRoom() {
    return false;

}
//  checkInChatRoom = async () => {
//     return false;

// }

// exports.forgotPassword = async (req, res) => {
//     const { phoneNumber } = req.body
//     const user = await User.findOne({ phoneNumber: phoneNumber })

//     if(!user){
//         return res.status(200).json({
//             success: false,
//             message:'User not exists'
//         })
//     }

//     const numberVerify = Math.floor(Math.random() * (999999 - 100000)) + 100000;
//     await sendMail(user.gmail, 'FORGOT PASSWORD', 'NumberVerify: ' + numberVerify)

// }