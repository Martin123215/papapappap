import { db } from "./firebase.js";

import {
  ref,
  push,
  remove,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

/* =========================
   REFERENCIAS
========================= */

const almacenesRef = ref(db, "almacenes");
const preciosRef = ref(db, "precios");

/* =========================
   ELEMENTOS
========================= */

const btnCrearAlmacen = document.getElementById("btnCrearAlmacen");
const nombreAlmacen = document.getElementById("nombreAlmacen");
const listaAlmacenes = document.getElementById("listaAlmacenes");

const inventarioContenido = document.getElementById("inventarioContenido");
const tituloInventario = document.getElementById("tituloInventario");

const btnGuardarPrecio = document.getElementById("btnGuardarPrecio");
const nombrePrecio = document.getElementById("nombrePrecio");
const valorPrecio = document.getElementById("valorPrecio");
const listaPrecios = document.getElementById("listaPrecios");

const totalGeneral = document.getElementById("totalGeneral");
const detalleEstadisticas = document.getElementById("detalleEstadisticas");

/* =========================
   VARIABLES
========================= */

let almacenes = {};
let precios = {};
let almacenActivo = null;

/* =========================
   CREAR ALMACEN
========================= */

btnCrearAlmacen.addEventListener("click", async () => {
  const nombre = nombreAlmacen.value.trim();

  if (!nombre) return alert("Ingresa un nombre");

  await push(almacenesRef, { nombre });

  nombreAlmacen.value = "";
});

/* =========================
   CARGAR ALMACENES
========================= */

onValue(almacenesRef, (snapshot) => {
  almacenes = snapshot.val() || {};

  renderAlmacenes();

  if (almacenActivo) {
    renderInventario();
  }

  renderEstadisticas();
});

/* =========================
   CARGAR PRECIOS
========================= */

onValue(preciosRef, (snapshot) => {
  precios = snapshot.val() || {};

  renderPrecios();
  renderEstadisticas();
});

/* =========================
   MENU
========================= */

window.mostrarSeccion = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
};

/* =========================
   ALMACENES
========================= */

function renderAlmacenes() {
  let html = "";

  Object.keys(almacenes).forEach(id => {
    const a = almacenes[id];

    html += `
      <div class="warehouse-card">
        <div class="warehouse-left">
          <div class="warehouse-icon">🏢</div>
          <div class="warehouse-info">
            <h3>${a.nombre}</h3>
          </div>
        </div>

        <div class="warehouse-actions">
          <button class="btn-view" onclick="verAlmacen('${id}')">👁 Ver</button>
          <button class="btn-delete-small" onclick="eliminarAlmacen('${id}')">🗑</button>
        </div>
      </div>
    `;
  });

  listaAlmacenes.innerHTML = html;
}

window.verAlmacen = function (id) {
  almacenActivo = id;
  mostrarSeccion("inventario");
  renderInventario();
};

window.eliminarAlmacen = async function (id) {
  if (!confirm("¿Eliminar almacén?")) return;
  await remove(ref(db, "almacenes/" + id));
};

/* =========================
   INVENTARIO
========================= */

function renderInventario() {

  if (!almacenActivo || !almacenes[almacenActivo]) return;

  const almacen = almacenes[almacenActivo];

  tituloInventario.innerHTML =
    "🏢 " + almacen.nombre;

  let html = `

    <form class="product-form" onsubmit="agregarProducto(event)">

      <input
        type="text"
        id="articulo"
        placeholder="Artículo"
        required
      >

      <input
        type="number"
        id="cantidad"
        placeholder="Cantidad"
        required
      >

      <button
        class="btn-save"
        type="submit"
      >
        Agregar
      </button>

    </form>

    <div class="inventario-header">
      <span><strong>Artículo</strong></span>
      <span><strong>Cantidad</strong></span>
      <span><strong>Acciones</strong></span>
    </div>

  `;

  const productos =
    almacen.productos || {};

  Object.keys(productos).forEach(id => {

    const p = productos[id];

    html += `

      <div class="producto">

        <div class="producto-info">

          <span>${p.articulo}</span>

          <strong>${p.cantidad}</strong>

        </div>

        <div class="producto-actions">

          <button
            onclick="sumar('${id}', ${p.cantidad})"
          >
            +
          </button>

          <button
            onclick="restar('${id}', ${p.cantidad})"
          >
            -
          </button>

          <button
            onclick="eliminarProducto('${id}')"
          >
            🗑
          </button>

        </div>

      </div>

    `;
  });

  inventarioContenido.innerHTML = html;
}
/* =========================
   PRODUCTOS
========================= */

window.agregarProducto = async function (e) {
  e.preventDefault();

  const articulo = document.getElementById("articulo").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);

  if (!articulo || !cantidad) return;

  const refProd = ref(db, `almacenes/${almacenActivo}/productos`);

  await push(refProd, {
    articulo,
    cantidad
  });

  renderInventario();
};

window.sumar = async function (id, cantidad) {
  await update(
    ref(db, `almacenes/${almacenActivo}/productos/${id}`),
    { cantidad: cantidad + 1 }
  );
};

window.restar = async function (id, cantidad) {
  if (cantidad <= 1) {
    await remove(ref(db, `almacenes/${almacenActivo}/productos/${id}`));
    return;
  }

  await update(
    ref(db, `almacenes/${almacenActivo}/productos/${id}`),
    { cantidad: cantidad - 1 }
  );
};

window.eliminarProducto = async function (id) {
  await remove(ref(db, `almacenes/${almacenActivo}/productos/${id}`));
};

/* =========================
   PRECIOS
========================= */

btnGuardarPrecio.addEventListener("click", async () => {
  const nombre = nombrePrecio.value.trim();
  const precio = parseFloat(valorPrecio.value);

  if (!nombre || isNaN(precio)) return;

  await push(preciosRef, {
    nombre,
    precio
  });

  nombrePrecio.value = "";
  valorPrecio.value = "";
});

function renderPrecios() {

  let html = "";

  Object.keys(precios).forEach(id => {

    const p = precios[id];

    html += `

      <div class="precio-card">

        <div class="precio-info">

          <strong>${p.nombre}</strong>

          <span>$${p.precio}</span>

        </div>

        <div class="producto-actions">

          <button
            class="btn-view"
            onclick="editarPrecio('${id}')"
          >
            ✏️
          </button>

          <button
            class="btn-delete-small"
            onclick="eliminarPrecio('${id}')"
          >
            🗑
          </button>

        </div>

      </div>

    `;
  });

  listaPrecios.innerHTML = html;
}

window.editarPrecio = async function(id) {

  const precioActual =
    precios[id];

  const nuevoPrecio = prompt(
    "Nuevo precio para " +
    precioActual.nombre,
    precioActual.precio
  );

  if (
    nuevoPrecio === null ||
    nuevoPrecio === ""
  ) {
    return;
  }

  await update(
    ref(db, "precios/" + id),
    {
      precio: parseFloat(nuevoPrecio)
    }
  );

};

window.eliminarPrecio = async function(id) {

  if(
    !confirm("¿Eliminar precio?")
  ){
    return;
  }

  await remove(
    ref(
      db,
      "precios/" + id
    )
  );

};


/* =========================
   ESTADISTICAS
========================= */

function renderEstadisticas() {

  let totalGeneralInventario = 0;

  let detalle = "";

  Object.values(almacenes).forEach(almacen => {

    const productos =
      almacen.productos || {};

    let totalAlmacen = 0;

    Object.values(productos).forEach(p => {

      let precioProducto = 0;

      Object.values(precios).forEach(precio => {

        if (
          precio.nombre.toLowerCase() ===
          p.articulo.toLowerCase()
        ) {
          precioProducto =
            precio.precio;
        }

      });

      totalAlmacen +=
        precioProducto * p.cantidad;

    });

    totalGeneralInventario +=
      totalAlmacen;

    detalle += `

      <div class="estadistica-item">

        <strong>
          ${almacen.nombre}
        </strong>

        <span>
          $${totalAlmacen.toLocaleString()}
        </span>

      </div>

    `;

  });

  totalGeneral.innerHTML =
    "$" +
    totalGeneralInventario.toLocaleString();

  detalleEstadisticas.innerHTML =
    detalle;

}

