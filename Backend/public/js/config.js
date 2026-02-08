// 🔧 Central API Configuration (Auto: Local / Live)
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : cabii-carsandbikesinindia-production.up.railway.app;

export { API_BASE };