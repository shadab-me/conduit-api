const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const User = require("../models/user");

router.get("/:username", auth, async (req, res) => {
  try {
    const userName = await req.params.username;
    let userProfile = await User.findOne({ username: userName });
    const logInUser = await User.findById(req.user._doc._id);
    res.status(200).json(profile(userProfile, logInUser));
  } catch (err) {
    console.log(err);
  }
});

router.post("/:username/follow", auth, async (req, res) => {
  try {
    const userName = req.params.username;
    let user = await User.findOne({ username: userName });
    const logInUser = await User.findById(req.user._doc._id);
    if (!user) {
      res.json("Invalid User");
    } else {
      let currentUser = req.user._doc._id;
      if (!user.followers.includes(currentUser)) {
        const currentProfile = await User.findByIdAndUpdate(
          currentUser,
          { $push: { following: user._id } },
          { new: true }
        );
        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              followers: currentUser,
            },
          },
          { new: true }
        );
        res.status(200).json(profile(currentProfile, logInUser));
      } else {
        res.json("Already following");
      }
    }
  } catch (e) {
    res.json(e);
  }
});

function profile(user, currentUser) {
  const isFollowingCurrentUser = currentUser.following.includes(user._id);
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: isFollowingCurrentUser,
    },
  };
}
module.exports = router;
