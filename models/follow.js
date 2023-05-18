const mongoose = require("mongoose");

const FollowSchema = mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
  followed: { type: mongoose.Schema.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Follow", FollowSchema);
