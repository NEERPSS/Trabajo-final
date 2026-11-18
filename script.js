// ============================================
// FUNCIÓN GENERAL: muestra un mensaje en la página
// ============================================
function mostrar(id, texto, clase) {
  const elemento = document.getElementById(id);
  elemento.textContent = texto;
  elemento.className = "resultado " + clase;
}

// ============================================
// SISTEMA DE AUTENTICACIÓN (LOGIN, REGISTRO, RECUPERACIÓN)
// ============================================
const usuariosPorDefecto = [
  { nombre: "Operador Central", correo: "operador@teleferico.bo", usuario: "operador", linea: "Línea Roja", password: "1234" }
];

let usuarios = JSON.parse(localStorage.getItem("usuariosTeleferico")) || usuariosPorDefecto;
if (!localStorage.getItem("usuariosTeleferico")) {
  localStorage.setItem("usuariosTeleferico", JSON.stringify(usuarios));
}

const pantallaAuth = document.getElementById("pantallaAuth");
const appPrincipal = document.getElementById("appPrincipal");
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const vistaRecuperar = document.getElementById("vistaRecuperar");
const formBuscarCuenta = document.getElementById("formBuscarCuenta");
const formResetPass = document.getElementById("formResetPass");

let usuarioEnRecuperacion = null;

function entrarAlSistema(userObj) {
  sessionStorage.setItem("sesionTeleferico", JSON.stringify(userObj));
  document.getElementById("usuarioActivo").textContent = "🚠 " + userObj.nombre + " (" + userObj.linea + ")";
  pantallaAuth.hidden = true;
  appPrincipal.hidden = false;
}

function cambiarVistaAuth(vista) {
  formLogin.hidden = vista !== "login";
  formRegistro.hidden = vista !== "registro";
  vistaRecuperar.hidden = vista !== "recuperar";

  mostrar("msgLogin", "", "");
  mostrar("msgRegistro", "", "");
  mostrar("msgRecBuscar", "", "");
  mostrar("msgRecReset", "", "");

  if (vista === "recuperar") {
    formBuscarCuenta.hidden = false;
    formResetPass.hidden = true;
    formBuscarCuenta.reset();
    formResetPass.reset();
  }
}

document.getElementById("irRegistro").addEventListener("click", () => cambiarVistaAuth("registro"));
document.getElementById("irRecuperar").addEventListener("click", () => cambiarVistaAuth("recuperar"));
document.querySelectorAll(".volver-login").forEach((btn) => {
  btn.addEventListener("click", () => cambiarVistaAuth("login"));
});

// Mostrar / Ocultar contraseña (ojito)
document.querySelectorAll(".btn-ojo").forEach((btn) => {
  btn.addEventListener("click", function () {
    const input = document.getElementById(this.dataset.target);
    if (input.type === "password") {
      input.type = "text";
      this.textContent = "🙈";
    } else {
      input.type = "password";
      this.textContent = "👁️";
    }
  });
});

// Iniciar sesión (permite buscar por usuario o correo)
formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const credencialTxt = document.getElementById("loginUser").value.trim().toLowerCase();
  const passTxt = document.getElementById("loginPass").value;

  const encontrado = usuarios.find(
    (u) => (u.usuario.toLowerCase() === credencialTxt || u.correo.toLowerCase() === credencialTxt) && u.password === passTxt
  );

  if (!encontrado) {
    mostrar("msgLogin", "Usuario/correo o contraseña incorrectos.", "danger");
    return;
  }

  entrarAlSistema(encontrado);
  formLogin.reset();
});

// Registro de nuevo operador (incluyendo correo)
formRegistro.addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("regNombre").value.trim();
  const correo = document.getElementById("regEmail").value.trim().toLowerCase();
  const usuario = document.getElementById("regUser").value.trim();
  const linea = document.getElementById("regLinea").value;
  const password = document.getElementById("regPass").value;

  if (password.length < 4) {
    mostrar("msgRegistro", "La contraseña debe tener al menos 4 caracteres.", "danger");
    return;
  }

  const yaExisteUser = usuarios.some((u) => u.usuario.toLowerCase() === usuario.toLowerCase());
  if (yaExisteUser) {
    mostrar("msgRegistro", "Ese nombre de usuario ya está registrado.", "danger");
    return;
  }

  const yaExisteCorreo = usuarios.some((u) => u.correo.toLowerCase() === correo);
  if (yaExisteCorreo) {
    mostrar("msgRegistro", "Ese correo electrónico ya está registrado.", "danger");
    return;
  }

  const nuevoUsuario = { nombre, correo, usuario, linea, password };
  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuariosTeleferico", JSON.stringify(usuarios));

  mostrar("msgRegistro", "¡Operador registrado! Ingresando a sala de control...", "ok");
  setTimeout(() => {
    formRegistro.reset();
    entrarAlSistema(nuevoUsuario);
  }, 800);
});

// Recuperación paso 1: Buscar cuenta por usuario o correo
formBuscarCuenta.addEventListener("submit", function (e) {
  e.preventDefault();
  const buscado = document.getElementById("recUser").value.trim().toLowerCase();
  const cuenta = usuarios.find((u) => u.usuario.toLowerCase() === buscado || u.correo.toLowerCase() === buscado);

  if (!cuenta) {
    mostrar("msgRecBuscar", "No encontramos ninguna cuenta con ese usuario o correo.", "danger");
    return;
  }

  usuarioEnRecuperacion = cuenta;
  document.getElementById("recNombreEncontrado").textContent = cuenta.nombre + " (@" + cuenta.usuario + ")";
  document.getElementById("recDetalleEncontrado").textContent = "Correo: " + cuenta.correo + " | " + cuenta.linea;

  formBuscarCuenta.hidden = true;
  formResetPass.hidden = false;
});

// Recuperación paso 2: Guardar nueva contraseña
formResetPass.addEventListener("submit", function (e) {
  e.preventDefault();
  const nuevaPass = document.getElementById("recNuevaPass").value;

  if (nuevaPass.length < 4) {
    mostrar("msgRecReset", "La nueva contraseña debe tener al menos 4 caracteres.", "danger");
    return;
  }

  usuarioEnRecuperacion.password = nuevaPass;
  localStorage.setItem("usuariosTeleferico", JSON.stringify(usuarios));

  mostrar("msgRecReset", "Contraseña actualizada correctamente. Redirigiendo...", "ok");
  setTimeout(() => {
    cambiarVistaAuth("login");
  }, 1000);
});

// Cerrar sesión
document.getElementById("btnCerrarSesion").addEventListener("click", function () {
  sessionStorage.removeItem("sesionTeleferico");
  appPrincipal.hidden = true;
  pantallaAuth.hidden = false;
  cambiarVistaAuth("login");
});

// Mantener sesión si recarga la página
const sesionGuardada = JSON.parse(sessionStorage.getItem("sesionTeleferico"));
if (sesionGuardada) {
  entrarAlSistema(sesionGuardada);
}

// ============================================
// MENÚ TIPO CAJA (DESPLEGABLE DE MÓDULOS)
// ============================================
const btnMenuCaja = document.getElementById("btnMenuCaja");
const panelCaja = document.getElementById("panelCaja");

btnMenuCaja.addEventListener("click", function (e) {
  e.stopPropagation();
  const abierto = !panelCaja.hidden;
  panelCaja.hidden = abierto;
  btnMenuCaja.setAttribute("aria-expanded", String(!abierto));
});

// Cerrar la caja al elegir un módulo o hacer clic fuera
panelCaja.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    panelCaja.hidden = true;
    btnMenuCaja.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", function (e) {
  if (!panelCaja.hidden && !panelCaja.contains(e.target) && e.target !== btnMenuCaja) {
    panelCaja.hidden = true;
    btnMenuCaja.setAttribute("aria-expanded", "false");
  }
});

// ============================================
// MÓDULO 1: DETENCIÓN DE EMERGENCIA
// ============================================
function calcularDistancia(velocidad, tiempo) {
  return (velocidad / 3.6) * tiempo;
}

document.getElementById("formEmergencia").addEventListener("submit", function (e) {
  e.preventDefault();

  const v = parseFloat(document.getElementById("vel").value);
  const t = parseFloat(document.getElementById("tr").value);

  if (isNaN(v) || isNaN(t) || v < 0 || t < 0) {
    mostrar("resEmergencia", "Error: escribe números válidos (no vacíos ni negativos).", "danger");
    return;
  }

  const d = calcularDistancia(v, t);
  if (d > 40) {
    mostrar("resEmergencia", "Distancia: " + d.toFixed(1) + " m. ALERTA (supera el umbral ficticio de 40 m).", "danger");
  } else {
    mostrar("resEmergencia", "Distancia: " + d.toFixed(1) + " m. Dentro del rango didáctico.", "ok");
  }
});

// ============================================
// MÓDULO 2: MANTENIMIENTO
// ============================================
const mantenimiento = JSON.parse(localStorage.getItem("mantenimiento")) || [];

function mostrarMantenimiento() {
  const tbody = document.getElementById("tbodyMant");
  tbody.innerHTML = "";

  mantenimiento.forEach(function (item, posicion) {
    tbody.innerHTML +=
      "<tr>" +
      "<td>" + item.componente + "</td>" +
      "<td>" + item.horas + "</td>" +
      "<td>" + item.estado + "</td>" +
      "<td><button onclick='eliminarComponente(" + posicion + ")'>Eliminar</button></td>" +
      "</tr>";
  });
}

function eliminarComponente(posicion) {
  mantenimiento.splice(posicion, 1);
  localStorage.setItem("mantenimiento", JSON.stringify(mantenimiento));
  mostrarMantenimiento();
  mostrar("msgMant", "Registro eliminado.", "ok");
}

document.getElementById("formMant").addEventListener("submit", function (e) {
  e.preventDefault();

  const componente = document.getElementById("comp").value.trim();
  const horas = parseFloat(document.getElementById("horas").value);
  const estado = document.getElementById("estadoMant").value;

  if (componente === "") {
    mostrar("msgMant", "Error: escribe el nombre del componente.", "danger");
    return;
  }
  if (isNaN(horas) || horas < 0) {
    mostrar("msgMant", "Error: las horas deben ser un número válido.", "danger");
    return;
  }

  mantenimiento.push({ componente: componente, horas: horas, estado: estado });
  localStorage.setItem("mantenimiento", JSON.stringify(mantenimiento));
  mostrarMantenimiento();
  mostrar("msgMant", "Registro agregado.", "ok");
  e.target.reset();
});

// ============================================
// MÓDULO 3: VIENTO Y OSCILACIÓN
// ============================================
document.getElementById("formViento").addEventListener("submit", function (e) {
  e.preventDefault();

  const mediciones = [];
  for (let i = 1; i <= 5; i++) {
    const valor = parseFloat(document.getElementById("v" + i).value);
    if (isNaN(valor) || valor < 0) {
      mostrar("resViento", "Error en la medición " + i + ": escribe un número válido.", "danger");
      return;
    }
    mediciones.push(valor);
  }

  let suma = 0;
  let maximo = mediciones[0];
  for (let i = 0; i < mediciones.length; i++) {
    suma = suma + mediciones[i];
    if (mediciones[i] > maximo) {
      maximo = mediciones[i];
    }
  }
  const promedio = suma / mediciones.length;

  let clasificacion = "Viento leve";
  let clase = "ok";
  if (promedio >= 45) {
    clasificacion = "Viento fuerte (en simulación se suspendería el servicio)";
    clase = "danger";
  } else if (promedio >= 25) {
    clasificacion = "Viento moderado";
    clase = "warn";
  }

  mostrar("resViento", "Promedio: " + promedio.toFixed(1) + " km/h | Máximo: " + maximo + " km/h | " + clasificacion, clase);
});

// ============================================
// MÓDULO 4: SENSORES
// ============================================
const sensores = JSON.parse(localStorage.getItem("sensores")) || [];
const patronSensor = /^SEN-\d{3}$/;

function mostrarSensores() {
  const tbody = document.getElementById("tbodySensor");
  tbody.innerHTML = "";
  sensores.forEach(function (s) {
    tbody.innerHTML += "<tr><td>" + s.codigo + "</td><td>" + s.tipo + "</td><td>" + s.lectura + "</td></tr>";
  });
}

document.getElementById("formSensor").addEventListener("submit", function (e) {
  e.preventDefault();

  const codigo = document.getElementById("cod").value.trim();
  const tipo = document.getElementById("tipo").value;
  const lectura = parseFloat(document.getElementById("lect").value);

  if (codigo === "") {
    mostrar("msgSensor", "Error: el código está vacío.", "danger");
    return;
  }
  if (!patronSensor.test(codigo)) {
    mostrar("msgSensor", "Error: el código debe tener el formato SEN-001.", "danger");
    return;
  }
  if (isNaN(lectura)) {
    mostrar("msgSensor", "Error: la lectura debe ser un número.", "danger");
    return;
  }

  sensores.push({ codigo: codigo, tipo: tipo, lectura: lectura });
  localStorage.setItem("sensores", JSON.stringify(sensores));
  mostrarSensores();
  mostrar("msgSensor", "Sensor " + codigo + " registrado.", "ok");
  e.target.reset();
});

// ============================================
// EXTRAS DE SALA DE CONTROL: reloj y parada general
// ============================================
function actualizarReloj() {
  document.getElementById("reloj").textContent = new Date().toLocaleTimeString("es-BO");
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

let paradaActiva = false;
document.getElementById("btnParada").addEventListener("click", function () {
  paradaActiva = !paradaActiva;
  document.getElementById("banner").hidden = !paradaActiva;
  this.textContent = paradaActiva ? "Reanudar servicio" : "Parada general (simulada)";
});

// Cargar datos guardados
mostrarMantenimiento();
mostrarSensores();