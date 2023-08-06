const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const UserSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  nick: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  description: String,
  role: String,
  active: Boolean,
  avatar: String,
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", UserSchema);
