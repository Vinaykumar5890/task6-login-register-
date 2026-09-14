const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const connectDB = require("./config/db.js");

const User = require("./models/User.js")

const path = require("path");

const middleware = require("./middleware/authMiddleware.js");

dotenv.config();



const app = express();



app.use(express.json());



app.use(cors({

    origin: "*"

}));



// Connect MongoDB

connectDB();



app.get('/users',middleware,async (req, res) => {

    try {

        const users = await User.find();

        if (!users) {

            return res.status(404).json({ message: 'No users found' });

        }

        res.json(users);

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

});

app.post('/register', async(req,res)=>{

    const { username, email, password } = req.body;

    try{

        const existingUser = await User.findOne({ email });

        if(existingUser){

            return res.status(400).json({ message: "User already exists" });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({

            username,

            email,

            password: hashedPassword

        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    }

    catch(err){

        res.status(500).json({ message: err.message });

    }

})



app.post('/login', async(req,res)=>{

    const { email, password } = req.body;

    try{

        const user = await User.findOne({ email });

        if(!user){

            return res.status(400).json({ message: "Invalid credentials" });

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){

            return res.status(400).json({ message: "Invalid credentials" });

        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });

    }

    catch(err){

        res.status(500).json({ message: err.message });

    }

})



// Start server

const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

}); 