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
    
    // agar errors hon to array me send karo
    const errors = validationResult(req); 
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    } 
     
    // try catch ka purpose: Code me agar koi error aa jaye to app crash na ho, balkay handle ho jaye.
    try {
        // console.log(req.body);
        // const user = new User(req.body); 
        // await user.save();
 
        
        // await purpose = jab tak ye kaam (response) khatam nahi hota, tab tak ruk jao aur aage mat barho.
        let user =  await User.findOne({ email: req.body.email }); // yahan DB call ho rahi hai → error aa sakta hai isleiye neche wali line me error msg place kia he
        if (user) {
            return res.status(400).json({ error: "Email already exists" }); // agar error hoto ye msg send karo
        }

        // harry code
        // User.create({
        //     name:req.body.name, 
        //     password:req.body.password,
        //     email:req.body.email, 
        // }).then(user => res.json(user))
        // res.json(user);


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

// ROUTE 2: Authenticate a user using: POST "/api/auth/login" . Doesn't require login
router.post('/login', [ // Ye ek standard MERN JWT pattern hai
    body('email', 'Email wrong add ki he').isEmail(),
    body('password', 'Password cannot be blank').exists(),
    ], async (req, res) => {

    // agar errors hon to array me send karo
    const errors = validationResult(req); 
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    } 

    const { email, password } = req.body;

    try{
        let user = await User.findOne({ email});
        if(!user){
            return res.status(400).json({error: "(Email is wrong) please try to login with correctv credential"})
        }

        const comparePassword = await bcrypt.compare(password, user.password);
        if(!comparePassword){
            return res.status(400).json({error: "(Password is wrong) please try to login with correctv credential"});
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json(authToken); 

    } catch (error) { // → agar error aaye to handle karo
        console.error(error.message); // specially errors ke liye use hota hai (debugging ke liye)
        res.status(500).send("Internal server error"); 
    }

})


// ROUTE 3: Get user details using: POST "/api/auth/getuser" . login Required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user =  await User.findById(userId).select("-password"); // password ko exclude karne ke liye select me -password use kia he
        res.json(user);
    
    } catch (error) {
        console.error(error.message); // ye VS code ke terminal me error show karwata he 
        res.status(500).send("Internal server error")
    }
}) 

module.exports = router