const express = require("express");
const multer = require("multer");
const path = require("path");

const detectNumberPlate = require("../utils/numberPlateDetect");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/detect-plate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = path.join(__dirname, "..", req.file.path);

    const plate = await detectNumberPlate(imagePath);

    if (!plate || plate === "OCR_PENDING") {
      return res.json({
        vehicleNumber: null,
        description: null
      });
    }

    // ✅ AUTO DESCRIPTION
    const description = `Well maintained vehicle with number ${plate}. Single owner driven. All documents clear. Ready for immediate sale.`;

    res.json({
      vehicleNumber: plate,
      description
    });

  } catch (err) {
    console.error("Plate detect error:", err);
    res.status(500).json({ message: "Detection failed" });
  }
});

module.exports = router;