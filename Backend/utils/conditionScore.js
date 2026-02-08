function calculateConditionScore({ imageCount, exifValid }) {
  let score = 100;

  if (imageCount < 4) score -= 20;
  if (!exifValid) score -= 30;

  if (score < 0) score = 0;
  return score;
}

module.exports = { calculateConditionScore };