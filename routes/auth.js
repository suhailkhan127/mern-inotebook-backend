const express = require('express');
const User =  require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator'); 
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const JWT_SECRET = "SuhailHamz@Khi12";

var fetchuser = require('../middleware/fetchuser');


// ROUTE 1: create a user using: POST "/api/auth/createuser" . Doesn't require login
router.post('/createuser', [
    body('name', 'Enter a valid Name, required minimum 3').isLength({ min:3 }),
    body('email', 'Email wrong add ki he').isEmail(),
    body('password', 'required minimum 5').isLength({min:5})
], async (req, res) => {
    
    let success = false;
    // agar errors hon to array me send karo
    const errors = validationResult(req); 
    if (!errors.isEmpty()){
        return res.status(400).json({ success, errors: errors.array() })
    } 
     
    // try catch ka purpose: Code me agar koi error aa jaye to app crash na ho, balkay handle ho jaye.
    try {
 
        // await purpose = jab tak ye kaam (response) khatam nahi hota, tab tak ruk jao aur aage mat barho.
        let user =  await User.findOne({ email: req.body.email }); // yahan DB call ho rahi hai → error aa sakta hai isleiye neche wali line me error msg place kia he
        if (user) {
            return res.status(400).json({ success, error: "Email already exists" }); // agar error hoto ye msg send karo
        }

        // Dono mein farq ye hai:
        // user.save() (Jo aapne comment kiya hai): Isme pehle aap object banate hain (new User), phir usay save karte hain. Ye do steps ka kaam hai.
        // User.create() (Jo aap use kar rahe hain): Ye ek hi step mein naya document banata hai aur usay MongoDB mein save bhi kar deta hai.


        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create new user
        user = await User.create({ // User.create() istemal karna actually user.save() karna hi ek behtar tareeka hai.
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        const data = {
            user:{
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        console.log("JWT Token = " + authToken);  // VSCode ke terminal me result show karwa deta he

        success = true;
        res.json({ success, authToken });

        // 👉 success response
        res.status(201).json({ 
            message: "User created successfully",
            userCreated: user, 
            JWTToken: authToken
        });

    } catch (error) { // → agar error aaye to handle karo
        console.error(error.message); // specially errors ke liye use hota hai (debugging ke liye)
        res.status(500).send("Some Error Occured"); // jab code crash ho = 👉 user ko generic error message bhej diya
    }
    
});

// ROUTE 2: Authenticate/login a user using: POST "/api/auth/login" . Doesn't require login
router.post('/login', [ // Ye ek standard MERN JWT pattern hai
    body('email', 'Email wrong add ki he').isEmail(),
    body('password', 'Password cannot be blank').exists(),
    ], async (req, res) => {
    let success = false; // login successful hua ya nahi ye track karne ke liye ek variable banaya hai, jiska initial value false hai. Agar login successful hota hai to is variable ko true kar denge, aur agar login unsuccessful hota hai to is variable ko false hi rehne denge. Is tarah se hum response me login ke success ya failure ko indicate kar sakte hain.

    // agar errors hon to array me send karo
    const errors = validationResult(req); 
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    } 

    const { email, password } = req.body;

    try{
        let user = await User.findOne({ email});
        if(!user){
            success = false;
            return res.status(400).json({error: "(Email is wrong) please try to login with correctv credential"})
        }

        const comparePassword = await bcrypt.compare(password, user.password); // bcrypt.compare() function ka use password ko compare karne ke liye hota hai. Ye function do arguments leta hai: pehla argument user ke input se aaya hua password (plain text), aur doosra argument database me stored hashed password. Ye function internally plain text password ko hash karta hai aur phir dono hashes ko compare karta hai. Agar dono hashes match karte hain, to ye function true return karta hai, warna false return karta hai. Is tarah se hum user ke input password ko securely verify kar sakte hain bina actual password ko store kiye.
        if(!comparePassword){
            success = false;
            return res.status(400).json({success, error: "(Password is wrong) please try to login with correct credential"});
        }

        const data = {
            user:{
                id: user.id // MongoDB automatically har user ko ek unique id assign karta hai, jise hum user.id ke through access kar sakte hain. Ye id user ko uniquely identify karne ke liye hoti hai, aur isse hum JWT token me include karte hain taake jab user login kare to uski identity verify ki ja sake.
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET); // JWT token generate kar diya, jise frontend me use karenge user ko authenticate karne ke liye
        success = true;

        //res.json({success, authToken});  // response me token bhej diya, jise frontend me use karenge user ko authenticate karne ke liye

        res.json({
            success,
            authToken,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) { // → agar error aaye to handle karo
        console.error(error.message); // specially errors ke liye use hota hai (debugging ke liye)
        res.status(500).send("Internal server error"); 
    }

})


// ROUTE 3: Get logged in user details using: POST "/api/auth/getuser" . login Required

// fetchuser yaha middle function ke roop me use ho raha hai, jiska matlab hai ki ye function har request ke beech me execute hoga. Jab bhi koi request /getuser route par aayegi, to pehle fetchuser middleware execute hoga. Ye middleware JWT token ko verify karega aur user ki identity ko authenticate karega. Agar token valid hai, to fetchuser middleware user ki information ko request object me attach kar dega (req.user), jise hum aage ke code me access kar sakte hain. Is tarah se hum ensure kar sakte hain ki sirf authenticated users hi apni details access kar sakte hain.

// Middleware = beech ka function jo request aur response ke darmiyan chalta hai ye request ko check/modify karta hai phir next function ko pass karta hai
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user =  await User.findById(userId).select("-password"); // password ko exclude karne ke liye select me -password use kia he
        res.send(user);
    
    } catch (error) {
        console.error(error.message); // ye VS code ke terminal me error show karwata he 
        res.status(500).send("Internal server error")
    }
}) 

module.exports = router