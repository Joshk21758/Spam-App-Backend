import express from "express";
import router from express.Router();
import User from "../models/User";

//register route
router.post("/register", async (req, res) => {
  //extract form fields
  const { username, email, password } = req.body;

  try {
    //check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    //save user to DB
    user = await User.create({
      username,
      email,
      password,
    });

    //log user in by setting session
    req.session.userId = user._id;
    return res.status(200).json({
      message: "Sucessfully registered user",
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to register user" });
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
      return res.status(400).json({ message: "You don't have an Account" });
    }

    //compare passwords with hashed passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Passwords do not match" });
    }

    //Login user by setting session
    req.session.userId = user._id;
    res.json({
      id: user._id,
      email: user.email,
      message: "Successfully Logged in",
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to Login user" });
  }
});

//Logout route
router.post("/logout", async (req, res) => {
  //destroy the session data in DB
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ message: "Failed to logout" });
    }

    //logout user by clearing session cookie
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
