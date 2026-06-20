import { db } from "./firebase.js";

import {
  ref,
  push,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const CLAVE = "2015";

const clave = prompt("Ingrese la clave de acceso");

//if (clave !== CLAVE) {
//  document.body.innerHTML =
//    "<h1 style='text-align:center;color:red'>ACCESO DENEGADO</h1>";
//  throw new Error("Acceso denegado");
//}

const form = document.getElementById("formAddProduct");
const filtro = document.getElementById("filterInput");
const stockContainer = document.getElementById("stockContainer");

const productosRef = ref(db, "productos");

let productos = {};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deposito =
    document.getElementById("depositoInput").value.trim();

  const articulo =
    document.getElementById("articuloInput").value.trim();

  const cantidad =
    parseInt(
      document.getElementById("cantidadInput").value,
      10
    );

  if (!deposito || !articulo || isNaN(cantidad)) {
    alert("Completa todos los campos");
    return;
  }

try {

  console.log("Intentando guardar...");

  await push(productosRef, {
    deposito,
    articulo,
    cantidad
  });

  console.log("Guardado correctamente");

  form.reset();

} catch (error) {

  console.error("ERROR FIREBASE:", error);

}

  form.reset();
});

function renderizar() {

  const texto = filtro.value.toLowerCase();

  let html = `
    <table>
      <tr>
        <th>Depósito</th>
        <th>Artículo</th>
        <th>Cantidad</th>
        <th>Acción</th>
      </tr>
  `;

  Object.keys(productos).forEach(id => {

    const item = productos[id];

    if (
      texto &&
      !item.articulo.toLowerCase().includes(texto)
    ) {
      return;
    }

    html += `
      <tr>
        <td>${item.deposito}</td>
        <td>${item.articulo}</td>
        <td>${item.cantidad}</td>
        <td>
          <button onclick="eliminarProducto('${id}')">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  html += "</table>";

  stockContainer.innerHTML = html;
}

onValue(productosRef, (snapshot) => {

  productos = snapshot.val() || {};

  renderizar();

});

filtro.addEventListener("input", renderizar);

window.eliminarProducto = async function(id) {

  if (!confirm("¿Eliminar producto?")) {
    return;
  }

  await remove(
    ref(db, "productos/" + id)
  );

};
