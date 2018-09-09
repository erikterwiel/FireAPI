const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  properties: { type: [{}], required: true },
});

module.exports = mongoose.model("User", userSchema);
