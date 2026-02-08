const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==============================
// 🔐 Cars And Bikes In India – CABII
// ==============================

// DATABASE MODEL
const Ad = require("../models/Ad");

// ==============================
// 📁 ENSURE UPLOADS FOLDER EXISTS ✅ FIX
// ==============================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==============================
// 📁 MULTER CONFIG
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// ======================================================
// 🚀 POST AD - MAIN ROUTE
// ======================================================
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const imageFiles = req.files || [];

    if (imageFiles.length < 3) {
      return res.status(400).json({
        success: false,
        message: `Minimum 3 images required (${imageFiles.length} / 3 uploaded)`
      });
    }

    const {
      brand, model, manufacturerYear, Km, owner,
      fuel, transmission, price, description,
      sellername, contactNumber, location, userId
    } = req.body;

    if (!brand || !model || !manufacturerYear || !Km || !owner ||
        !fuel || !transmission || !price ||
        !sellername || !contactNumber || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required. Please login first."
      });
    }

    const imagePaths = imageFiles.map(f => `/uploads/${f.filename}`);

    const vehicleNumber =
      "MOCK_" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const ad = new Ad({
      brand,
      model,
      vehicleNumber,
      fuel,
      transmission,
      manufacturerYear: parseInt(manufacturerYear),
      Km: parseInt(Km),
      owner,
      price: parseInt(price),
      expectedPrice: parseInt(price),
      location,
      sellername,
      contactNumber,
      images: imagePaths,
      rcImages: [],
      imageHashes: [],
      rcVerified: true,
      rcVerificationType: "auto",
      rcVerifiedAt: new Date(),
      description,
      conditionScore: 75,
      guaranteeEligible: false,
      guaranteeStatus: "rejected",
      userId
    });

    await ad.save();

    return res.status(201).json({
      success: true,
      message: "✅ Ad Posted Successfully! Your listing is now live.",
      vehicleNumber,
      adId: ad._id
    });

  } catch (err) {
    console.error("❌ POST /ads error:", err.message);
    res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`
    });
  }
});

// ======================================================
// 🔍 GET ALL ADS
// ======================================================
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).limit(50);
    res.json(ads);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch ads" });
  }
});

// ======================================================
// 🔍 GET SINGLE AD
// ======================================================
router.get("/:id", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }
    res.json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch ad" });
  }
});

// ======================================================
// 🗑️ DELETE AD  ✅ FIX ObjectId COMPARISON
// ======================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    if (String(ad.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own ads"
      });
    }

    await Ad.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "✅ Ad deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================================================
// ✏️ UPDATE AD  ✅ FIX ObjectId COMPARISON
// ======================================================
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    if (String(ad.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own ads"
      });
    }

    Object.assign(ad, req.body);

    if (req.files && req.files.length > 0) {
      ad.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    await ad.save();

    res.json({
      success: true,
      message: "✅ Ad updated successfully",
      ad
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;