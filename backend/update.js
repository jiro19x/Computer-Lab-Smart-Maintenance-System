import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.appspot.com", // ✅ fixed typo here
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e"
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in with Google.");
      window.location.href = "/index.html"; // ✅ fixed .htm to .html
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const fullNameFromDB = userDocSnap.exists() ? userDocSnap.data().fullName : null;

      const displayName = fullNameFromDB || user.displayName || "No Name";
      const email = user.email || "No Email";
      const photoURL = user.photoURL || "https://firebasestorage.googleapis.com/v0/b/labsystem-481dc.firebasestorage.app/o/icon%2Fprofile-icon.png?alt=media&token=f0f7b9b3-d89d-41ef-b0d5-05fb13e33c79";

      document.getElementById("userName").textContent = displayName;
      document.getElementById("userEmail").textContent = email;
      document.getElementById("userProfilePicture").src = photoURL;
      document.getElementById("userProfilePicture").alt = displayName;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  });
});
