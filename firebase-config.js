  // Import Firebase SDK
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGhRo90oAYKv-qn_Ww9DdGtMaho0aqqUs",
  authDomain: "streamuvb.firebaseapp.com",
  databaseURL: "https://streamuvb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "streamuvb",
  storageBucket: "streamuvb.appspot.com",
  messagingSenderId: "156012148095",
  appId: "1:156012148095:web:2c0a7d2840b668c63d964a",
  measurementId: "G-C6JN5YMT7S"
};

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);