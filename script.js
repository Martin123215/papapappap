javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASbs-HGfD0VQwWRudkMCpUAk_NewJqnUw",
  authDomain: "inventario-701cb.firebaseapp.com",
  projectId: "inventario-701cb",
  storageBucket: "inventario-701cb.firebasestorage.app",
  messagingSenderId: "579997039165",
  appId: "1:579997039165:web:e32117e3fab909a9c60854"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("formAddProduct");
const stockContainer = document.getElementById("stockContainer");
const summaryContainer = document.getElementById("summaryContainer");
const filterInput = document.getElementById("filterInput");

let productos = [];

document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll("main section").forEach(sec => {
      sec.classList.remove("visible");
    });

    document.querySelectorAll("nav button").forEach(b => {
      b.classList.remove("selected");
    });

    document.getElementById(btn.dataset.target).classList.add("visible");
    btn.classList.add("selected");
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deposito = document.getElementById("depositoInput").value.trim();
  const articulo = document.getElementById("articuloInput").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadInput").value);

  if (!deposito || !articulo || !cantidad) {
    alert("Completa todos los campos");
    return;
  }

  try {

    await addDoc(collection(db, "inventario"), {
  deposito,
  articulo,
  cantidad
});

    form.reset();

    cargarProductos();

  } catch (error) {
  console.error(error);
  alert(error.message);
}
});

async function cargarProductos() {

  const snapshot = await getDocs(
    collection(db, "inventario")
  );

  productos = [];

  snapshot.forEach(doc => {

    productos.push({
      id: doc.id,
      ...doc.data()
    });

  });

  mostrarProductos();
  mostrarResumen();
}

function mostrarProductos() {

  const filtro = filterInput.value.toLowerCase();

  stockContainer.innerHTML = "";

  productos
    .filter(p => p.articulo.toLowerCase().includes(filtro))
    .forEach(p => {

      stockContainer.innerHTML += `
        <div>
          <strong>${p.articulo}</strong><br>
          Depósito: ${p.deposito}<br>
          Cantidad: ${p.cantidad}
          <hr>
        </div>
      `;

    });
}

function mostrarResumen() {

  const resumen = {};

  productos.forEach(p => {

    resumen[p.articulo] =
      (resumen[p.articulo] || 0) + Number(p.cantidad);

  });

  let html = `
    <table border="1">
      <tr>
        <th>Artículo</th>
        <th>Total</th>
      </tr>
  `;

  for (const articulo in resumen) {

    html += `
      <tr>
        <td>${articulo}</td>
        <td>${resumen[articulo]}</td>
      </tr>
    `;
  }

  html += "</table>";

  summaryContainer.innerHTML = html;
}

filterInput.addEventListener("input", mostrarProductos);

cargarProductos();
