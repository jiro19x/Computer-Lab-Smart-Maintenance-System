import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.firebasestorage.app",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};
// ✅ Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, app };

// ✅ Add Report Function
export async function addReport(equipment, issue, pc, room, statusReport, imageFile,fullName,userId) {
  try {
    let imageUrl = null;

    // ✅ Upload image if provided
    if (imageFile) {
      const imageRef = ref(storage, `reportImage/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // ✅ Save to Firestore
    const docRef = await addDoc(collection(db, "reportList"), {
      equipment,
      issue,
      pc,
      room,
      statusReport,
      imageUrl: imageUrl || null,
      date: serverTimestamp(),
      fullName,
      userId
    });

    console.log("Report added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding report: ", e);
  }
}

// ✅ Add Borrow Request Function
export async function addBorrow(equipment, borrowDate, returnDate, purpose, statusReport, downloadURL,fullName, userId) {
  try {
    const docRef = await addDoc(collection(db, "borrowList"), {
      equipment,
      borrowDate,
      returnDate,
      purpose,
      statusReport,
      downloadURL,
      timestamp: serverTimestamp(),
      fullName, userId
    });

    console.log("Borrow request added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding borrow request: ", e);
  }
}
