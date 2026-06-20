import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const CLAVE = "2015";

const clave = prompt("Ingrese la clave");

if(clave !== CLAVE){

document.body.innerHTML =
"<h1>ACCESO DENEGADO</h1>";

throw new Error();
}

const stockContainer =
document.getElementById("stockContainer");

const form =
document.getElementById("formAddProduct");

const filtro =
document.getElementById("filterInput");

const productosRef =
collection(db,"productos");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const deposito =
document.getElementById("depositoInput").value;

const articulo =
document.getElementById("articuloInput").value;

const cantidad =
parseInt(
document.getElementById("cantidadInput").value
);

await addDoc(productosRef,{
deposito,
articulo,
cantidad
});

form.reset();

});

onSnapshot(productosRef,(snapshot)=>{

let html = `
<table>
<tr>
<th>Depósito</th>
<th>Artículo</th>
<th>Cantidad</th>
<th>Acción</th>
</tr>
`;

snapshot.forEach((item)=>{

const data = item.data();

const texto =
filtro.value.toLowerCase();

if(
data.articulo
.toLowerCase()
.includes(texto)
){

html += `
<tr>

<td>${data.deposito}</td>

<td>${data.articulo}</td>

<td>${data.cantidad}</td>

<td>

<button
onclick="eliminar('${item.id}')">

Eliminar

</button>

</td>

</tr>
`;
}

});

html += "</table>";

stockContainer.innerHTML = html;

});

filtro.addEventListener("input",()=>{

location.reload();

});

window.eliminar = async(id)=>{

await deleteDoc(
doc(db,"productos",id)
);

};
