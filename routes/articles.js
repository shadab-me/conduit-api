const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Article = require("../models/article");
const slug = require("slug");

router.get("/", async (req, res) => {
  try {
    let articles = await Article.find({})
      .populate("author", ["username", "bio", "image", "following"])
      .exec();
    res.json({ articles });
  } catch (e) {
    console.log(e);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    let slugDes = slug(req.body.article.title, {
      replacement: "-",
      lower: true,
    });

    const articleInfo = {
      slug: slugDes,
      title: req.body.article.title,
      description: req.body.article.description,
      body: req.body.article.body,
      tagList: req.body.article.tagList,
    };
    console.log(articleInfo);
    let author = req.user._doc._id;
    const article = await (await Article.create({ ...articleInfo, author }))
      .populate("author", ["username", "bio", "image", "following"])
      .execPopulate();
    res.send({ article });
  } catch (e) {
    res.send(e);
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const article = await Article.findByIdAndDelete(id);
    res.send(article);
    console.log(article);
  } catch (e) {
    console.log(e);
  }
});

router.put("/:id", auth, async (req, res) => {
  const id = req.params.id;
  const article = await Article.findByIdAndUpdate(id, req.body, { new: true });
  res.json({ article });
});
module.exports = router;
