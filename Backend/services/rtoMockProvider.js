// Backend/services/rtoMockProvider.js

module.exports = {
  async getVehicleDetails(plate) {
    const stateCode = plate.substring(0, 2).toUpperCase();

    const stateMap = {
      MH: { state: "Maharashtra", city: "Mumbai" },
      DL: { state: "Delhi", city: "Delhi" },
      KA: { state: "Karnataka", city: "Bengaluru" },
      TN: { state: "Tamil Nadu", city: "Chennai" },
      GJ: { state: "Gujarat", city: "Ahmedabad" },
    };

    const data = stateMap[stateCode] || {
      state: "Unknown",
      city: "Unknown",
    };

    return {
      ...data,
      confidence: 0.75,
      source: "mock",
    };
  },
};