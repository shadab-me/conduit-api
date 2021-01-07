const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res, next) => {
  try {
    let userInfo = {
      email: req.body.user.email,
      username: req.body.user.username,
      password: req.body.user.password,
    };
    let user = await User.create(userInfo);
    res.status(201).send(formatUser(user));
  } catch (err) {
    next(err);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const userInfo = {
      email: req.body.user.email,
      password: req.body.user.password,
    };

    let user = await User.findOne({ email: userInfo.email });
    if (!user)
      return res.status(400).json({ message: "User is Not Register." });
    if (user) {
      let result = await bcrypt.compare(userInfo.password, user.password);
      if (result) {
        let token = jwt.sign({ userId: user._id }, process.env.KEY);
        req.user = { ...user, token };
        res.json(formatUser(user, token));
      } else {
        res.status(400).json({ message: "Wrong Password" });
      }
    }
  } catch (e) {
    next(e);
  }
});
function formatUser(user, token) {
  return {
    user: {
      email: user.email,
      token: token,
      username: user.username,
      bio: user.bio,
      image: user.image,
    },
  };
}

module.exports = router;
