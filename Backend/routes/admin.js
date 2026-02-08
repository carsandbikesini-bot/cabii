const express = require("express");
const router = express.Router();
const Ad = require("../models/Ad");

/* ===== ADMIN APPROVE ===== */
router.post("/admin/approve/:id", async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) return res.status(404).json({ error: "Not found" });

  ad.guaranteeStatus = "approved";
  ad.guaranteeEligible = true;
  ad.guaranteeExpiry = new Date(Date.now() + 48*60*60*1000);

  await ad.save();
  res.json({ success: true });
});

/* ===== ADMIN REJECT ===== */
router.post("/admin/reject/:id", async (req, res) => {
  await Ad.findByIdAndUpdate(req.params.id, {
    guaranteeStatus: "rejected",
    guaranteeEligible: false
  });
  res.json({ success: true });
});

module.exports = router;