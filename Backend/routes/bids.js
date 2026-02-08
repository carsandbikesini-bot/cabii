const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");

/*
  AUTH RULES:
  - req.session.dealerId  => dealer logged in
  - req.session.userId    => seller/user logged in
*/

// ===============================
// 🔐 AUTH MIDDLEWARE (LOCAL)
// ===============================
function isDealerLoggedIn(req, res, next) {
  if (req.session && req.session.dealerId) {
    req.dealerId = req.session.dealerId;
    return next();
  }
  return res.status(401).json({
    success: false,
    message: "Dealer login required"
  });
}

function isUserLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    return next();
  }
  return res.status(401).json({
    success: false,
    message: "User login required"
  });
}

// ===============================
// 🧾 DEALER → PLACE BID
// ===============================

router.post(
  "/bids",
  isDealerLoggedIn,
  bidController.placeBid
);

// ===============================
// 📊 SELLER → VIEW BIDS FOR AD
// ===============================
router.get("/bids/:adId", isUserLoggedIn, bidController.getBidsForAd);

// ===============================
// ✅ SELLER → ACCEPT BID
// ===============================
router.post("/bids/accept/:bidId", isUserLoggedIn, bidController.acceptBid);

// ===============================
// ❌ SELLER → REJECT BID
// ===============================
router.post("/bids/reject/:bidId", isUserLoggedIn, bidController.rejectBid);

module.exports = router;