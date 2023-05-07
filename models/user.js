const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  nick: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: String,
  active: String,
  avatar: String
});

module.exports = mongoose.model("User", UserSchema);
