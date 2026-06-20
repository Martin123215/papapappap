import { db } from "./firebase.js";

import {
  ref,
  push,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const form = document.getElementById("formAddProduct");
const filtro = document.getElementById("filterInput");
const stockContainer = document.getElementById("stockContainer");

const productosRef = ref(db, "productos");

let productos = {};

// GUARDAR
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deposito = document.getElementById("depositoInput").value.trim();
  const articulo = document.getElementById("articuloInput").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadInput").value, 10);

  if (!deposito || !articulo || isNaN(cantidad)) {
    alert("Completa todos los campos");
    return;
  }

  try {
    const snapshot = await new Promise((resolve) => {
      onValue(productosRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val() || {};

    let encontradoId = null;

    Object.keys(data).forEach(id => {
      const item = data[id];

      if (
        item.deposito.toLowerCase() === deposito.toLowerCase() &&
        item.articulo.toLowerCase() === articulo.toLowerCase()
      ) {
        encontradoId = id;
      }
    });

    if (encontradoId) {
      // SUMAR cantidad
      const itemRef = ref(db, "productos/" + encontradoId);

      await remove(itemRef); // eliminamos el viejo

      await push(productosRef, {
        deposito,
        articulo,
        cantidad: data[encontradoId].cantidad + cantidad
      });

    } else {
      // NUEVO
      await push(productosRef, {
        deposito,
        articulo,
        cantidad
      });
    }

    form.reset();

  } catch (error) {
    console.error(error);
  }
});

// CARGAR DATOS EN TIEMPO REAL (ESTO TE FALTABA)
onValue(productosRef, (snapshot) => {

  productos = snapshot.val() || {};

  renderizar();

});

// FILTRO
filtro.addEventListener("input", renderizar);

// RENDER POR DEPÓSITOS
function renderizar() {

  const texto = filtro.value.toLowerCase();
  const depositos = {};

  Object.keys(productos).forEach(id => {

    const item = productos[id];

    if (texto && !item.articulo.toLowerCase().includes(texto)) {
      return;
    }

    if (!depositos[item.deposito]) {
      depositos[item.deposito] = [];
    }

    depositos[item.deposito].push({ id, ...item });
  });

  let html = "";

  Object.keys(depositos).forEach(nombreDeposito => {

    html += `
      <h2 style="color:gold;margin-top:20px;">
        📦 ${nombreDeposito}
      </h2>

      <table>
        <tr>
          <th>Artículo</th>
          <th>Cantidad</th>
          <th>Acción</th>
        </tr>
    `;

    depositos[nombreDeposito].forEach(item => {

      html += `
        <tr>
          <td>${item.articulo}</td>
          <td>${item.cantidad}</td>
          <td>
            <button onclick="eliminarProducto('${item.id}')">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    });

    html += `</table>`;
  });

  stockContainer.innerHTML =
    html || "<p>No hay productos</p>";
}

// ELIMINAR
window.eliminarProducto = async function(id) {

  if (!confirm("¿Eliminar producto?")) return;

  await remove(ref(db, "productos/" + id));
};
