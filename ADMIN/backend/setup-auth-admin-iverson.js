// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.firebasestorage.app",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create a new user in auth collection
async function createAuthUser() {
  try {
    // Default admin user
    const adminUser = {
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      displayName: "Administrator"
    };
    
    // Create the document in auth collection (with auto-generated ID)
    const docRef = await addDoc(collection(db, "auth"), adminUser);
    console.log("Auth user created successfully with ID:", docRef.id);
    document.getElementById("statusMessage").textContent = 
      "New auth user created successfully! You can now log in with email: admin@example.com and password: admin123";
  } catch (error) {
    console.error("Error creating auth user:", error);
    document.getElementById("statusMessage").textContent = "Error: " + error.message;
  }
}

// Setup page
document.addEventListener('DOMContentLoaded', () => {
  const createButton = document.getElementById('createButton');
  createButton.addEventListener('click', createAuthUser);
  
  document.getElementById("statusMessage").textContent = 
    "NOTE: The system has been updated to work with your existing auth collection. This page can be used to add additional users if needed.";
});
