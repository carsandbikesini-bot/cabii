const Tesseract = require("tesseract.js");

async function extractText(imagePath) {
  const { data } = await Tesseract.recognize(
    imagePath,
    "eng",
    { logger: m => console.log(m.status) }
  );
  return data.text;
}

module.exports = extractText;