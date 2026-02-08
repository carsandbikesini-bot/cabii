const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");

// Models
const Ad = require("../models/Ad");

// Utils & Services
const conditionScoreUtil = require("../utils/conditionScore");
const priceEngine = require("../services/pricingEngine");
const sendWhatsApp = require("../utils/sendWhatsApp");
<<<<<<< HEAD
const marketAnalysis = require("../utils/marketAnalysis");
=======

>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
// ===== MULTER CONFIG =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// =====================================================
// ===== MARKET RATE CHECK (NO DELETE – JUST CLEAN) =====
// =====================================================
router.post("/check", async (req, res) => {
  try {
    const { brand, model, year, km, condition, expectedPrice } = req.body;

    if (!brand || !km) {
      return res.status(400).json({
        success: false,
        message: "Brand and KM are required"
      });
    }

    // Existing logic (unchanged)
    const basePrice = 500000;
    let adjustedPrice = basePrice;
    adjustedPrice -= (km * 5);

    const age = new Date().getFullYear() - parseInt(year);
    adjustedPrice -= (age * 50000);

    const conditionMultiplier = {
      "Excellent": 1.15,
      "Good": 1.0,
      "Average": 0.85,
      "Fair": 0.7
    };
    adjustedPrice *= (conditionMultiplier[condition] || 1.0);
    adjustedPrice = Math.max(200000, adjustedPrice);

    const low = Math.round(adjustedPrice * 0.85);
    const fair = Math.round(adjustedPrice);
    const high = Math.round(adjustedPrice * 1.15);

    // 🔥 REAL CONDITION SCORE (SERVER SIDE)
    let scoreValue = 80;
    if (condition === "Excellent") scoreValue = 90;
    if (condition === "Good") scoreValue = 80;
    if (condition === "Average") scoreValue = 65;
    if (condition === "Fair") scoreValue = 50;

    if (km > 80000) scoreValue -= 10;
    if (km > 120000) scoreValue -= 15;
    if (age > 8) scoreValue -= 10;
    if (age > 12) scoreValue -= 15;

    scoreValue = Math.max(40, Math.min(95, scoreValue));

    const eligible =
      expectedPrice >= low &&
      expectedPrice <= high &&
      scoreValue >= 65;

    res.json({
      success: true,
      low,
      fair,
      high,
      conditionScore: scoreValue,
      eligible
    });

  } catch (err) {
    console.error("❌ Market check error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =====================================================
// ===== SUBMIT 48H GUARANTEE (UPDATED – NO DELETE) =====
// =====================================================
router.post("/submit", upload.array("images", 20), async (req, res) => {
  try {
<<<<<<< HEAD
    // 🔐 SELL48 PAYMENT LOCK (MANDATORY)
const { paymentId, paymentAmount } = req.body;

if (!paymentId || Number(paymentAmount) !== 49) {
  return res.status(403).json({
    success: false,
    message: "SELL48 requires ₹49 payment. Access denied."
  });
}
=======
>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
    const {
      brand,
      model,
      year,
      km,
      fuel,
      transmission,
      condition,
      description,
      sellerName,
      phone,
      city,
      expectedPrice,
      vehicleNumber,
      conditionScore,
      guaranteeEligible
    } = req.body;
<<<<<<< HEAD
// 🔐 SELL48 PAYMENT VALIDATION (SERVER SIDE HARD LOCK)
if (req.body.adType === "SELL48") {
  if (!req.body.paymentId || Number(req.body.paymentAmount) !== 49) {
    return res.status(403).json({
      success: false,
      message: "₹49 payment required for Sell in 48H Guaranteed Deal"
    });
  }
}
=======

>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
    if (!brand || !phone || !sellerName || !km) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!phone.match(/^[0-9]{10}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    const imageFiles = req.files || [];
    if (imageFiles.length < 9) {
      return res.status(400).json({
        success: false,
        message: `Minimum 9 photos required (${imageFiles.length} uploaded)`
      });
    }

    const imagePaths = imageFiles.map(f => `/uploads/${f.filename}`);
<<<<<<< HEAD
    // 🔍 REAL MARKET ANALYSIS (SERVER SIDE – FINAL)
const analysis = marketAnalysis({
  year: Number(year),
  km: Number(km),
  condition,
  fuel,
  expectedPrice: Number(expectedPrice)
});

    // 🔥 FINAL GUARANTEE FLAG (SERVER SIDE SAFE)
   const isGuaranteed = analysis.chance !== "LOW";
=======

    // 🔥 FINAL GUARANTEE FLAG (SERVER SIDE SAFE)
    const isGuaranteed =
      guaranteeEligible === "true" &&
      Number(conditionScore) >= 65;

>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
    const ad = new Ad({
      brand,
      model,
      vehicleNumber: vehicleNumber || "GUARANTEE_" + Math.random().toString(36).substr(2, 9),
      fuel,
      transmission,
      manufacturerYear: parseInt(year),
      Km: parseInt(km),
      owner: sellerName,
      price: parseInt(expectedPrice || 500000),
      expectedPrice: parseInt(expectedPrice || 500000),
      location: city || "Mumbai",
      sellername: sellerName,
      contactNumber: phone,
      images: imagePaths,
      description,

<<<<<<< HEAD
      // 🔥 FINAL GUARANTEE FLAGS (ANALYSIS DRIVEN)
conditionScore: analysis.score,
guaranteeEligible: analysis.chance !== "LOW",
guaranteeStatus: analysis.chance === "LOW" ? "review" : "approved",
guaranteeExpiry: analysis.chance !== "LOW"
  ? new Date(Date.now() + 48 * 60 * 60 * 1000)
  : null,
=======
      // 🔥 NEW IMPORTANT FLAGS (ADDED)
      conditionScore: Number(conditionScore),
      guaranteeEligible: isGuaranteed,
      guaranteeStatus: isGuaranteed ? "approved" : "review",
      guaranteeExpiry: isGuaranteed
        ? new Date(Date.now() + 48 * 60 * 60 * 1000)
        : null,

>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
      rcVerified: true,
      rcVerificationType: "guarantee"
    });

    const savedAd = await ad.save();

    // 🔥 WHATSAPP ONLY FOR ELIGIBLE ADS
    if (isGuaranteed) {
      sendWhatsApp(
        "ALL_DEALERS",
        `🔥 48H GUARANTEED DEAL 🔥
${brand} ${model}
💰 Price: ₹${expectedPrice}
📍 City: ${city || "NA"}
⭐ Score: ${conditionScore}
📞 Seller: ${phone}`
      );
    }

    res.json({
      success: true,
      message: isGuaranteed
        ? "✅ Approved for 48H Guaranteed Sell!"
        : "⏳ Submitted – Under Review",
      sellerId: savedAd._id,
      adId: savedAd._id,
      expiresAt: savedAd.guaranteeExpiry,
      dealerNotified: isGuaranteed
    });

  } catch (err) {
    console.error("❌ Sell48 submit error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to submit"
    });
  }
});

// ===== GET SELL48 STATUS (UNCHANGED) =====
router.get("/:id", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }

    const now = new Date();
    const expired = ad.guaranteeExpiry ? now > ad.guaranteeExpiry : false;
    const remainingTime = ad.guaranteeExpiry ? ad.guaranteeExpiry - now : 0;

    res.json({
      success: true,
      ad,
      expired,
      remainingMs: remainingTime,
      status: expired ? "EXPIRED" : "ACTIVE"
    });

  } catch (err) {
    console.error("❌ GET sell48 error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;