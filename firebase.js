// firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase (bestfit-f6798)
const firebaseConfig = {
  apiKey: "AIzaSyA9e8mKH5unl_qOKRk9VkdVYuDlcIrdA1E",
  authDomain: "bestfit-f6798.firebaseapp.com",
  projectId: "bestfit-f6798",
  storageBucket: "bestfit-f6798.appspot.com",
  messagingSenderId: "429539018463",
  appId: "1:429539018463:web:b9dd4f447f6f74d7914b6a"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth e Firestore (Firebase JS SDK padrão, funciona no Expo)
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
