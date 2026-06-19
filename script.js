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
  appId: "1:579997039165:web:e32117e3fab909a9c60854",
  measurementId: "G-WNBENR7SGY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("formAddProduct");
const stockContainer = document.getElementById("stockContainer");
const summaryContainer = document.getElementById("summaryContainer");
const filterInput = document.getElementById("filterInput");

let productos = [];

// Cambiar pestañas
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

// Guardar producto
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deposito = document.getElementById("depositoInput").value.trim();
  const articulo = document.getElementById("articuloInput").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadInput").value);

  if (!deposito || !articulo || cantidad < 1) {
    alert("Completa todos los campos");
    return;
  }

  try {

    await addDoc(collection(db, "inventario"), {
      deposito,
      articulo,
      cantidad,
      fecha: Date.now()
    });

    form.reset();

    await cargarProductos();

    alert("Producto guardado");

  } catch (error) {
    console.error(error);
    alert("Error al guardar");
  }
});

// Cargar productos
async function cargarProductos() {

  try {

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
    generarResumen();

  } catch (error) {
    console.error(error);
  }
}

// Mostrar inventario
function mostrarProductos() {

  const filtro = filterInput.value.toLowerCase();

  stockContainer.innerHTML = "";

  const filtrados = productos.filter(p =>
    p.articulo.toLowerCase().includes(filtro)
  );

  if (filtrados.length === 0) {
    stockContainer.innerHTML =
      "<p>No hay productos registrados.</p>";
    return;
  }

  filtrados.forEach(p => {

    stockContainer.innerHTML += `
      <div style="
        border:1px solid #444;
        padding:10px;
        margin:10px 0;
        border-radius:8px;
      ">
        <strong>${p.articulo}</strong><br>
        Depósito: ${p.deposito}<br>
        Cantidad: ${p.cantidad}
      </div>
    `;
  });
}

// Resumen
function generarResumen() {

  const resumen = {};

  productos.forEach(p => {

    if (!resumen[p.articulo]) {
      resumen[p.articulo] = 0;
    }

    resumen[p.articulo] += Number(p.cantidad);
  });

  let html = `
    <table style="width:100%">
      <thead>
        <tr>
          <th>Artículo</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const articulo in resumen) {

    html += `
      <tr>
        <td>${articulo}</td>
        <td>${resumen[articulo]}</td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
  `;

  summaryContainer.innerHTML = html;
}

// Buscador
filterInput.addEventListener("input", mostrarProductos);

// Inicio
cargarProductos();

