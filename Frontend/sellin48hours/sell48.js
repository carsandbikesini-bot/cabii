// ================= CABII SELL 48 HOURS – FINAL WORKING =================

// ---------- HELPERS ----------
const qs = (id) => document.getElementById(id);

// ---------- STATE ----------
let selectedFuel = "";
let selectedTransmission = "";
let selectedImages = [];

// ---------- FUEL ----------
document.querySelectorAll(".fuel-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".fuel-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedFuel = btn.dataset.value;
    qs("fuelInput").value = selectedFuel;
  };
});

// ---------- TRANSMISSION ----------
document.querySelectorAll(".trans-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".trans-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTransmission = btn.dataset.value;
    qs("transmissionInput").value = selectedTransmission;
  };
});

// ---------- IMAGE UPLOAD ----------
qs("images").addEventListener("change", (e) => {
  selectedImages = Array.from(e.target.files);
  const preview = qs("imagePreview");
  preview.innerHTML = "";

  selectedImages.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.className = "preview-img";
    preview.appendChild(img);
  });
});

// ---------- AUTO DESCRIPTION ----------
async function generateDescription() {
  qs("descLoading").style.display = "block";

  const payload = {
    brand: qs("brand").value,
    model: qs("model").value,
    year: qs("year").value,
    km: qs("km").value,
    fuel: selectedFuel,
    transmission: selectedTransmission
  };

  const res = await fetch("http://localhost:5000/api/sell48/auto-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  qs("description").value = data.description || "";
  qs("descLoading").style.display = "none";
}

// ---------- MARKET ANALYSIS ----------
async function analyzeMarket() {
  qs("marketLoading").style.display = "block";

  const res = await fetch("http://localhost:5000/api/market-rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand: qs("brand").value,
      model: qs("model").value,
      year: qs("year").value,
      km: qs("km").value
    })
  });

  const data = await res.json();
  qs("marketRange").innerText = `₹${data.min} – ₹${data.max}`;
  qs("marketLoading").style.display = "none";
}

// ---------- SUBMIT ----------
async function submitSell48() {
  if (!selectedFuel || !selectedTransmission || selectedImages.length < 3) {
    alert("Fuel, Transmission and minimum 3 images required");
    return;
  }

  const fd = new FormData();
  fd.append("brand", qs("brand").value);
  fd.append("model", qs("model").value);
  fd.append("year", qs("year").value);
  fd.append("km", qs("km").value);
  fd.append("fuel", selectedFuel);
  fd.append("transmission", selectedTransmission);
  fd.append("price", qs("price").value);
  fd.append("description", qs("description").value);

  selectedImages.forEach(img => fd.append("images", img));

  const res = await fetch("http://localhost:5000/api/sell48", {
    method: "POST",
    body: fd,
    credentials: "include"
  });

  const data = await res.json();
  alert(data.success ? "✅ Ad Posted Successfully" : "❌ Error");
}

// ---------- GLOBAL ----------
window.generateDescription = generateDescription;
window.analyzeMarket = analyzeMarket;
window.submitSell48 = submitSell48;