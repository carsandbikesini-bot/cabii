// Backend/services/imageDamageAnalyzer.js

/**
 * Analyze uploaded car images and return damage score
 * @param {Array} images - uploaded image file paths
 */
function analyzeImages(images = []) {
  let score = 100;

  // 🔹 Rule 1: Minimum photos check
  if (images.length < 2) {
    score -= 40;
  }

  if (images.length >= 4) {
    score += 5; // bonus for full coverage
  }

  // 🔹 Rule 2: Placeholder logic (AI later plug hoga)
  // Abhi random simulation (production me AI replace hoga)
  if (images.length >= 1) {
    score -= Math.floor(Math.random() * 25);
  }

  // 🔹 Clamp score
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}

/**
 * Decide guarantee & trust badge
 */
function evaluateTrust(images) {
  const damageScore = analyzeImages(images);

  let guaranteeStatus = "rejected";
  let trustBadge = "red";

  if (damageScore < 60) {
    guaranteeStatus = "rejected";
    trustBadge = "red";
  } else if (damageScore < 80) {
    guaranteeStatus = "conditional";
    trustBadge = "yellow";
  } else {
    guaranteeStatus = "approved";
    trustBadge = "green";
  }

  return {
    damageScore,
    guaranteeStatus,
    trustBadge,
  };
}

module.exports = {
  analyzeImages,
  evaluateTrust,
};