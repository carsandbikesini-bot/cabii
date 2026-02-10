const express = require("express");
const multer = require("multer");
const { getVehicleData } = require("../services/rto.service");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/detect-plate", upload.single("image"), async (req, res) => {

  // 🔥 TEMP OCR RESULT (demo)
  const detectedNumber = ""

  const rto = await getVehicleData(detectedNumber);

  if (!rto) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    vehicleNumber: detectedNumber,
    rto
  });
});

module.exports = router;