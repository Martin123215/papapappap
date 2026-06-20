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
   GUARDAR (PRO - SIN DUPLICADOS)
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deposito = document.getElementById("depositoInput").value.trim();
  const articulo = document.getElementById("articuloInput").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadInput").value);

  if (!deposito || !articulo || isNaN(cantidad)) return;

  const snapshot = await new Promise(r =>
    onValue(productosRef, r, { onlyOnce: true })
  );

  const data = snapshot.val() || {};

  let idExistente = null;

  Object.keys(data).forEach(id => {
    const item = data[id];

    if (
      item.deposito.toLowerCase() === deposito.toLowerCase() &&
      item.articulo.toLowerCase() === articulo.toLowerCase()
    ) {
      idExistente = id;
    }
  });

  if (idExistente) {
    await update(ref(db, "productos/" + idExistente), {
      cantidad: data[idExistente].cantidad + cantidad
    });
  } else {
    await push(productosRef, {
      deposito,
      articulo,
      cantidad
    });
  }

  form.reset();
});

/* =========================
   CARGA EN TIEMPO REAL
========================= */
onValue(productosRef, (snap) => {
  productos = snap.val() || {};

  const deps = Object.values(productos).map(p => p.deposito);
  const unicos = [...new Set(deps)];

  if (!depositoActivo && unicos.length > 0) {
    depositoActivo = unicos[0];
  }

  renderTabs(unicos);
  render();
});

/* =========================
   TABS
========================= */
function renderTabs(deps) {

  tabsContainer.innerHTML = "";

  deps.forEach(dep => {

    const btn = document.createElement("button");
    btn.className = "tab" + (dep === depositoActivo ? " active" : "");
    btn.textContent = dep;

    btn.onclick = () => {
      depositoActivo = dep;
      render();
    };

    tabsContainer.appendChild(btn);
  });
}

/* =========================
   RENDER
========================= */
function render() {

  const texto = filtro.value.toLowerCase();

  let html = `
    <table>
      <tr>
        <th>Artículo</th>
        <th>Cantidad</th>
        <th>Acciones</th>
      </tr>
  `;

  Object.keys(productos).forEach(id => {

    const item = productos[id];

    if (item.deposito !== depositoActivo) return;

    if (texto && !item.articulo.toLowerCase().includes(texto)) return;

    html += `
      <tr>
        <td>${item.articulo}</td>
        <td>${item.cantidad}</td>
        <td>
          <button onclick="sumar('${id}', ${item.cantidad})">+</button>
          <button onclick="restar('${id}', ${item.cantidad})">-</button>
          <button onclick="eliminar('${id}')">🗑</button>
        </td>
      </tr>
    `;
  });

  html += "</table>";

  stockContainer.innerHTML = html;
}

/* =========================
   ACCIONES PRO
========================= */
window.sumar = async (id, c) => {
  await update(ref(db, "productos/" + id), {
    cantidad: c + 1
  });
};

window.restar = async (id, c) => {
  if (c <= 1) {
    await remove(ref(db, "productos/" + id));
    return;
  }

  await update(ref(db, "productos/" + id), {
    cantidad: c - 1
  });
};

window.eliminar = async (id) => {
  await remove(ref(db, "productos/" + id));
};

filtro.addEventListener("input", render);
