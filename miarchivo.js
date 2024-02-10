let contenedor = document.getElementById("contenedor");

let contenedor3 = document.getElementById("contenedor3");

let cuerpoTabla = document.getElementById("cuerpoTabla");

//Llamado a la API de la cotizacion del dolar Oficial:
fetch("https://dolarapi.com/v1/dolares/oficial")
  .then(response => response.json())
  .then(data => {
    //Accedo a los datos que quiero mostrar
    const oficialCompra = data.compra;
    const oficialVenta = data.venta;
    const fechaActualizacion = data.fechaActualizacion;    

    //Le doy formato a la fecha que obtengo de la API:
    const fechaHtml = document.getElementById("fechaActualizacion");
    const fecha = new Date(fechaActualizacion);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-AR', options);

    //actualiza en el html:
    document.getElementById("oficialCompra").innerText = "Compra: $" + oficialCompra;
    document.getElementById("oficialVenta").innerText = "Venta: $" + oficialVenta;
    fechaHtml.textContent = `Ultima actualizacion: ${fechaFormateada}`;
  })
  .catch(error => {
    console.error("Error conexion a la APi:", error);
    document.getElementById("oficialCompra").innerText = "No se pudo obtener la cotización";
    document.getElementById("oficialCompra").innerText = "No se pudo obtener la cotización";
  });

  //Llamado a la API de la cotizacion del dolar Blue:
  fetch("https://dolarapi.com/v1/dolares/blue")
  .then(response => response.json())
  .then(data => {
    //Accedo a los datos que quiero mostrar
    const blueCompra = data.compra;
    const blueVenta = data.venta;
    const fechaActualizacionBlue = data.fechaActualizacion;    

    //Le doy formato a la fecha que obtengo de la API:
    const fechaHtml = document.getElementById("fechaActualizacionBlue");
    const fecha = new Date(fechaActualizacionBlue);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-AR', options);

    //actualiza en el html:
    document.getElementById("blueCompra").innerText = "Compra: $" + blueCompra;
    document.getElementById("blueVenta").innerText = "Venta: $" + blueVenta;
    fechaHtml.textContent = `Ultima actualizacion: ${fechaFormateada}`;
  })
  .catch(error => {
    console.error("Error conexion a la APi:", error);
    document.getElementById("oficialCompra").innerText = "No se pudo obtener la cotización";
    document.getElementById("oficialCompra").innerText = "No se pudo obtener la cotización";
  });

//Creo una clase con el constructor de los objetos que almacenara el array.
class valoresDeCuotas {
  constructor(id, precioCuotaSinDecimales) {
    this.id = id;
    this.precioCuotaSinDecimales = precioCuotaSinDecimales;
  }
}
//Creo un array donde almaceno los objetos con el valor de las cuotas.
const totalCuotas = [];

//Evento al dar click en el boton "solicitar":
let boton = document.getElementById("boton");
boton.addEventListener("click", () => tomarDatos());

//con esta funcion tomo los valores de los input del html:
const tomarDatos = () => {
  let monto = document.getElementById("monto").value;
  let cuotas = document.getElementById("cuotas").value;
  //Verifico que los valores esten almacenados en las variables:
  console.log(monto);
  console.log(cuotas);
  //Llamo a la funcion con la cual hago los calculos necesarios:
  procesarDatos(monto, cuotas);
};

//En esta funcion hago todos los calculos del prestamo:
const procesarDatos = (monto, cuotas) => {
  //Verifico que la cantidad de cuotas seleccionadas sea igual o menor a 12, en el caso de que sean mas, se notificara que supero el numero maximo de cuotas.
  if (cuotas <= 12) {
    Toastify({
      text: "Solicitud procesada con exito!",      
      duration: 3000,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",      
      }}).showToast();

    for (let i = 1; i <= cuotas; i++) {
      //Con esta funcion calculo el interes del prestamo dependiendo la cantidad de cuotas que el usuario solicito.
      let tasaInteres = calculoInteres(cuotas);
      let precioCuota = calculoCuotas(monto, tasaInteres, cuotas);
      let precioCuotaSinDecimales = Math.floor(precioCuota);
      //Con esta funcion calculo el valor de las cuotas:
      totalCuotas.push(new valoresDeCuotas(i, precioCuotaSinDecimales));

      //Hago una verificacion de que se este almacenando el valor de cada cuota
      console.log("Precio cuota " + precioCuotaSinDecimales);
    }
    //Creo un objeto para almacenar valores del prestamo.
    let tasaInteres = calculoInteres(cuotas);
    let precioCuota = calculoCuotas(monto, tasaInteres, cuotas);
    let precioCuotaSinDecimales = Math.floor(precioCuota);
    let devolucionTotal = devolucion(precioCuota, cuotas);
    const valores = { montoTotal: devolucionTotal, precioCuota: precioCuotaSinDecimales };
    console.log("Verifico el objeto: " + Object.values(valores));

    //Almaceno el array de objetos en un sessionstorage:
    sessionStorage.setItem("totalCuotas", JSON.stringify(totalCuotas));

    //Recupero el array de objetos del JSON:
    var totalCuotasRecuperado = JSON.parse(
      sessionStorage.getItem("totalCuotas")
    );
    //convertir el array de objetos a una cadena JSON
    let totalCuotasJson = JSON.stringify(totalCuotasRecuperado);

    //Verifico que el array se alla recuperado correctamente:
    console.log("Array recupe rado" + totalCuotasJson);

    //Atravez de este foreach se muestra en la pagina el numero de la cuota y su valor:
    totalCuotasRecuperado.forEach((cuota) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
      <td>${cuota.id}</td>
      <td>$${cuota.precioCuotaSinDecimales}</td>
      `;
      cuerpoTabla.appendChild(fila);
      
      /*let div = document.createElement("div");
      div.innerHTML = `
            <h5>Precio cuota: ${cuota.id} : $ ${cuota.precioCuotaSinDecimales}</h5>
            `;
      contenedor2.append(div); */
    });

    //Muestro en la pagina el monto total a devolver:
    let montoTotalHtml = document.getElementById("montoTotalHtml");
    montoTotalHtml.innerHTML = "En total devolvera: $" + devolucionTotal;

    //Se le consulta al usuario si quiere ver el valor de una cuota en particular:
    let consultaUsuario = document.getElementById("consultaUsuario");
    consultaUsuario.innerHTML =
      "Ingrese el numero de la cuota que desea verificar: ";
    let div = document.createElement("div");
    div.innerHTML = `
            <input type="text" id="respuestaUsuario">
            <button id="botonConsulta" class="btn btn-success">Consultar</button>
        `;
    contenedor3.append(div);

    //Al darle click al boton para la consulta se ejecuta lo siguiente:
    let botonConsulta = document.getElementById("botonConsulta");
    botonConsulta.addEventListener("click", () => {
      //Tomo el valor que el usuario ingreso en ese input
      let respuestaUsuario = document.getElementById("respuestaUsuario").value;
      console.log("Respuesta user: " + respuestaUsuario);      

      //Verifico que el numero ingresado por el usuario es igual o menor a la cantidad de cuotas que selecciono anteriormente:
      if (respuestaUsuario <= cuotas && respuestaUsuario != 0) {
        //Hago la busqueda en el array de la cuota que el usuario eligio:
        let cuotaEncontrada = encontrarCuota(respuestaUsuario, totalCuotasRecuperado);
        console.log("Resultado de busqueda en array: " + cuotaEncontrada);

        let precioCuotaHtml = document.getElementById("precioCuotaHtml");
        precioCuotaHtml.innerHTML =
          "Precio cuota " + respuestaUsuario + ": $" + precioCuotaSinDecimales;
      } else {        
        Toastify({
          text: "Verifique el numero de cuota que consulto",      
          duration: 3000,
          style: {
            background: "linear-gradient(to right, #e74c3c, #000000)",      
          }}).showToast();
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "¡El numero maximo de cuotas permitido es 12!"
    });
  }
};

//Calcula el interes de acuerdo las cuotas solicitadas.
function calculoInteres(cuotas) {
  let tasaInteres;
  switch (cuotas) {
    case 3:
      tasaInteres = 0.3;
      break;
    case 6:
      tasaInteres = 0.6;
      break;
    case 12:
      tasaInteres = 0.9;
      break;
    default:
      tasaInteres = 0;
  }
  return tasaInteres;
}

//Calcula el precio de cada cuota.
function calculoCuotas(monto, tasaInteres, cuotas) {
  //let interes = tasaInteres * 100;
  let precioCuota = (monto * (1 + tasaInteres)) / cuotas;
  return precioCuota;
}

//Calcula el monto total que el usuario debe devolver.

function devolucion(precioCuota, cuotas) {
  let total = precioCuota * cuotas;
  return total;
}

// Función para encontrar la cuota por su ID
function encontrarCuota(respuestaUsuario, totalCuotasRecuperado) {
  return totalCuotasRecuperado.find(cuota => cuota.id === respuestaUsuario);
}