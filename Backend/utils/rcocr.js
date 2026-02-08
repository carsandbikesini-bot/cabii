const Tesseract = require("tesseract.js");
const path = require("path");

async function readRcText(imagePath) {
  try {
    const result = await Tesseract.recognize(
      path.resolve(imagePath),
      "eng",
      {
        logger: m => console.log(m.status)
      }
    );

    const text = result.data.text || "";

    // Indian Vehicle Number Pattern
    const regex =
      /[A-Z]{2}\s?[0-9]{2}\s?[A-Z]{1,2}\s?[0-9]{4}/g;

    const match = text.match(regex);

    return match ? match[0].replace(/\s+/g, "") : null;

  } catch (err) {
    console.error("OCR ERROR:", err);
    return null;
  }
}

module.exports = readRcText;