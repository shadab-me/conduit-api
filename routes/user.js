const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

router.get("/", auth, (req, res) => {
  const user = {
    email: req.user._doc.email,
    token: req.user.token,
    username: req.user._doc.username,
    bio: req.user._doc.bio,
    image: req.user._doc.image,
  };
  res.json({ user });
});

router.post("/", auth, async (req, res) => {
  try {
    const newUserInfo = {
      email: req.body.user.email,
      bio: req.body.user.bio,
      image: req.body.user.image,
    };
    let user = await User.findByIdAndUpdate(req.user._doc._id, newUserInfo, {
      new: true,
    });
    res.status(200).send({ user });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
