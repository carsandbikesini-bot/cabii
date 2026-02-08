// Backend/utils/numberPlateDetect.js

console.log("PLATE KEY =", process.env.PLATE_RECOGNIZER_API_KEY);

const axios = require("axios");
const fs = require("fs");

const PLATE_API_KEY = process.env.PLATE_RECOGNIZER_API_KEY;

async function detectNumberPlate(imagePath) {
  try {
    // ==============================
    // 🔐 API KEY CHECK
    // ==============================
    if (!PLATE_API_KEY) {
      console.error("❌ Plate Recognizer API key missing");
      return "OCR_PENDING";
    }

    // ==============================
    // 📸 IMAGE FILE CHECK
    // ==============================
    if (!fs.existsSync(imagePath)) {
      console.error("❌ Image not found:", imagePath);
      return "OCR_PENDING";
    }

    // ==============================
    // 🧠 READ IMAGE
    // ==============================
    const imageBase64 = fs.readFileSync(imagePath, {
      encoding: "base64",
    });

    // ==============================
    // 🚀 PLATE RECOGNIZER API
    // ==============================
    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      {
        upload: imageBase64,
        regions: ["in"], // 🇮🇳 India
      },
      {
        headers: {
          Authorization: `Token ${PLATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 40000, // 40 sec (slow internet safe)
      }
    );

    // ==============================
    // ✅ SUCCESS RESULT
    // ==============================
    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const best = response.data.results[0];
      if (best.plate) {
        let plate = best.plate.toUpperCase();

// 🇮🇳 INDIA STATE CODE FIX
// MI → MH common OCR mistake
if (plate.startsWith("MI")) {
  plate = plate.replace(/^MI/, "MH");
}

// Extra cleanup
plate = plate.replace(/[^A-Z0-9]/g, "");

return plate;
      }
    }

    // ==============================
    // ⚠️ NO PLATE FOUND
    // ==============================
    return "OCR_PENDING";

  } catch (err) {
    // ==============================
    // 🚨 OCR ERROR (TIMEOUT / NETWORK)
    // ==============================
    console.error("🚨 Plate Recognizer ERROR:");
    console.error(err.response?.data || err.message);

    // IMPORTANT RULE:
    // OCR FAIL ≠ IMAGE FAIL
    // User trust should not break
    return "OCR_PENDING";
  }
}

module.exports = detectNumberPlate;