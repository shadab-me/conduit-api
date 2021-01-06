const express = require("express");
const router = express.Router();
const Article = require("../models/article");

router.get("/", async (req, res) => {
  const articles = await Article.find({});
  let tags = [];
  articles.forEach((article) =>
    article.tagList.forEach((tag) => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    })
  );
  res.json(tags);
});
module.exports = router;
