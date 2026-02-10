// sell48.js  — CABII Sell in 48 Hours

const form = document.getElementById("sell48Form");
const priceInput = document.getElementById("price");
const priceHint = document.getElementById("priceHint");

/* ================= PRICE SUGGESTION ================= */
priceInput.addEventListener("input", () => {
  const price = Number(priceInput.value);
  if (!price) {
    priceHint.textContent = "";
    return;
  }

  if (price <0 ) {
    priceHint.textContent = "⚠️ Price seems very low for market value";
    priceHint.style.color = "red";
  } else {
    priceHint.textContent = "✔ Market competitive price";
    priceHint.style.color = "green";
  }
});

/* ================= FORM SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // LOGIN CHECK
  const sessionRes = await fetch("/api/auth/me", {
    credentials: "include"
  });
  const sessionData = await sessionRes.json();

  if (!sessionData.loggedIn) {
    alert("Please login first to post your vehicle");
    window.location.href = "login.html";
    return;
  }

  const formData = new FormData(form);

  try {
    const res = await fetch("/api/sell48", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    alert("✅ Vehicle posted successfully! Dealers will contact you soon.");
    window.location.href = "sell48-my.html";

  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  }
});