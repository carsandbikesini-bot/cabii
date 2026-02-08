// Backend/services/autoDescription.js

function generateDescription({
  vehicleNumber,
  damageScore,
  conditionScore,
  trustBadge,
  finalPrice
}) {
  let conditionText = "Well maintained";
  let damageText = "No major damage detected";

  if (damageScore < 60) {
    conditionText = "Needs attention";
    damageText = "Visible dents / repaint detected";
  } else if (damageScore < 80) {
    conditionText = "Good condition";
    damageText = "Minor scratches detected";
  }

  return `
🚗 Vehicle Verified by Cars And Bikes In India – CABII

• Vehicle Number: ${vehicleNumber}
• Condition: ${conditionText}
• Inspection: ${damageText}
• Trust Badge: ${trustBadge.toUpperCase()}
• Final Price: ₹${finalPrice}

✔ Auto-verified images
✔ RTO intelligence applied
✔ Transparent pricing
✔ 48-hour guarantee eligibility

CABII is not a marketplace.
It is India’s Vehicle Trust Infrastructure.
`;
}

module.exports = { generateDescription };