export function getTrustBadge(score) {
  if (score >= 85) return { text: "🟢 Govt Grade Verified", color: "#15803d" };
  if (score >= 70) return { text: "🟢 Cars And Bikes In India-CABII Verified", color: "#16a34a" };
  if (score >= 50) return { text: "🟡 Auto Detected", color: "#ca8a04" };
  return { text: "🔴 Low Trust", color: "#dc2626" };
}