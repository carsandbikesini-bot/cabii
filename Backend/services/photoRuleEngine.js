module.exports = function checkPhotos(images) {
  if (images.length >= 5) return { ok: true, grade: "A" };
  if (images.length === 4) return { ok: true, grade: "B" };
  return { ok: false, grade: "C" };
};