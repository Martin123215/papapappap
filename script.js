import { db } from "./firebase.js";

import {
  ref,
  push,
  remove,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const almacenesRef = ref(db, "almacenes");

const btnCrearAlmacen =
document.getElementById("btnCrearAlmacen");

const nombreAlmacen =
document.getElementById("nombreAlmacen");

const listaAlmacenes =
document.getElementById("listaAlmacenes");

let almacenes = {};
let almacenActivo = null;

const inventarioContenido =
document.getElementById("inventarioContenido");

const tituloInventario =
document.getElementById("tituloInventario");

const preciosRef =
ref(db,"precios");

let precios = {};

btnCrearAlmacen.addEventListener(
  "click",
  async () => {

    const nombre =
    nombreAlmacen.value.trim();

    if(!nombre){
      alert("Ingresa un nombre");
      return;
    }

    await push(
      almacenesRef,
      {
        nombre
      }
    );

    nombreAlmacen.value = "";

  }
);

onValue(
  almacenesRef,
  snapshot => {

    almacenes =
    snapshot.val() || {};

    if(
      !almacenActivo &&
      Object.keys(almacenes).length > 0
    ){
      almacenActivo =
      Object.keys(almacenes)[0];
    }

    render();

  }
);

function render(){

  let html = "";

  Object.keys(almacenes).forEach(idAlmacen => {

    const almacen = almacenes[idAlmacen];

    html += `
      <div class="warehouse-card">

        <div class="warehouse-left">

          <div class="warehouse-icon">
            🏢
          </div>

          <div class="warehouse-info">
            <h3>${almacen.nombre}</h3>
          </div>

        </div>

        <div class="warehouse-actions">

          <button
            class="btn-view"
            onclick="verAlmacen('${idAlmacen}')"
          >
            👁 Ver
          </button>

          <button
            class="btn-delete-small"
            onclick="eliminarAlmacen('${idAlmacen}')"
          >
            🗑
          </button>

        </div>

      </div>
    `;

    if(almacenActivo === idAlmacen){

      html += `

      <div class="almacen-card">

        <form
          class="product-form"
          onsubmit="agregarProducto(event,'${idAlmacen}')"
        >

          <input
            type="text"
            id="articulo-${idAlmacen}"
            placeholder="Artículo"
            required
          >

          <input
            type="number"
            id="cantidad-${idAlmacen}"
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

        ${renderProductos(idAlmacen)}

      </div>

      `;
    }

  });

  listaAlmacenes.innerHTML = html;
}

function renderProductos(idAlmacen){

  const almacen =
  almacenes[idAlmacen];

  if(!almacen.productos){
    return "<p>Sin productos</p>";
  }

  let html = "";

  Object.keys(
    almacen.productos
  ).forEach(idProducto => {

    const p =
    almacen.productos[idProducto];

    html += `

    <div class="producto">

      <div class="producto-info">

        <span>📦</span>

        <span>
          ${p.articulo}
        </span>

        <strong>
          ${p.cantidad}
        </strong>

      </div>

      <div class="producto-actions">

        <button
          class="btn-plus"
          onclick="sumar('${idAlmacen}','${idProducto}',${p.cantidad})"
        >
          +
        </button>

        <button
          class="btn-minus"
          onclick="restar('${idAlmacen}','${idProducto}',${p.cantidad})"
        >
          -
        </button>

        <button
          class="btn-delete"
          onclick="eliminarProducto('${idAlmacen}','${idProducto}')"
        >
          🗑
        </button>

      </div>

    </div>

    `;
  });

  return html;
}

window.agregarProducto =
async function(
  e,
  idAlmacen
){

  e.preventDefault();

  const articulo =
  document
  .getElementById(
    `articulo-${idAlmacen}`
  )
  .value
  .trim();

  const cantidad =
  parseInt(
    document
    .getElementById(
      `cantidad-${idAlmacen}`
    )
    .value
  );

  const productos =
  almacenes[idAlmacen]
  .productos || {};

  let existente = null;

  Object.keys(productos)
  .forEach(id => {

    if(
      productos[id]
      .articulo
      .toLowerCase()
      ===
      articulo.toLowerCase()
    ){
      existente = {
        id,
        ...productos[id]
      };
    }

  });

  if(existente){

    await update(
      ref(
        db,
        `almacenes/${idAlmacen}/productos/${existente.id}`
      ),
      {
        cantidad:
        existente.cantidad +
        cantidad
      }
    );

  }else{

    await push(
      ref(
        db,
        `almacenes/${idAlmacen}/productos`
      ),
      {
        articulo,
        cantidad
      }
    );

  }

};

window.sumar =
async function(
  idAlmacen,
  idProducto,
  cantidad
){

  await update(
    ref(
      db,
      `almacenes/${idAlmacen}/productos/${idProducto}`
    ),
    {
      cantidad:
      cantidad + 1
    }
  );

};

window.restar =
async function(
  idAlmacen,
  idProducto,
  cantidad
){

  if(cantidad <= 1){

    await remove(
      ref(
        db,
        `almacenes/${idAlmacen}/productos/${idProducto}`
      )
    );

    return;
  }

  await update(
    ref(
      db,
      `almacenes/${idAlmacen}/productos/${idProducto}`
    ),
    {
      cantidad:
      cantidad - 1
    }
  );

};

window.eliminarProducto =
async function(
  idAlmacen,
  idProducto
){

  await remove(
    ref(
      db,
      `almacenes/${idAlmacen}/productos/${idProducto}`
    )
  );

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

window.verAlmacen = function(idAlmacen){

  almacenActivo = idAlmacen;

  mostrarSeccion("inventario");

  renderInventario();

};

window.mostrarSeccion = function(id){

  document
  .querySelectorAll(".section")
  .forEach(sec => {

    sec.style.display = "none";

  });

  document
  .getElementById(id)
  .style.display = "block";

};

function renderInventario(){

  if(
    !almacenActivo ||
    !almacenes[almacenActivo]
  ){
    return;
  }

  const almacen =
  almacenes[almacenActivo];

  tituloInventario.innerHTML =
  "🏢 " + almacen.nombre;

  let html = `

  <form
    class="product-form"
    onsubmit="agregarProducto(event,'${almacenActivo}')"
  >

    <input
      type="text"
      id="articulo-${almacenActivo}"
      placeholder="Artículo"
      required
    >

    <input
      type="number"
      id="cantidad-${almacenActivo}"
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

  `;

  html += renderProductos(
    almacenActivo
  );

  inventarioContenido.innerHTML =
  html;

}