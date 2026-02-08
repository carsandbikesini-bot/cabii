const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name:String,
  mobile:String,
  city:String,
  amount:String,
  source:{ type:String, default:"CABII" },
  createdAt:{ type:Date, default:Date.now }
});

module.exports = mongoose.model("Lead", LeadSchema);