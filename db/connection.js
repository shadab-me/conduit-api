const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://shadabali604:mahirali@cluster0.ih34c.mongodb.net/test",
  { useNewUrlParser: true },
  (err) => {
    if (err) console.log(err);
    else console.log("connected..");
  }
);
