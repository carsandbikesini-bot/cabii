function analyzePlate(number) {
  const stateCode = number.slice(0, 2);
  const rtoCode = number.slice(2, 4);

  const stateMap = {
    MH: "Maharashtra",
    DL: "Delhi",
    GJ: "Gujarat"
  };

  const rtoMap = {
    MH12: "Pune",
    MH01: "Mumbai South",
    MH02: "Mumbai West"
  };

  return {
    state: stateMap[stateCode] || "Unknown",
    city: rtoMap[stateCode + rtoCode] || "Unknown",
    confidence: 0.75
  };
}

module.exports = { analyzePlate };