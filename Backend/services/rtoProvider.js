// Backend/services/rtoProvider.js
// Cars And Bikes In India – CABII

const rtoProvider =
  process.env.VAHAN_ENABLED === "true"
    ? require("./rtoVahanProvider")   // 🔐 Govt VAHAN (future)
    : require("./rtoMockProvider");   // 🧪 Safe mock (current)

module.exports = rtoProvider;