const mongoose = require('mongoose')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
//const Image = require('../models/image')

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

    const user = await User.findOne({ phoneNumber: phoneNumber }).populate('imageId').populate('settingId')

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

    return res.status(200).json({
        success: true,
        message: 'Login',
        user
    })
}

exports.updateProfile = async (req,res)=>{
    const id = req.userId;
    const {username} = req.body

    try {
        const user = await User.findById(id)
        user.username = username
        await user.save()
        return res.status(200).json({
            success: true,
            message:"update profile"
        })
    } catch (error) {
        console.log('err update profile')
    }
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
