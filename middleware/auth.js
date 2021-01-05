const jwt = require("jsonwebtoken");
const User = require("../models/user");
async function auth(req, res, next) {
  try {
    let token = await req.header("Authorization").replace("Bearer", "");
    let decode = await jwt.decode(token, "thisismy");
    let user = await User.findById(decode.userId);
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
  }
}
module.exports = auth;
