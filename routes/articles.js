const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/", auth, (req, res) => {
  try {
    res.send("done");
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
