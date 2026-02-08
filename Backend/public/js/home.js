import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const adsBox = document.getElementById("ads");

const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
const snap = await getDocs(q);

snap.forEach(doc => {
  const d = doc.data();
  adsBox.innerHTML += `
    <div style="border:1px solid #ccc;padding:10px;margin:10px">
      <h3>${d.title}</h3>
      <p>₹ ${d.price} | ${d.city}</p>
      <p>${d.desc}</p>
    </div>
  `;
});