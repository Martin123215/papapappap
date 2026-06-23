import { db } from "./firebase.js";

import {
  ref,
  push,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const form = document.getElementById("formAddProduct");
const filtro = document.getElementById("filterInput");
const stockContainer = document.getElementById("stockContainer");
const tabsContainer = document.getElementById("depositTabs");

const productosRef = ref(db, "productos");

let productos = {};
let depositoActivo = null;

/* =========================
   ICONOS
========================= */
function obtenerIcono(nombre){

  nombre = nombre.toLowerCase();

  if(nombre.includes("chaleco")) return "🦺";
  if(nombre.includes("radio")) return "📻";
  if(nombre.includes("botiquin")) return "🩹";
  if(nombre.includes("casco")) return "🪖";
  if(nombre.includes("linterna")) return "🔦";
  if(nombre.includes("esposas")) return "⛓️";

  return "📦";
}

/* =========================
   GUARDAR PRODUCTO
========================= */
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

    const data = productos;

    let productoExistente = null;

    Object.keys(data).forEach(id => {

      const item = data[id];

      if (
        item.deposito.toLowerCase() === deposito.toLowerCase() &&
        item.articulo.toLowerCase() === articulo.toLowerCase()
      ) {
        productoExistente = {
          id,
          ...item
        };
      }

    });

    if (productoExistente) {

      await update(
        ref(db, "productos/" + productoExistente.id),
        {
          cantidad:
            productoExistente.cantidad + cantidad
        }
      );

    } else {

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

/* =========================
   CARGA EN TIEMPO REAL
========================= */
onValue(productosRef, (snapshot) => {

  productos = snapshot.val() || {};

  const depositos = [
    ...new Set(
      Object.values(productos)
        .map(p => p.deposito)
    )
  ];

  if (
    !depositoActivo &&
    depositos.length > 0
  ) {
    depositoActivo = depositos[0];
  }

  renderTabs(depositos);
  renderizar();

});

/* =========================
   PESTAÑAS
========================= */
function renderTabs(depositos) {

  tabsContainer.innerHTML = "";

  depositos.forEach(deposito => {

    const btn =
      document.createElement("button");

    btn.className =
      "tab" +
      (
        deposito === depositoActivo
          ? " active"
          : ""
      );

    btn.textContent = deposito;

    btn.onclick = () => {

      depositoActivo = deposito;

      renderTabs(depositos);
      renderizar();

    };

    tabsContainer.appendChild(btn);

  });

}

/* =========================
   RENDER INVENTARIO
========================= */
function renderizar() {

  const texto =
    filtro.value.toLowerCase();

  let html = `
    <table>
      <thead>
        <tr>
          <th>Artículo</th>
          <th>Cantidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.keys(productos).forEach(id => {

    const item = productos[id];

    if (
      depositoActivo &&
      item.deposito !== depositoActivo
    ) {
      return;
    }

    if (
      texto &&
      !item.articulo
        .toLowerCase()
        .includes(texto)
    ) {
      return;
    }

    html += `
      <tr>
        <td>
          ${obtenerIcono(item.articulo)}
          ${item.articulo}
        </td>

        <td>
          ${item.cantidad}
        </td>

        <td>

          <button
            class="btn-plus"
            onclick="sumar('${id}', ${item.cantidad})"
          >
            +
          </button>

          <button
            class="btn-minus"
            onclick="restar('${id}', ${item.cantidad})"
          >
            -
          </button>

          <button
            class="btn-delete"
            onclick="eliminarProducto('${id}')"
          >
            🗑
          </button>

        </td>
      </tr>
    `;

  });

  html += `
      </tbody>
    </table>
  `;

  stockContainer.innerHTML = html;

}

/* =========================
   BUSCADOR
========================= */
filtro.addEventListener(
  "input",
  renderizar
);

/* =========================
   SUMAR
========================= */
window.sumar = async (
  id,
  cantidadActual
) => {

  await update(
    ref(db, "productos/" + id),
    {
      cantidad:
        cantidadActual + 1
    }
  );

};

/* =========================
   RESTAR
========================= */
window.restar = async (
  id,
  cantidadActual
) => {

  if (cantidadActual <= 1) {

    await remove(
      ref(db, "productos/" + id)
    );

    return;
  }

  await update(
    ref(db, "productos/" + id),
    {
      cantidad:
        cantidadActual - 1
    }
  );

};

/* =========================
   ELIMINAR
========================= */
window.eliminarProducto = async (
  id
) => {

  if (
    !confirm(
      "¿Eliminar producto?"
    )
  ) {
    return;
  }

  await remove(
    ref(db, "productos/" + id)
  );

};
/* =========================
   Crea Almacenes 
========================= */
const almacenesRef = ref(db, "almacenes");

const btnCrearAlmacen =
document.getElementById(
  "btnCrearAlmacen"
);

const nombreAlmacenInput =
document.getElementById(
  "nombreAlmacen"
);

const listaAlmacenes =
document.getElementById(
  "listaAlmacenes"
);

btnCrearAlmacen.addEventListener(
  "click",
  async () => {

    const nombre =
      nombreAlmacenInput.value.trim();

    if(!nombre){
      alert(
        "Ingresa un nombre"
      );
      return;
    }

    await push(
      almacenesRef,
      {
        nombre,
        fecha:
          new Date()
          .toLocaleDateString()
      }
    );

    nombreAlmacenInput.value = "";

  }
);

onValue(
  almacenesRef,
  (snapshot)=>{

    const almacenes =
      snapshot.val() || {};

    renderAlmacenes(
      almacenes
    );

  }
);

function renderAlmacenes(
  almacenes
){

  let html = "";

  Object.keys(almacenes)
  .forEach(id=>{

    const almacen =
      almacenes[id];

    html += `

      <div class="warehouse-card">

        <div class="warehouse-left">

          <div class="warehouse-icon">
            🏢
          </div>

          <div class="warehouse-info">

            <h3>
              ${almacen.nombre}
            </h3>

            <span>
              Creado:
              ${almacen.fecha || ""}
            </span>

          </div>

        </div>

        <div class="warehouse-actions">

          <button
            class="btn-view"
            onclick="seleccionarAlmacen('${almacen.nombre}')"
          >
            Ver
          </button>

          <button
            class="btn-delete"
            onclick="eliminarAlmacen('${id}')"
          >
            Eliminar
          </button>

        </div>

      </div>

    `;
  });

  listaAlmacenes.innerHTML =
    html;

}

window.seleccionarAlmacen =
function(nombre){

  const select =
    document.getElementById(
      "depositoInput"
    );

  if(select){
    select.value = nombre;
  }

  window.scrollTo({
    top:
      document.body.scrollHeight,
    behavior:"smooth"
  });

};

window.eliminarAlmacen =
async function(id){

  if(
    !confirm(
      "¿Eliminar almacén?"
    )
  ){
    return;
  }

  await remove(
    ref(
      db,
      "almacenes/" + id
    )
  );

};