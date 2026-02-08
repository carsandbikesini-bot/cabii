module.exports = function analyzeImageQuality(meta) {
  let score = 100;
  let issues = [];

  if (meta.blur > 0.6) {
    score -= 40;
    issues.push("blur");
  }

  if (meta.brightness < 0.4) {
    score -= 20;
    issues.push("low_light");
  }

  if (meta.contrast < 0.5) {
    score -= 15;
    issues.push("low_contrast");
  }

  return {
    qualityScore: score,
    issues,
    acceptable: score >= 50
  };
};