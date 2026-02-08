const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Dealer = require("../models/Dealer");

/* ================= DEALER LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const dealer = await Dealer.findOne({ email });
    if (!dealer) {
      return res.json({ success: false, message: "Dealer not found" });
    }

    if (!dealer.membershipActive) {
      return res.json({
        success: false,
        message: "Membership inactive"
      });
    }

    const ok = await bcrypt.compare(password, dealer.password);
    if (!ok) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // ✅ SESSION SET
    req.session.dealerId = dealer._id.toString();

    res.json({
      success: true,
      dealerId: dealer._id,
      name: dealer.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= DEALER SESSION CHECK ================= */
router.get("/check-session", (req, res) => {
  if (req.session.dealerId) {
    return res.json({
      loggedIn: true,
      dealerId: req.session.dealerId
    });
  }
  res.status(401).json({ loggedIn: false });
});

/* ================= DEALER LOGOUT ================= */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("cabii_sid");
    res.json({ success: true });
  });
});

module.exports = router;