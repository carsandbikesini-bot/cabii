const crypto = require("crypto");
const fs = require("fs");

function getImageHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

module.exports = { getImageHash };