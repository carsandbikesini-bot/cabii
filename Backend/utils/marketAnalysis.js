module.exports = function marketAnalysis({ year, km, condition, fuel, expectedPrice }) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  let score = 80;

  if (condition === "Excellent") score += 10;
  if (condition === "Average") score -= 10;
  if (condition === "Fair") score -= 20;

  if (km > 80000) score -= 10;
  if (km > 120000) score -= 15;

  if (age > 8) score -= 10;
  if (age > 12) score -= 15;

  const fuelFactor = {
    Petrol: 1,
    Diesel: 1.15,
    CNG: 0.85,
    Electric: 1.25
  };

  const fairPrice = Math.round(expectedPrice * (fuelFactor[fuel] || 1));

  let chance = "LOW";
  if (score >= 85 && expectedPrice <= fairPrice) chance = "HIGH";
  else if (score >= 70 && expectedPrice <= fairPrice * 1.1) chance = "MEDIUM";

  return {
    score,
    fairPrice,
    chance
  };
};