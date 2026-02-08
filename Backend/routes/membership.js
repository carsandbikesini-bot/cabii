const router = require("express").Router();
const Dealer = require("../models/Dealer");

const PLAN_LEADS = {
  silver: 2,
  gold: 10,
  platinum: 20
};

router.post("/select", async (req, res) => {
  const { dealerId, plan } = req.body;

  if (!PLAN_LEADS[plan]) {
    return res.status(400).json({ success: false });
  }

  // Dealer update
  const dealer = await Dealer.findByIdAndUpdate(
    dealerId,
    {
      plan: plan,
      leadsRemaining: PLAN_LEADS[plan]
    },
    { new: true }
  );

  res.json({
    success: true,
    plan: dealer.plan,
    leadsRemaining: dealer.leadsRemaining
  });
});

module.exports = router;