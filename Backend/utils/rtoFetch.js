async function fetchRtoData(vehicleNumber) {
  // MOCK DATA (realistic)
  return {
    vehicleNumber,
    brand: "Maruti",
    model: "Swift",
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st",
    insurance: "Valid",
    manufacturerYear: 2020
  };
}

module.exports = fetchRtoData;