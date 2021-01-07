const jwt = require("jsonwebtoken");
const User = require("../models/user");
async function auth(req, res, next) {
  try {
    let token = await req.header("Authorization").replace("Bearer", "");
    let decode = await jwt.decode(token, process.env.KEY);
    let user = await User.findById(decode.userId);
    if (!user) {
      throw new Error();
    }
    req.user = { ...user, token };
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
}
module.exports = auth;
