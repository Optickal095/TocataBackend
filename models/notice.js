const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const NoticeSchema = mongoose.Schema({
  title: String,
  text: String,
  created_at: String,
  date: String,
  region: String,
  city: String,
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
});

NoticeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Notice", NoticeSchema);
