const mock = require("../mock/rto.mock.json");

async function getVehicleData(vehicleNumber) {

  if (process.env.RTO_MODE === "VAHAN") {
    // 🔐 FUTURE: Govt VAHAN API
    // return await fetchFromVAHAN(vehicleNumber);
  }

  // ✅ TODAY: mock / private
  return mock[vehicleNumber] || null;
}

module.exports = { getVehicleData };
class RTOProvider {
  async getVehicleDetails(number) {
    throw new Error("Not implemented");
  }
}

module.exports = RTOProvider;