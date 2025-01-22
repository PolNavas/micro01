


//-------------------- 
// Seleccionar elementos del DOM
const slider = document.getElementById('slider_progreso');
const relleno = document.querySelector('.barra_progreso .relleno');
const valorProgreso = document.getElementById('valor_progreso');

// Función para cargar el progreso desde localStorage
function cargarProgreso() {
    const progresoGuardado = localStorage.getItem('progreso'); // Obtener el valor guardado
    if (progresoGuardado !== null) { // Verificar si existe en localStorage
        slider.value = progresoGuardado; // Actualizar el slider
        actualizarProgreso(progresoGuardado); // Actualizar la barra y el texto
    }
}

// Función para guardar el progreso en localStorage
function guardarProgreso(valor) {
    localStorage.setItem('progreso', valor); // Guardar el valor en localStorage
}

// Función para actualizar la barra de progreso y el texto
function actualizarProgreso(valor) {
    relleno.style.width = `${valor}%`; // Actualizar el ancho de la barra
    valorProgreso.textContent = `${valor}%`; // Mostrar el valor en texto
}

// Escuchar el cambio en el slider y guardar el progreso
slider.addEventListener('input', () => {
    const valor = slider.value; // Obtener el valor actual del slider
    actualizarProgreso(valor); // Actualizar la barra y el texto
    guardarProgreso(valor); // Guardar el valor en localStorage
});

// Cargar el progreso al inicio
cargarProgreso();
