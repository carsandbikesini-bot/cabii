// Backend/utils/imageQuality.js

const sharp = require("sharp");

async function evaluateImageQuality(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    let score = 100;

    // 1️⃣ Resolution check
    if (metadata.width < 800 || metadata.height < 600) {
      score -= 30;
    }

    // 2️⃣ Very dark images (basic)
    if (metadata.density && metadata.density < 72) {
      score -= 20;
    }

    return Math.max(score, 0);
  } catch (err) {
    // Agar error aaye toh image ko bad mat bolo
    return 70;
  }
}

module.exports = { evaluateImageQuality };