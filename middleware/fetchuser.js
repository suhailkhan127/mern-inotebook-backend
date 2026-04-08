const jwt = require('jsonwebtoken');
const JWT_SECRET = "SuhailHamz@Khi12";


// fetchuser yaha Middleware function he =  Middleware beech ka function jo request aur response ke darmiyan chalta hai ye request ko check/modify karta hai phir next function ko pass karta hai
const fetchuser = (req, res, next) =>{
    // Get the user from the JWT and ID to req object

    // token check kerne ke liye header send karenge (header me kisi bhi user ka token place karenge)
    const token = req.header('auth-token'); 

    // jab token missing ho to user ko error bhej denge
    if(!token){
        res.status(401).send({error: "Token Missing Error: please authenticate using a valid token"})
    }

    try {
        const data = jwt.verify(token, JWT_SECRET); // token ko verify karenge (agar token valid hoga to data me user ka info aa jayega)
        req.user = data.user; // req.user me user ka info store karenge (data.user me user ka info hota he)
        next(); // next() ka matlab hai ke agar token valid hoga to next middleware ya route handler ko call karenge (agar token valid hoga to user details ko getuser route me bhej denge)
    } catch (error) {
        // jab token galat ho to user ko ye error bhej denge
        res.status(401).send({error: "Incorrect Token Error: please authenticate using a valid token"})
    }

}

module.exports = fetchuser;