const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Article = require("../models/article");
const slug = require("slug");
const Comment = require("../models/comment");
const user = require("../models/user");
const article = require("../models/article");

router.get("/", async (req, res, next) => {
  let limit = 10;
  const query = req.query;
  try {
    const articles = await Article.find({}).populate("author");
    res.status(200).json({
      articles: articles.map((article) =>
        formatArticle(article, article.author)
      ),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/feed", auth, async (req, res, next) => {
  const limit = req.query.limit;
  const skip = req.query.offset;
  try {
    const articles = await Article.find({ author: req.user._doc._id })
      .sort({ createdAt: "desc" })
      .skip(+skip)
      .limit(+limit)
      .populate("author");
    res.status(200).json({
      articles: articles.map((article) =>
        formatArticle(article, article.author)
      ),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", auth, async (req, res, next) => {
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
    let author = req.user._doc._id;
    const article = await (
      await Article.create({ ...articleInfo, author })
    ).execPopulate("author", ["username", "bio", "image", "following"]);
    res.status(201).send(formatArticle(article, article.author));
  } catch (e) {
    next(e);
  }
});
router.delete("/:slug", auth, async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const article = await Article.findOneAndDelete({ slug: slug });
    res.status(200).json(formatArticle(article));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const article = await Article.findById(id);
    if (article.author == req.user._doc.id) {
      const art = await Article.findByIdAndUpdate(id, req.body);
      res.status(200).json(formatArticle(article));
    }
  } catch (e) {
    next(e);
  }
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
    if (comment._id) {
      const article = await Article.findOneAndUpdate(
        { slug: currentSlug },
        { $push: { comments: comment._id } },
        { new: true }
      );
      res.status(200).json(formatArticle(article));
    }
  } catch (e) {
    console.log(e);
  }
});

router.delete("/:slug/comments/:id", auth, async (req, res) => {
  try {
    const userSlug = req.params.slug;
    const commentId = req.params.id;
    const article = await Article.findOneAndUpdate(
      { slug: userSlug },
      { $pull: { comments: commentId } },
      { new: true }
    );
    const comment = await Comment.findByIdAndDelete(commentId);
    console.log(article);
    res.json(comment);
  } catch (e) {
    console.log(e);
  }
});

router.post("/:slug/favorite", auth, async (req, res) => {
  const slug = req.params.slug;
  const article = await Article.findOne({ slug: slug });
  const currentUser = User.findByIdAndUpdate(req.user._doc._id, {
    $push: { favorites: article._id },
  });
  res.json(article);
});

router.delete("/:slug/favorite", auth, async (req, res) => {
  const slug = req.params.slug;
  const article = await Article.findOne({ slug: slug });
  const currentUser = User.findByIdAndUpdate(req.user._doc._id, {
    $pull: { favorites: article._id },
  });
  res.json(article);
});

function formatArticle(article, author, loggedUserID = null) {
  //const isLoggedUserIsFollowing = author.followings.includes(loggedUserID);
  //const isLoggedUserIsFollower = author.followers.includes(loggedUserID);
  // const isFavoritesByUser = author.favorites.includes(article.id);
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: {
      username: author.username,
      bio: author.bio,
      image: author.image,
    },
  };
}
module.exports = router;
