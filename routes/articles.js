const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Article = require("../models/article");
const slug = require("slug");
const Comment = require("../models/comment");
const User = require("../models/user");
const article = require("../models/article");

router.get("/", async (req, res, next) => {
  let query = {};
  const limitArticle = req.query.limit || 20;
  const offset = req.query.offset || 0;
  try {
    if (req.query.tag) {
      if (req.query.tag.split(",").length > 1) {
        query["tagList"] = {
          $in: req.query.tag.split(",").map((tag) => tag.toLowerCase()),
        };
      } else {
        query["tagList"] = req.query.tag;
      }
    }
    if (req.query.author) {
      const author = await User.findOne({ username: req.query.author });
      if (author) {
        query["author"] = author.id;
      } else {
        throw new Error("Result Not Found");
      }
    }
    if (req.query.favorited) {
      const author = await User.findOne({ username: req.query.favorited });
      query["favorites"] = author.id;
    }

    const articles = await Article.find(query)
      .sort({ createdAt: "desc" })
      .skip(+offset)
      .limit(+limitArticle)
      .populate("author");
    res
      .status(200)
      .type("application/json")
      .json({
        articles: articles.map((article) =>
          articleGenerator(article, article.author, req.userID)
        ),
      });
  } catch (error) {
    next({ message: "Result Not Found", error, status: 404 });
  }
});

router.get("/feed", auth, async (req, res, next) => {
  const limit = req.query.limit;
  const skip = req.query.offset;
  try {
    const user = req.user._doc;
    const userFeed = await Article.find({})
      .where("author")
      .in([...user.followings, user._id])
      .sort({ createdAt: "desc" })
      .skip(+offset)
      .limit(+limitArticle)
      .populate("author");
    res.status(200).json({
      articles: userFeed.map((article) =>
        formatArticle(article, article.author, user.id)
      ),
    });
  } catch (err) {
    next(err);
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
    res.status(201).send({ article });
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
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "Users",
        },
      })
      .exec();
    res.json(article);
  } catch (e) {
    console.log(e);
  }
});

router.post("/:slug/comment", auth, async (req, res) => {
  try {
    let currentSlug = req.params.slug;
    let comment = await (
      await Comment.create({
        body: req.body.comment.body,
        author: req.user._doc._id,
      })
    ).execPopulate("author");

    const article = await Article.findOneAndUpdate(
      { slug: currentSlug },
      { $push: { comments: comment._id } },
      { new: true }
    );
    const currentUser = await User.findById(req.user._doc._id);
    res.status(201).json(formatComment(comment, comment.author, currentUser));
  } catch (e) {
    console.log(e);
  }
});

router.delete("/:slug/comments/:id", auth, async (req, res, next) => {
  try {
    const userSlug = req.params.slug;
    const commentId = req.params.id;
    const commentData = Comment.findById(commentId);

    if (commentData.author == req.user._doc._id) {
      const article = await Article.findOneAndUpdate(
        { slug: userSlug },
        { $pull: { comments: commentId } },
        { new: true }
      );
      const comment = await Comment.findByIdAndDelete(commentId);
      if (!comment) return res.status(404).send("Invalid Request");
      res.status(200).json("Comment Deleted Successfully..");
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:slug/favorite", auth, async (req, res, next) => {
  const slug = req.params.slug;
  const article = await Article.findOne({ slug: slug });
  if (!article) return next({ message: "Article is Not Found" });
  const currentUser = await User.findByIdAndUpdate(req.user._doc._id, {
    $addToSet: { favorites: article._id },
  });
  const updateArticle = await Article.findByIdAndUpdate(
    article._id,
    {
      $inc: { favoritesCount: 1 },
    },
    { new: true }
  );
  res.json(updateArticle);
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
  const isLoggedUserIsFollowing = author.followings.includes(loggedUserID);
  //const isLoggedUserIsFollower = author.followers.includes(loggedUserID);
  const isFavoriteByUser = author.favorites.includes(article.id);
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited: isFavoriteByUser,
    favoritesCount: article.favoritesCount,
    author: {
      username: author.username,
      bio: author.bio,
      image: author.image,
      following: isLoggedUserIsFollowing,
    },
  };
}

function formatComment(comment, author, currentUser = null) {
  const isCurrentUserFollowing = currentUser.following.includes(author._id);
  return {
    id: comment.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: {
      username: author.name,
      bio: author.bio,
      image: author.image,
      following: isCurrentUserFollowing,
    },
  };
}
module.exports = router;
