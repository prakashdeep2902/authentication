const jwt = require('jsonwebtoken');
JWT_SECRET = 'prakashis$boy'


const fetchuser = (req, res, next) => {

    // get the  user from the jwt token and add id to req object
    const token = req.header('Authtoken');
    
    if (!token) {     
        res.status(401).send({ error: "please authenticate using a valid token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user;
        next()

    } catch (error) {
        console.error("error: "+error.message);
        // res.status(401).send({ error: "please authenticate using a valid token" })
    }

}


module.exports = fetchuser
