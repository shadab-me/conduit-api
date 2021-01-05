const express = require("express");
const auth = require("../middleware/auth");
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
router.post("/:username/follow", auth, async (req, res) => {
  try {
    const userName = req.params.username;
    let user = await User.findOne({ username: userName });
    if (!user) {
      res.json("Invalid User");
    } else {
      let currentUser = req.user._doc._id;
      if (!user.followers.includes(currentUser)) {
        const f = await User.findByIdAndUpdate(
          currentUser,
          { $push: { following: user._id } },
          { new: true }
        );
        const u = await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              followers: currentUser,
            },
          },
          { new: true }
        );
        res.json(f);
      } else {
        res.json("Already following");
      }
    }
  } catch (e) {
    res.json(e);
  }
});

module.exports = router;
