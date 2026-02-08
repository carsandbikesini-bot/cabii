const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    manufacturerYear: { type: Number, required: true },
    owner: { type: String, required: true },
    fuel: { type: String, required: true },
    transmission: { type: String, required: true },
    km: { type: Number, required: true },
    price: { type: Number, required: true },          // ✅ Price field added
    city: { type: String, required: true },          // ✅ City field added
    description: { type: String, required: true },
    images: [String],                                // ✅ Multiple images
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    membershipPlan: { type: String, default: "Free" } // ✅ Membership: Free/Premium/Featured
  },
  { timestamps: true } // createdAt & updatedAt automatically
);

module.exports = mongoose.model("Ad", adSchema);