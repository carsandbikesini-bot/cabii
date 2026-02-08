// backend/routes/membership.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Mongoose User model
const { isLoggedIn } = require('../middleware/auth'); // middleware to check session

// Subscribe / Membership API
router.post('/subscribe', isLoggedIn, async (req, res) => {
  const { plan } = req.body; // plan: "basic" | "premium" | "elite"

  try {
    // Update user's membership and optionally verify user for premium/elite plans
    const updateData = { membershipPlan: plan };
    if (plan === "premium" || plan === "elite") {
      updateData.verified = true;
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    res.json({ success: true, message: `Subscribed to ${plan} plan successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Subscription failed." });
  }
});

module.exports = router;