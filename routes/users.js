var express = require("express");
var router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/", async (req, res, next) => {
  try {
    let userInfo = {
      email: req.body.user.email,
      username: req.body.user.username,
      password: req.body.user.password,
    };
    let user = await User.create(userInfo);
    res.send(user);
  } catch (e) {
    next(e);
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
        let token = jwt.sign({ userId: user._id }, "thisismy");
        req.user = { ...user, token };
        res.json({ user, token });
      } else {
        res.status(400).json({ message: "Wrong Password" });
      }
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
