const mongoose = require('mongoose')
const Image = require('../models/image')
const cloudinary = require('../routers/cloudinary')

exports.getAvtDefault = async () => {
    return await Image.findOne({ imageId: '001' })
}

exports.upload = async (path) => {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    newdate = day + "/" + month + "/" + year;

    try {
        const result = await cloudinary.uploader.upload(path);
        const image = new Image({
            _id: new mongoose.Types.ObjectId(),
            imageId: result.public_id,
            imageUrl: result.secure_url,
            uploadTime: newdate
        })
        await image.save()
        return image
    } catch (error) {
        console.log(error)
    }
}

exports.destroyImage = async (id) => {
    try {
        await cloudinary.uploader.destroy(id)
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// exports.getUrl = async (id)=>{
//     try {
//         const image = await Image.findById(id)
//         return image.imageUrl
//     } catch (error) {
//         console.log(error)
//     }
// }