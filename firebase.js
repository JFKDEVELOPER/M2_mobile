// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9e8mKH5unl_qOKRk9VkdVYuDlcIrdA1E",
  authDomain: "bestfit-f6798.firebaseapp.com",
  projectId: "bestfit-f6798",
  storageBucket: "bestfit-f6798.firebasestorage.app",
  messagingSenderId: "429539018463",
  appId: "1:429539018463:web:b9dd4f447f6f74d7914b6a",
  measurementId: "G-MS22BXVH70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);