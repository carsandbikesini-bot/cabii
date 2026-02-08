import { db, loginWithGoogle } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("HOME JS LOADED ✅");

// Elements (safe access)
const adsGrid = document.getElementById("adsGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loginBtn = document.getElementById("loginBtn");
const dealerLoginBtn = document.getElementById("dealerLoginBtn");

// --------------------
// SEARCH (REAL FILTER)
// --------------------
let ALL_ADS = [];

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderAds(ALL_ADS);
      return;
    }

    const filtered = ALL_ADS.filter(ad =>
      (ad.title && ad.title.toLowerCase().includes(q)) ||
      (ad.city && ad.city.toLowerCase().includes(q))
    );

    renderAds(filtered);
  });
}

// --------------------
// GOOGLE LOGIN
// --------------------
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        alert("Logged in: " + user.email);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  });
}

// --------------------
// DEALER LOGIN
// --------------------
if (dealerLoginBtn) {
  dealerLoginBtn.addEventListener("click", () => {
    window.location.href = "login.html?role=dealer";
  });
}

// --------------------
// MEMBERSHIP BUTTONS
// --------------------
document.querySelectorAll(".plan-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const plan = btn.dataset.plan || "";
    window.location.href = "contact.html?plan=" + encodeURIComponent(plan);
  });
});

// --------------------
// LOAD ADS (FIREBASE)
// --------------------
async function loadAds() {
  if (!adsGrid) return;

  adsGrid.innerHTML = "<p>Loading ads...</p>";

  try {
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    ALL_ADS = [];

    snap.forEach(doc => {
      ALL_ADS.push({ id: doc.id, ...doc.data() });
    });

    renderAds(ALL_ADS);

  } catch (err) {
    console.error("Failed to load ads:", err);
    adsGrid.innerHTML = "<p>Failed to load ads</p>";
  }
}

// --------------------
// RENDER ADS
// --------------------
function renderAds(list) {
  if (!adsGrid) return;

  if (!list || list.length === 0) {
    adsGrid.innerHTML = "<p>No ads found</p>";
    return;
  }

  adsGrid.innerHTML = "";

  list.forEach(d => {
    adsGrid.innerHTML += `
      <div class="card">
        <img src="${(d.images && d.images[0]) || 'images/logo.png'}" alt="ad" width="200">
        <h3>${d.title || "No title"}</h3>
        <p>₹ ${d.price || "--"} • ${d.city || ""}</p>
        <p>${d.desc || ""}</p>
      </div>
    `;
  });
}

// INIT
loadAds();