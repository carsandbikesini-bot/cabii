const express = require("express");
const router = express.Router();
const Ad = require("../models/Ad");
const Dealer = require("../models/Dealer");

/* 🔐 Dealer auth middleware */
function isDealer(req, res, next) {
  if (req.session?.dealerId) {
    req.dealerId = req.session.dealerId;
    return next();
  }
  return res.status(401).json({ success: false, message: "Dealer login required" });
}

/* 🔥 LIVE 48H GUARANTEED ADS */
router.get("/live-ads", isDealer, async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealerId);
    if (!dealer || !dealer.membershipActive) {
      return res.json({ success: false, message: "Membership inactive" });
    }

    const now = new Date();

    const ads = await Ad.find({
      guaranteeEligible: true,
      guaranteeExpiry: { $gt: now }
    }).sort({ createdAt: -1 });

    res.json({ success: true, ads });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;