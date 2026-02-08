const exifParser = require("exif-parser");
const fs = require("fs");

function checkExif(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const parser = exifParser.create(buffer);
  const result = parser.parse();

  return {
    edited: !result.tags.Make, // WhatsApp removes EXIF
  };
}

module.exports = { checkExif };