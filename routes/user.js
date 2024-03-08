const express = require("express");
const router = express.Router();

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dubqn2x9j",
  api_key: "474378529513631",
  api_secret: "8TOyIUoTNCYSlkUIPLHWWNtFj84",
});

const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/user/signup", async (req, res) => {
  try {
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.password ||
      typeof req.body.username !== "string" ||
      typeof req.body.email !== "string"
    ) {
      return res.status(400).json({ message: "Missing parameters" });
    }
    const findUserExist = await User.findOne({ email: req.body.email });
    if (findUserExist) {
      return res.json({ message: "Email already exist" });
    }
    const password = req.body.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);
    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsLetter: req.body.newsLetter,
      token: token,
      hash: hash,
      salt: salt,
    });
    await newUser.save();
    res.status(201).json({
      _id: newUser.id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ message: "User not find" });
    }
    const newHash = SHA256(req.body.password + user.salt).toString(encBase64);
    if (user.hash !== newHash) {
      return res.json({ message: "bad email or password" });
    }
    res.status(201).json({
      _id: user.id,
      token: user.token,
      account: {
        username: user.account.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
