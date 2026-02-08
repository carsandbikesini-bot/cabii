const axios = require("axios");
const fs = require("fs");

async function detectPlateNumber(imagePath) {
  const image = fs.readFileSync(imagePath, { encoding: "base64" });

  const res = await axios.post(
    "https://api.platerecognizer.com/v1/plate-reader/",
    { upload: image },
    {
      headers: {
        Authorization: "Token YOUR_PLATERECOGNIZER_KEY"
      }
    }
  );

  if (!res.data.results.length) return null;

  return res.data.results[0].plate.toUpperCase();
}

module.exports = detectPlateNumber;