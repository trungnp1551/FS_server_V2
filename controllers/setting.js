const mongoose = require('mongoose')
const Setting = require('../models/setting')

exports.createDefaultSetting = async () => {
    try {
        const setting = new Setting({
            _id: new mongoose.Types.ObjectId(),
            sound: true,
            vibration: true,
            notification: true,
            status: true,
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

exports.deleteAll = async ()=>{
    await Setting.find().remove()
    console.log('delete setting')
}