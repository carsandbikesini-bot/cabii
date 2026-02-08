module.exports = function trustScore(data) {
  let score = 0;
  if (data.plateDetected) score += 25;
  if (data.rtoVerified) score += 20;
  if (data.imageCount >= 4) score += 20;
  if (data.exifValid) score += 15;
  if (data.rcVerified) score += 20;
  return score;
};