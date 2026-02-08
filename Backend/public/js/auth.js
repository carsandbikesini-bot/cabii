import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
window.loginWithGoogle = async function () {}
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const token = await user.getIdToken();

    // 🔐 Save token
    localStorage.setItem("token", token);

    alert("Google Login Successful");
    window.location.href = "index.html";

  } catch (error) {
    console.error(error);
    alert("Google Login Failed");
  }
}