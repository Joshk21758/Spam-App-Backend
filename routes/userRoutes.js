import express from "express";
import router from express.Router();
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//register route
router.post("/register", async (req, res) => {
  //extract form fields
  const { username, email, password } = req.body;

  try {
    //check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(500).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
   
    //save user to DB
    user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Sucessfully registered user",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to register user" });
  }
});

//login route
router.post("/login", async (req, res) => {
  //Extract form fields
  const { email, password } = req.body;

  try {
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid user email" });
    }

    //compare passwords with hashed passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate json web token
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
    return res.status(200).json({message: "Logged in successfully!", token});

  } catch (err) {
    res.status(500).json({ message: "Failed to Login user" });
  }
});

//Logout route
router.post("/logout", async (req, res) => {
  // destroy jwt 
  res.status(200).json({message: "Logout successful. Delete toekn from client storage"})
  
});

module.exports = router;
