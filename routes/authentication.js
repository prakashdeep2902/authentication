const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const authenticate = require('../middleware/authenticate');
JWT_SECRET = 'prakashis$boy'
const nodemailer = require('nodemailer');
const { json, text } = require('express');
// email config 

const transporter = nodemailer.createTransport({

    service: "gmail",
    auth: {
        user: "prakashdeep2902@gmail.com",
        pass: "iljlpqoqovveuhku"
    }
})

// ROUTE 1:create a user using: POST "/api/createuser".no login required

router.post('/createuser', [
    body('name', 'Enter the vaild name').isLength({ min: 3 }),
    body('email', 'Enter the vaild email').isEmail(),
    body('password', 'password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {


    let success = false;
    //    if any input is blank 
    const isInputIsBlank = validationResult(req);
    if (!isInputIsBlank.isEmpty()) {
        return res.status(400).json({ success, isInputIsBlank: isInputIsBlank.array() });
    }
    // cheack wethere user with same email exist
    try {

        let IsUserPresentInDb = await User.findOne({ email: req.body.email })

        if (IsUserPresentInDb) {

            return res.status(400).json({ success, error: "sorry a user with this email already exist" })
        }
        // creating a salt for making password strong
        const salt = await bcrypt.genSalt(10);
        //    by using hash method can encryipt the password
        const secPass = await bcrypt.hash(req.body.password, salt)



        // creating new data pocket with srong password 
        let userWithStrongPass = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,

        })

        const _id = {
            userWithStrongPass_Id: {
                id: userWithStrongPass.id
            }
        }

        // making a auth token
        const Authtoken = jwt.sign(_id, JWT_SECRET)
        success = true;
        res.json({ success, Authtoken })

    } catch (error) {

        console.error(error.message);
        res.status(500).send("some Error occured")

    }


})


// ROUTE 2:Authenticate the user a user using: POST "/api/login".no login required
router.post('/login', [

    body('email', 'Enter the vaild email').isEmail(),
    body('password', 'password can not be blank').exists(),

], async (req, res) => {


    const { email, password } = req.body;
    let success = false;
    const errors = validationResult(req);
    console.log(errors.isEmpty(), "line number 95");
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {

        let userPresentInDB = await User.findOne({ email });
        if (!userPresentInDB) {

            return res.status(400).json({ success, error: "please try to log-in with correct credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, userPresentInDB.password);
        if (!passwordCompare) {

            return res.status(400).json({ success, error: "please try to log in with correct credentials" })
        }

        const _id = {
            user: {
                id: userPresentInDB.id
            }
        }
        const Authtoken = jwt.sign(_id, JWT_SECRET)

        success = true;
        res.json({ success, user: userPresentInDB, Authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send(" Interval server occured")
    }
})

// ROUTE 3:Get user login Details: POST "/api/getuser". login required

router.post('/getuser', fetchuser, async (req, res) => {


    try {

        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(" Interval server occured")
    }
})

// Route 4: send link for reset password  

router.post('/sendpasswordlink', async (req, res) => {
    const { email } = req.body;
    console.log("email: ", email)
    if (!email) {
        res.status(401), json({ status: 401, message: "Enter your Email" })
    }
    try {

        const userfind = await User.findOne({ email: email });
        const token = jwt.sign({ _id: userfind._id }, JWT_SECRET, { expiresIn: "120s" })
        const setusertoken = await User.findByIdAndUpdate({ _id: userfind._id }, { verifytoken: token }, { new: true })
        if (setusertoken) {
            const mailOptions = {
                from: "prakashdeep2902@gmail.com",
                to: email,
                subject: "Sending the email for password Reset",
                text: `This Link is Valid for 2 Minute http://localhost:3000/addnewpassword/${userfind.id}/${setusertoken.verifytoken}`
            }
            console.log("userfind.id: ", userfind.id)
            console.log("setusertoken.verifytoken: ", setusertoken.verifytoken)
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error: ", error);
                    res.status(401).json({ status: 401, message: "email not send " })
                } else {
                    console.log("Email sent: ", info.response);
                    res.status(201).json({ status: 201, message: "Email sent successfuly " })
                }
            })
        }


    } catch (error) {
        res.status(401).json({ status: 401, message: "user invalide" })
    }
})

// Route 5: verify user for reset  password and upadate the password

router.get("/addnewpassword/:id/:token", async (req, res) => {


    const { id, token } = req.params

    try {
        const validuser = await User.findOne({ _id: id, verifytoken: token });
        const verifyToken = jwt.verify(token, JWT_SECRET)

        if (validuser && verifyToken._id) {
            res.status(201).json({ status: 201, validuser });

        } else {
            res.status(401).json({ status: 401, message: "user not exist" });
        }
    } catch (error) {
        res.status(401).json({ status: 401, error });

    }
})

// Route 6: change password update password reset
router.post("/:id/:token", async (req, res) => {

    const { id, token } = req.params;
    const { passw } = req.body;

    try {
        const validuser = await User.findOne({ _id: id, verifytoken: token });
        const verifyToken = jwt.verify(token, JWT_SECRET)
        if (validuser && verifyToken._id) {

            const newpassword = await bcrypt.hash(passw, 10);
            console.log("newpassword: " + newpassword);
            const setnewuserpass = await User.findByIdAndUpdate({ _id: id }, { password: newpassword })
            setnewuserpass.save();
            res.status(201).json({ status: 201, setnewuserpass });

        } else {
            res.status(401).json({ status: 401, message: "user not exist" });
        }
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
})

// route 7 user valid

router.get('/valideuser', authenticate, async (req, res) => {

    console.log("done");

    try {
        const valideuserone = await User.findOne({ _id: req.userId })
        console.log(valideuserone)
        res.status(201).json({ status: 201, valideuserone });
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }


})
module.exports = router