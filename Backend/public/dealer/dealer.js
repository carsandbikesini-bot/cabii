async function loadDealerAds() {
  const res = await fetch("http://localhost:5000/dealer/sell48-ads");
  const ads = await res.json();

  const box = document.getElementById("ads");
  box.innerHTML = "";

  ads.forEach(ad => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${ad.brand} ${ad.model}</h3>
      <p><b>Price:</b> ₹${ad.price}</p>
      <p><b>City:</b> ${ad.location}</p>
      <p><b>Status:</b> ${ad.sell48Status}</p>
      <button class="sold">Mark Sold</button>
    `;

    div.querySelector(".sold").onclick = async () => {
      await fetch(
        "http://localhost:5000/dealer/sell48-sold/" + ad._id,
        { method: "PUT" }
      );
      alert("Marked as SOLD");
      loadDealerAds();
    };

    box.appendChild(div);
  });
}

loadDealerAds();