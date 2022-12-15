const jwt = require('jsonwebtoken');
const JWT_SECRET = 'prakashis$boy'
const User = require("../models/User");

const authenticate =  (req, res, next) => {

   
    try {

        const token =req.header('Authtoken');
  
        const verifytoken = jwt.verify(token, JWT_SECRET);
        console.log("verifytoken: ")
        console.log(verifytoken)
        const rootUser=User.findOne({ _id: verifytoken._id })
      

        if (!rootUser) {
            throw new Error("user not found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userid = rootUser._id;
        next();


    } catch (error) {

        res.status(401).json({ status: 401, message: "unauthorized no token provider" })

    }


}

module.exports = authenticate;