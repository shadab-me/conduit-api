const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentSchema);
