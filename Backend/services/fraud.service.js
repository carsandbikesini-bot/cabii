function calculateFraudScore({ rto, imagesCount, priceOk }) {
  let score = 0;

  if (rto) score += 40;
  if (imagesCount >= 3) score += 20;
  if (priceOk) score += 20;

  return score;
}

module.exports = { calculateFraudScore };