const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Article = require("../models/article");

router.post("/", auth, async (req, res) => {
  try {
    const articleInfo = {
      title: req.body.article.title,
      description: req.body.article.description,
      body: req.body.article.body,
      tagList: req.body.article.tagList,
    };
    let author = req.user._doc._id;
    const article = await Article.create({ ...articleInfo, author });
    res.send(article);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
