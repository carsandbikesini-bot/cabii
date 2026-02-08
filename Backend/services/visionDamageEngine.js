module.exports = function analyzeDamage(imageMeta) {
  let risk = 0;

  if (imageMeta.colorMismatch) risk += 30;
  if (imageMeta.panelGapUneven) risk += 25;
  if (imageMeta.reflectionNoise) risk += 20;
  if (imageMeta.exifEdited) risk += 25;

  return {
    riskScore: risk,
    verdict:
      risk >= 60
        ? "High structural risk"
        : risk >= 30
        ? "Possible repaint / repair"
        : "No visible damage indicators"
  };
};