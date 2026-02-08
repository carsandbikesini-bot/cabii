module.exports = function guarantee({ trustScore, fraudScore }) {
  if (trustScore >= 70 && fraudScore < 30) {
    return {
      status: "approved",
      expiry: new Date(Date.now() + 48 * 60 * 60 * 1000)
    };
  }
  return { status: "rejected" };
};