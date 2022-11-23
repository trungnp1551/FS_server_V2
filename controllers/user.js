const mongoose = require('mongoose')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
var nodemailer = require('nodemailer');

const User = require('../models/user')

const settingControler = require('../controllers/setting')
const imageController = require('../controllers/image');
const e = require('express');

exports.getAll = async (req, res) => {
    const data = await User.find().populate('listImage').populate('settingId')

    res.status(200).json({
        message: 'get all',
        data
    })
}

exports.getUserByToken = async (req, res) => {
    const id = req.userId;
    try {
        const user = await User.findById(id).populate('listImage').populate('settingId')
        console.log(user.token)
        return res.status(200).json({
            success: true,
            message: 'get User',
            user
        })
    } catch (error) {
        console.log('err get user by token')
    }
}

exports.getUserById = async (req, res) => {
    const id = req.params.userId;
    try {
        const temp = await User.findById(id).populate('listImage')
        const user = {
            _id: temp._id.toString(),
            username: temp.username,
            emotion: temp.emotion,
            description: temp.description,
            id_fake: temp.id_fake,
            yearOfB: temp.yearOfB,
            sex: temp.sex,
            listImage: temp.listImage,
        }
        return res.status(200).json({
            success: true,
            message: 'get user by id',
            user
        })
    } catch (error) {
        console.log('err get user by id')
    }
}


exports.getListFriend = async (req,res)=>{
    const id = req.userId
    try {
        const user = await User.findById(id)
        let listFriendData = [];
        for (var index = 0; index < user.listFriendId.length; index++) {
            const friend = await User.findById(user.listFriendId[index]).populate('listImage')
            if(friend){
                listFriendData.push({
                    _id: friend._id.toString(),
                    username: friend.username,
                    emotion: friend.emotion,
                    description: friend.description,
                    id_fake: friend.id_fake,
                    yearOfB: friend.yearOfB,
                    sex: friend.sex,
                    listImage: friend.listImage,
                }) 
            }
            
        }
        return res.status(200).json({
            success: true,
            message: 'Get list friend',
            listFriendData
        })
    } catch (error) {
        console.log('get list friend ' + error)
        return res.status(201).json({
            success: false,
            message: 'Get list friend'
        })
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

exports.checkExists = async (req, res) => {
    const { phoneNumber } = req.body
    const user = await User.findOne({ phoneNumber: phoneNumber })

    if (!user) {
        return res.status(201).json({
            success: false,
            message: 'check user exists'
        })
    } else {
        return res.status(200).json({
            success: true,
            message: 'check user exists'
        })
    }
}

exports.sendMailForgotPassword = async (req, res) => {
    const { phoneNumber } = req.body
    const user = await User.findOne({ phoneNumber: phoneNumber })

    const randomCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    console.log(user.gmai)
    if (await sendMail(user.gmail, 'FORGOT PASSWORD', 'Code: ' + randomCode)) {
        return res.status(200).json({
            success: true,
            code: randomCode,
            message: 'send mail forgot password'
        })
    } else {
        return res.status(201).json({
            success: false,
            message: 'send mail forgot password'
        })
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
        listImage: avtDefault._id.toString()
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

    const user = await User.findOne({ phoneNumber: phoneNumber }).populate('listImage')

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
    await user.save()
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

exports.resetPassword = async (req, res) => {
    const { phoneNumber, newPassword } = req.body

    const user = await User.findOne({ phoneNumber: phoneNumber })

    const hashedNewPassword = await argon2.hash(newPassword)
    user.password = hashedNewPassword
    await user.save()

    return res.status(200).json({
        success: true,
        message: 'Reset password'
    })
}

exports.upAvatar = async (req, res) => {
    const id = req.userId;
    try {
        const user = await User.findById(id).populate('listImage')
        if (user.listImage[0] != undefined && user.listImage[0].imageId != '001') {
            await imageController.destroyImage(user.listImage[0])
        }
        if (req.file == undefined) {
            user.listImage[0] = await imageController.getAvtDefault()
            await user.save()
            return res.status(200).json({
                success: false,
                message: "Up avatar default",
                avatar: user.listImage[0]
            })
        }
        const image = await imageController.upload(req.file.path, 'avatar')
        user.listImage[0] = image
        await user.save()
        res.status(200).json({
            success: true,
            message: "Up avatar successful",
            avatar: user.listImage[0]
        })

    } catch (error) {
        console.log(error)
    }
}

exports.changeStatus = async (req, res) => {
    const id = req.userId
    const { status } = req.body


    try {
        const user = await User.findById(id)
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

    try {
        const user = await User.findById(id)
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

exports.addFriend = async (req, res) => {
    const userId = req.userId
    const { friendId } = req.body

    try {
        const user = await User.findById(userId)
        const friend = await User.findById(friendId)

        if (user.listFriendId.includes(friendId)) {
            return res.status(201).json({
                success: false,
                message: 'Add friend'
            });
        }

        if (user.listPendingFriend.includes(friendId)) {  //check friendId is in user' listPendingFriend
            //addfriend
            user.listPendingFriend.remove(friendId)
            user.listFriendId.push(friendId)

            friend.listFriendId.push(userId)

            await user.save()
            await friend.save()
            return res.status(200).json({
                success: true,
                message: 'Add friend'
            });
        } else {
            //send a friend request
            if (!friend.listPendingFriend.includes(userId)) {
                friend.listPendingFriend.push(userId)
                await friend.save()
                return res.status(200).json({
                    success: true,
                    message: 'Send a friend request'
                });
            }else{
                return res.status(201).json({
                    success: false,
                    message: 'Send a friend request'
                });
            }

        }
    } catch (error) {
        console.log(error)
        return res.status(201).json({
            success: false,
            message: 'add friend err'
        });
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
        subject: subject,
        text: content
    };

    try {
        const result = await transporter.sendMail(mailOptions)

        if (!result) {
            console.log('err send mail')
            return false
        }
        else {
            console.log('send mail')
            return true
        }
    } catch (error) {
        console.log(error + '123')
        return false
    }
}

async function checkInChatRoom() {
    return false;

}

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
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