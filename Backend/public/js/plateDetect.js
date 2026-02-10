// js/plateDetect.js
console.log("plateDetect.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("autoDetectImage");
  const vehicleNumberInput = document.getElementById("vehicleNumber");
  const ocrStatus = document.getElementById("ocrStatus");

  if (!imageInput) return;

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;

    ocrStatus.textContent = "🔍 Detecting number plate...";

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch("/api/ads/detect-plate", {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      console.log("OCR RESPONSE:", data);

      if (data.success && data.vehicleNumber) {
        vehicleNumberInput.value = data.vehicleNumber;
        ocrStatus.textContent = "✅ Vehicle number detected";
      } else {
        vehicleNumberInput.value = "PENDING_VERIFICATION";
        ocrStatus.textContent = "⚠️ Auto verification pending";
      }
    } catch (err) {
      console.error(err);
      vehicleNumberInput.value = "PENDING_VERIFICATION";
      ocrStatus.textContent = "⚠️ OCR service slow, verification pending";
    }
  });
});