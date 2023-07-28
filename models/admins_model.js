const mongoose = require("mongoose");

var adminModel = mongoose.Schema({
  id: String,
  date_added: String,
  added_by: String,
});

var adminSchema = mongoose.model("admins", adminModel);

module.exports = adminSchema;
