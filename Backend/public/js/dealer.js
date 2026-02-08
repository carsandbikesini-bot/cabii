document.addEventListener("DOMContentLoaded", loadSell48Ads);

async function loadSell48Ads() {
  const res = await fetch("http://localhost:5000/dealer/sell48-ads");
  const ads = await res.json();

  const container = document.getElementById("dealerAds");
  container.innerHTML = "";

  ads.forEach(ad => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="http://localhost:5000${ad.images[0]}" style="width:100%">
      <div class="content">
        <h3>${ad.brand} ${ad.model}</h3>
        <p><b>₹${ad.price}</b></p>
        <p>${ad.location}</p>
        <p>Status: ${ad.sell48Status}</p>

        <button onclick="markSold('${ad._id}')"
          style="background:green;color:white;padding:8px">
          Mark as SOLD
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

async function markSold(id) {
  if (!confirm("Confirm vehicle SOLD?")) return;

  const res = await fetch(
    `http://localhost:5000/dealer/sell48-sold/${id}`,
    { method: "PUT" }
  );

  if (res.ok) {
    alert("Marked as SOLD");
    loadSell48Ads();
  }
}