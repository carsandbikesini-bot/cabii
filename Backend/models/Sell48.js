const mongoose = require("mongoose");

const Sell48Schema = new mongoose.Schema({
  userId: { type: String, required: true },

  vehicleType: String,
  brand: String,
  model: String,
  year: Number,
  city: String,

  expectedPrice: Number,
  approvedPrice: Number,

  fuel: String,
  transmission: String,

  description: String,

  rcImages: [String],

  status: {
    type: String,
    default: "PENDING_RC" 
    // PENDING_RC | APPROVED | REJECTED | SOLD
  },

  guaranteeExpiry: Date,

}, { timestamps: true });

module.exports = mongoose.model("Sell48", Sell48Schema);