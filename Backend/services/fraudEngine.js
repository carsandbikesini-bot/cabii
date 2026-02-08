module.exports = function fraudScore({ images, exifValid, reusedImages }) {
  let score = 0;

  if (!exifValid) score += 30;
  if (reusedImages) score += 40;
  if (images.length < 4) score += 20;

  return score;
};