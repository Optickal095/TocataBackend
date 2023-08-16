const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const PublicationSchema = mongoose.Schema({
  text: String,
  file: String,
  audio: String,
  created_at: String,
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
});

PublicationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Publication", PublicationSchema);
