import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.appspot.com",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const googleLogin = document.getElementById("google-login-btn");

  if (googleLogin) {
    googleLogin.addEventListener("click", async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idTokenResult = await user.getIdTokenResult();

        if (idTokenResult.claims.admin) {
          window.location.href = "/ADMIN/structure-admin-iverson.html";
        } else {
          window.location.href = "/structure.html";
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    });
  }
});
