// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
      apiKey: "AIzaSyDvxCvKzDidKeiQmkMV4AaZ49KGS30ipYk",
    authDomain: "cars-and-bikes-in-india-cabii.firebaseapp.com",
    projectId: "cars-and-bikes-in-india-cabii",
    storageBucket: "cars-and-bikes-in-india-cabii.firebasestorage.app",
    messagingSenderId: "344438873814",
    appId: "1:344438873814:web:e123f23fa31bd4cae43377",
    measurementId: "G-HJHN2QK9Z0"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- Email/Password Signup ---
document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "user",  // "dealer" agar dealer signup hai
      createdAt: new Date()
    });

    alert("Signup Successful! Welcome " + name);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// --- Google Signup/Login ---
document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      role: "user", // "dealer" agar dealer signup
      createdAt: new Date()
    }, { merge: true });

    alert("Google Signup Successful! Welcome " + user.displayName);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});