const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Article = require("../models/article");
const slug = require("slug");
const Comment = require("../models/comment");

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
router.delete("/:slug", auth, async (req, res) => {
  try {
    const slug = req.params.slug;
    const article = await Article.findOneAndDelete({ slug: slug });
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

// localhost:3000/articles/5ff586ab53de7837841037e4/comment
router.get("/:slug/comments", auth, async (req, res) => {
  try {
    const currentSlug = req.params.slug;
    const article = await Article.findOne({ slug: currentSlug })
      .populate("comments")
      .exec();
    const comments = await article.comments;
    res.json({ comments });
  } catch (e) {
    console.log(e);
  }
});
router.post("/:slug/comment", auth, async (req, res) => {
  try {
    let currentSlug = req.params.slug;
    const comment = await Comment.create({
      body: req.body.comment.body,
      author: req.user._doc._id,
    });
    console.log(comment);
    const article = await Article.findOneAndUpdate(
      { slug: currentSlug },
      { $push: { comments: comment._id } },
      { new: true }
    );
    res.send(article);
  } catch (e) {
    console.log(e);
  }
});

router.delete("/:slug/comments/:id", async (req, res) => {
  const userSlug = req.params.slug;
  const commentId = req.params.id;
  const article = Article.findOne({ slug: userSlug });
  const comment = Comment.findByIdAndDelete(commentId);
  res.json(comment);
});

module.exports = router;
