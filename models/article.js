const mongoose = require("mongoose");
const articleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    body: {
      type: String,
    },
    tagList: [{ type: String }],
    favorites: {
      type: Boolean,
    },
    favoritesCount: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    comments: [{ type: String, ref: "Comments" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Articles", articleSchema);
