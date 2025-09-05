(() => {
// Variables principales
let stockActual = {};
let tarifas = {};
let listaPropiedades = {};

const CLAVE_ACCESO = "2015";

function solicitarClave() {
  const claveIngresada = prompt("Introduce la clave para acceder:");
  if (claveIngresada !== CLAVE_ACCESO) {
    document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50px;">ACCESO NO AUTORIZADO</h1>';
    throw new Error("Clave incorrecta");
  }
}

function guardarLocal() {
  localStorage.setItem('inventarioOficina', JSON.stringify(stockActual));
  localStorage.setItem('preciosOficina', JSON.stringify(tarifas));
  localStorage.setItem('propiedadesOficina', JSON.stringify(listaPropiedades));
}

function inicializarDatos() {
  stockActual = JSON.parse(localStorage.getItem('inventarioOficina')) || {};
  tarifas = JSON.parse(localStorage.getItem('preciosOficina')) || {};
  listaPropiedades = JSON.parse(localStorage.getItem('propiedadesOficina')) || {
    "Terreno Norte": { liberacion: 1000, gobierno: 1500 },
    "Estación Central": { liberacion: 5000, gobierno: 8000 }
  };
}

function cambiarSeccion(seccionId) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.remove('visible'));
  document.getElementById(seccionId).classList.add('visible');

  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`nav button[data-target="${seccionId}"]`).classList.add('selected');

  if (seccionId === 'stockView') actualizarInventario();
  else if (seccionId === 'inventorySummary') generarResumen();
  else if (seccionId === 'propertyList') cargarPropiedades();
}

function actualizarInventario() {
  const termino = document.getElementById('filterInput').value.trim().toLowerCase();
  let html = '';

  for (const almacen in stockActual) {
    let filas = '';
    for (const item in stockActual[almacen]) {
      if (item.toLowerCase().includes(termino)) {
        filas += `
          <tr>
            <td>${item}</td>
            <td>${stockActual[almacen][item]}</td>
            <td>
              <button class="small-action secondary" onclick="retirarUnidades('${almacen}', '${item}')">Quitar</button>
              <button class="small-action" onclick="eliminarItem('${almacen}', '${item}')">Eliminar</button>
            </td>
          </tr>
        `;
      }
    }
    if (filas) {
      html += `
        <h3>Depósito: ${almacen}</h3>
        <table>
          <thead><tr><th>Artículo</th><th>Cantidad</th><th>Acciones</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      `;
    }
  }

  document.getElementById('stockContainer').innerHTML = html || '<p>No hay artículos que coincidan con el filtro.</p>';
}

function insertarProducto(e) {
  e.preventDefault();
  const deposito = document.getElementById('depositoInput').value.trim();
  const nombreArticulo = document.getElementById('articuloInput').value.trim();
  const cantidad = parseInt(document.getElementById('cantidadInput').value, 10);

  if (!deposito || !nombreArticulo || isNaN(cantidad) || cantidad < 1) {
    alert('Por favor ingresa datos válidos.');
    return;
  }

  if (!stockActual[deposito]) stockActual[deposito] = {};
  stockActual[deposito][nombreArticulo] = (stockActual[deposito][nombreArticulo] || 0) + cantidad;

  guardarLocal();
  actualizarInventario();
  e.target.reset();
}

window.retirarUnidades = function(deposito, producto) {
  let cantidad = prompt(`¿Cuántas unidades deseas quitar de "${producto}" en "${deposito}"?`);
  cantidad = parseInt(cantidad, 10);
  if (isNaN(cantidad) || cantidad < 1) return;

  stockActual[deposito][producto] -= cantidad;
  if (stockActual[deposito][producto] <= 0) delete stockActual[deposito][producto];
  if (Object.keys(stockActual[deposito]).length === 0) delete stockActual[deposito];

  guardarLocal();
  actualizarInventario();
};

window.eliminarItem = function(deposito, producto) {
  if (confirm(`¿Seguro deseas eliminar "${producto}" del depósito "${deposito}"?`)) {
    delete stockActual[deposito][producto];
    if (Object.keys(stockActual[deposito]).length === 0) delete stockActual[deposito];

    guardarLocal();
    actualizarInventario();
  }
};

function generarResumen() {
  const acumulado = {};
  for (const deposito in stockActual) {
    for (const item in stockActual[deposito]) {
      acumulado[item] = (acumulado[item] || 0) + stockActual[deposito][item];
    }
  }

  let total = 0;
  let tabla = `
    <table>
      <thead>
        <tr>
          <th>Artículo</th>
          <th>Cantidad Total</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const item in acumulado) {
    const precio = tarifas[item] ?? 0;
    const subtotal = acumulado[item] * precio;
    total += subtotal;

    tabla += `
      <tr>
        <td>${item}</td>
        <td>${acumulado[item]}</td>
        <td><input type="number" min="0" step="0.01" value="${precio}" onchange="modificarPrecio('${item}', this.value)" /></td>
        <td>$${subtotal.toFixed(2)}</td>
      </tr>
    `;
  }

  tabla += `
      </tbody>
      <tfoot>
        <tr style="font-weight:bold;">
          <td colspan="3">Total General</td>
          <td>$${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  document.getElementById('summaryContainer').innerHTML = tabla;
}

window.modificarPrecio = function(item, nuevoValor) {
  const nuevo = parseFloat(nuevoValor);
  if (!isNaN(nuevo) && nuevo >= 0) {
    tarifas[item] = nuevo;
    guardarLocal();
    generarResumen();
  }
};

function cargarPropiedades() {
  let totalLib = 0;
  let totalGob = 0;
  let tabla = `
    <table>
      <thead>
        <tr>
          <th>Propiedad</th>
          <th>Precio Liberación</th>
          <th>Precio Gobierno</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const nombre in listaPropiedades) {
    const { liberacion, gobierno } = listaPropiedades[nombre];
    totalLib += liberacion;
    totalGob += gobierno;

    tabla += `
      <tr>
        <td>${nombre}</td>
        <td>$${liberacion.toFixed(2)}</td>
        <td>$${gobierno.toFixed(2)}</td>
        <td><button class="small-action" onclick="quitarPropiedad('${nombre}')">Eliminar</button></td>
      </tr>
    `;
  }

  tabla += `
      </tbody>
      <tfoot>
        <tr style="font-weight:bold;">
          <td>Total</td>
          <td>$${totalLib.toFixed(2)}</td>
          <td>$${totalGob.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;

  document.getElementById('propertiesContainer').innerHTML = tabla;
}

function nuevaPropiedad(e) {
  e.preventDefault();
  const nombre = document.getElementById('propNameInput').value.trim();
  const lib = parseFloat(document.getElementById('propLiberacionInput').value);
  const gob = parseFloat(document.getElementById('propGobiernoInput').value);

  if (!nombre || isNaN(lib) || isNaN(gob) || lib < 0 || gob < 0) {
    alert('Por favor introduce datos válidos para la propiedad.');
    return;
  }

  listaPropiedades[nombre] = { liberacion: lib, gobierno: gob };
  guardarLocal();
  cargarPropiedades();
  e.target.reset();
}

window.quitarPropiedad = function(nombre) {
  if (confirm(`¿Seguro quieres eliminar la propiedad "${nombre}"?`)) {
    delete listaPropiedades[nombre];
    guardarLocal();
    cargarPropiedades();
  }
};

// Eventos
document.querySelectorAll('nav button').forEach(btn =>
  btn.addEventListener('click', () => cambiarSeccion(btn.dataset.target))
);

document.getElementById('formAddProduct').addEventListener('submit', insertarProducto);
document.getElementById('filterInput').addEventListener('input', actualizarInventario);
document.getElementById('formAddProperty').addEventListener('submit', nuevaPropiedad);

// Inicialización
try {
  solicitarClave();
  inicializarDatos();
  cambiarSeccion('stockView');
} catch (_) {
  // Clave incorrecta: no continuar
}
})();