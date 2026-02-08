const express = require("express");
const router = express.Router();

/* ================= MARKET RATE API ================= */
router.post("/check", (req, res) => {
  const { year, fuel, expectedPrice } = req.body;

  if (!year || !fuel || !expectedPrice) {
    return res.status(400).json({ message: "Missing data" });
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - Number(year);

  /* BASE PRICE */
  const basePrices = {
    Petrol: 1000000,
    Diesel: 1150000,
    CNG: 900000,
    Electric: 1200000
  };

  const fuelWeight = {
    Petrol: 1,
    Diesel: 1.05,
    CNG: 0.9,
    Electric: 1.1
  };

  let depreciation = 0;
  if (age <= 1) depreciation = 0.10;
  else if (age <= 3) depreciation = 0.20;
  else if (age <= 5) depreciation = 0.35;
  else if (age <= 7) depreciation = 0.50;
  else depreciation = 0.65;

  const base = basePrices[fuel] || 1000000;
  const marketPrice = Math.round(
    base * (1 - depreciation) * (fuelWeight[fuel] || 1)
  );

  let range = "FAIR";
  if (expectedPrice < marketPrice * 0.9) range = "LOW";
  else if (expectedPrice > marketPrice * 1.1) range = "HIGH";

  res.json({
    marketPrice,
    range,
    min: Math.round(marketPrice * 0.9),
    max: Math.round(marketPrice * 1.1)
  });
});

module.exports = router;