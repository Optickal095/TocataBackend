const mongoose = require("mongoose");

const PublicationSchema = mongoose.Schema({
  text: String,
  file: String,
  created_at: Date,
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Publication", PublicationSchema);
