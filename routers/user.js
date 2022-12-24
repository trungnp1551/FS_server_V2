const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const auth = require('../middleware/auth')
const upload = require('../middleware/upload');

router
    .route('/getAll')
    .get(userController.getAll)

router
    .route('/')
    .get(auth, userController.getUserByToken)
    .post(userController.regiter)
    .delete(userController.deleteAll)
    .patch(auth, userController.updateProfile)

router
    .route('/getUser/:userId')
    .get(userController.getUserById)

router
    .route('/upAvatar')
    .post(auth, upload.single("avatar"), userController.upAvatar)

router
    .route('/addImage')
    .post(auth, upload.single("image"), userController.addImage)

router
    .route('/addImageMess')
    .post(upload.single("image"), userController.addImageMess)

router
    .route('/forgot/checkExists')
    .post(userController.checkExists)

router
    .route('/forgot/sendMail')
    .post(userController.sendMailForgotPassword)

router
    .route('/login')
    .post(userController.logIn)

router
    .route('/resetPassword')
    .post(userController.resetPassword)

router
    .route('/changesetting')
    .patch(auth, userController.changeSetting)

router
    .route('/changestatus')
    .patch(auth, userController.changeStatus)

router
    .route('/friend')
    .get(auth, userController.getListFriend)
    .post(auth, userController.addFriend)

router
    .route('/addrecentconnect')
    .post(auth, userController.addRecentConnect)

module.exports = router