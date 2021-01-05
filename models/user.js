const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 25,
      unique: true,
    },
    bio: {
      type: String,
      default: "bio",
    },
    image: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      require,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId }],
    following: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  let user = this;
  if (user.password) {
    try {
      this.password = await bcrypt.hash(this.password, 8);
      next;
    } catch (e) {
      console.log(e);
    }
  }
});
module.exports = mongoose.model("Users", userSchema);
