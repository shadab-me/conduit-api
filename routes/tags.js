const express = require("express");
const router = express.Router();
const Article = require("../models/article");

router.get("/", async (req, res, next) => {
  try {
    const tags = await Article.distinct("tagList");
    res.json({ tags });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
