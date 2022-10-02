const mongoose = require('mongoose')
const Setting = require('../models/setting')

exports.createDefaultSetting = async () => {
    try {
        const setting = new Setting({
            _id: new mongoose.Types.ObjectId(),
            sound: true,
            vibration: true,
            notification: true,
            status: 'offline',
        })
        await setting.save();
        return setting;
    } catch (error) {
        console.log('ERR createDefaultSetting ' + error)
    }
}

exports.getSetting = async (id) => {
    try {
        const setting = await Setting.findById(id)
        return setting;
    } catch (error) {
        console.log('ERR getSetting ' + error)
    }
}

exports.deleteAll = async () => {
    await Setting.find().remove()
    console.log('delete setting')
}

exports.setSetting = async (id, position) => {
    try {
        const setting = await Setting.findById(id)
        switch (position) {
            case '1':
                setting.sound = !setting.sound;
                break;
            case '2':
                setting.notification = !setting.notification
                break;
            case '3':
                setting.vibration = !setting.vibration
                break;
            default:
                break;
        }
        setting.save()
        return setting;
    } catch (error) {
        console.log('set setting err ' + error)
    }
}

exports.setStatus = async (id, status) => {
    try {
        const setting = await Setting.findById(id)
        if (status == 'offline' || status == 'free' || status == 'busy') {
            setting.status = status
            await setting.save()
            return setting
        }
    } catch (error) {
        console.log('set status err ' + error)
    }
}