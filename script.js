(() => {

let stockActual = {};
let tarifas = {};
let listaPropiedades = {};

const CLAVE_ACCESO = "2015";

function solicitarClave() {
    const claveIngresada = prompt("Introduce la clave para acceder:");

    if (claveIngresada !== CLAVE_ACCESO) {
        document.body.innerHTML =
            '<h1 style="color:red;text-align:center;margin-top:50px;">ACCESO NO AUTORIZADO</h1>';

        throw new Error("Clave incorrecta");
    }
}

function guardarLocal() {
    localStorage.setItem(
        "inventarioOficina",
        JSON.stringify(stockActual)
    );

    localStorage.setItem(
        "preciosOficina",
        JSON.stringify(tarifas)
    );

    localStorage.setItem(
        "propiedadesOficina",
        JSON.stringify(listaPropiedades)
    );
}

function inicializarDatos() {

    stockActual =
        JSON.parse(
            localStorage.getItem("inventarioOficina")
        ) || {};

    tarifas =
        JSON.parse(
            localStorage.getItem("preciosOficina")
        ) || {};

    listaPropiedades =
        JSON.parse(
            localStorage.getItem("propiedadesOficina")
        ) || {
            "Terreno Norte": {
                liberacion: 1000,
                gobierno: 1500
            },
            "Estación Central": {
                liberacion: 5000,
                gobierno: 8000
            }
        };
}

function cambiarSeccion(seccionId) {

    document
        .querySelectorAll("main section")
        .forEach(sec => sec.classList.remove("visible"));

    document
        .getElementById(seccionId)
        .classList.add("visible");

    document
        .querySelectorAll("nav button")
        .forEach(btn => btn.classList.remove("selected"));

    document
        .querySelector(
            `nav button[data-target="${seccionId}"]`
        )
        .classList.add("selected");

    if (seccionId === "stockView") {
        actualizarInventario();
    }
    else if (seccionId === "inventorySummary") {
        generarResumen();
    }
    else if (seccionId === "propertyList") {
        cargarPropiedades();
    }
}

function actualizarInventario() {

    const termino =
        document
            .getElementById("filterInput")
            .value
            .trim()
            .toLowerCase();

    let html = "";

    for (const almacen in stockActual) {

        let filas = "";

        for (const item in stockActual[almacen]) {

            if (
                item
                .toLowerCase()
                .includes(termino)
            ) {

                filas += `
                <tr>
                    <td>${item}</td>
                    <td>${stockActual[almacen][item]}</td>
                    <td>
                        <button
                            class="small-action secondary"
                            onclick="retirarUnidades('${almacen}','${item}')">
                            Quitar
                        </button>

                        <button
                            class="small-action"
                            onclick="eliminarItem('${almacen}','${item}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
                `;
            }
        }

        if (filas) {

            html += `
            <h3>Depósito: ${almacen}</h3>

            <table>
                <thead>
                    <tr>
                        <th>Artículo</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas}
                </tbody>
            </table>
            `;
        }
    }

    document.getElementById("stockContainer").innerHTML =
        html ||
        "<p>No hay artículos que coincidan con el filtro.</p>";
}

function insertarProducto(e) {

    e.preventDefault();

    const deposito =
        document
            .getElementById("depositoInput")
            .value
            .trim();

    const nombreArticulo =
        document
            .getElementById("articuloInput")
            .value
            .trim();

    const cantidad =
        parseInt(
            document.getElementById("cantidadInput").value,
            10
        );

    if (
        !deposito ||
        !nombreArticulo ||
        isNaN(cantidad) ||
        cantidad < 1
    ) {
        alert("Por favor ingresa datos válidos.");
        return;
    }

    if (!stockActual[deposito]) {
        stockActual[deposito] = {};
    }

    stockActual[deposito][nombreArticulo] =
        (stockActual[deposito][nombreArticulo] || 0)
        + cantidad;

    guardarLocal();
    actualizarInventario();

    e.target.reset();
}
