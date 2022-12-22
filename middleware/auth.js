const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {
    try {
        //const token = req.headers.authorization.split(" ")[1]
        const token = req.headers.authorization

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        //console.log("DECODE: " + decoded.userId)
        req.userId = decoded.userId
        next()
    }
    catch (error) {
        //console.log(error)
        return res.status(401).json({
            success: false,
            message: "Auth failed due to token missing"
        })
    }
}