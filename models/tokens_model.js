const mongoose = require("mongoose");

var tokenModel = mongoose.Schema({
  token: String,
  boosts_used: Number,
  boost_type: String,
  isUsed: Boolean,
  serverId: String,
  serverName: String,
  date_added: Date,
  error_count: Number,
  email: String,
  password: String,
});

var tokenSchema = mongoose.model("tokens", tokenModel);

module.exports = tokenSchema;
