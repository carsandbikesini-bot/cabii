// Backend/services/pricingEngine.js
// Cars And Bikes In India – CABII

function calculateFinalPrice(marketRate, damageScore) {
  let deduction = 0;

  if (damageScore >= 85) {
    deduction = 0;   // Excellent condition
  } else if (damageScore >= 70) {
    deduction = 5;   // Minor scratches
  } else if (damageScore >= 55) {
    deduction = 12;  // Visible dents / repaint
  } else if (damageScore >= 40) {
    deduction = 20;  // Major body damage
  } else {
    deduction = 30;  // Accident-prone vehicle
  }

  const finalPrice =
    marketRate - (marketRate * deduction) / 100;

  return {
    finalPrice: Math.round(finalPrice),
    deductionPercent: deduction,
  };
}

module.exports = {
  calculateFinalPrice,
};