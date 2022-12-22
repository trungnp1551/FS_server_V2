const mongoose = require('mongoose')

const Notification = require('../models/notification')

exports.getNotification = async(req, res) => {
    const id = req.userId
    try {
        const listNotification = await Notification.find({targetId : id})
        console.log('mm')
        return res.status(200).json({
            success: true,
            message: "get notification successful",
            listNotification
        })
    } catch (error) {
        console.log(error)
    }
}

exports.addNotification = async(req,res) => {
    const {senderId, targetId, type, content, read} = req.body
    console.log(senderId + '123')
    try {
        const newNotification = new Notification({
            _id: new mongoose.Types.ObjectId(),
            senderId,
            targetId,
            type,
            content,
            read
        })
        await newNotification.save()
        return res.status(200).json({
            success: true,
            message: "add notification successful",
            newNotification
        })
    } catch (error) {
        console.log(error)
    }
}
