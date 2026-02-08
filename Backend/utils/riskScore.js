module.exports = function calculateRiskScore({
  rcStatus,
  hypothecation,
  ownerCount,
  insuranceExpired,
  insuranceExpiryDays,
  photoScore,
  expectedPrice,
  fairPrice
}) {
  let rcRisk = 0;
  if (rcStatus !== "ACTIVE") rcRisk += 30;
  if (hypothecation) rcRisk += 10;
  if (ownerCount > 2) rcRisk += 10;
  rcRisk = Math.min(rcRisk, 40);

  let insuranceRisk = 0;
  if (insuranceExpired) insuranceRisk += 10;
  if (insuranceExpiryDays < 30) insuranceRisk += 5;

  let photoRisk = 0;
  if (photoScore < 80) photoRisk += 10;
  if (photoScore < 65) photoRisk += 20;
  photoRisk = Math.min(photoRisk, 25);

  let priceRisk = 0;
  const priceDiff = (expectedPrice - fairPrice) / fairPrice;
  if (priceDiff > 0.10) priceRisk += 10;
  if (priceDiff > 0.25) priceRisk += 20;

  return Math.min(
    rcRisk + insuranceRisk + photoRisk + priceRisk,
    100
  );
};