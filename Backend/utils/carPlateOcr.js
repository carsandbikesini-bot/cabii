const Tesseract = require("tesseract.js");
const path = require("path");

async function detectCarNumber(imagePath) {
  try {
    const result = await Tesseract.recognize(
      path.resolve(imagePath),
      "eng",
      { logger: m => console.log(m.status) }
    );

    const text = result.data.text;

    // Indian number plate pattern
    const regex =
      /[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4}/g;

    const match = text.match(regex);

    return match ? match[0].replace(/\s+/g, "") : null;

  } catch (err) {
    console.error("Plate OCR Error:", err);
    return null;
  }
}

module.exports = detectCarNumber;