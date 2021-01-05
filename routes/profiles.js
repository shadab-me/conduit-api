const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/:username", async (req, res) => {
  try {
    const userName = await req.params.username;
    let profile = await User.find({ username: userName });
    res.send({ profile });
  } catch (e) {
    console.log(e);
  }
});
router.post("/:username/follow", (req, res) => {});

module.exports = router;
