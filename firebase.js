import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyASbs-HGfD0VQwWRudkMCpUAk_NewJqnUw",
  authDomain: "inventario-701cb.firebaseapp.com",
  databaseURL: "https://inventario-701cb-default-rtdb.firebaseio.com",
  projectId: "inventario-701cb",
  storageBucket: "inventario-701cb.firebasestorage.app",
  messagingSenderId: "579997039165",
  appId: "1:579997039165:web:e32117e3fab909a9c60854",
  measurementId: "G-WNBENR7SGY"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
