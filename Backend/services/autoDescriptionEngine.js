module.exports = function generateDescription(data) {
  return `
🚗 Vehicle Auto-Verified by Cars And Bikes In India-CABII System

• Registration: ${data.rtoState || "Unknown"} – ${data.rtoCity || ""}
• Plate Confidence: ${data.plateConfidence}%
• Condition Grade: ${data.conditionGrade}
• Photos Analyzed: ${data.imageCount} angles verified
• RC Status: ${data.rcVerified ? "Verified" : "Pending"}

💰 Fair Market Price Calculated
⏱ 48-Hour Guarantee: ${data.guaranteeStatus}

🔒 Seller details system verified
`;
};