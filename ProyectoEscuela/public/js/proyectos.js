// Obtener el proyectoId de la URL
const urlParams = new URLSearchParams(window.location.search);
const proyectoId = urlParams.get('proyectoId');

if (!proyectoId) {
    alert('No se especificó un proyecto válido.');
    window.location.href = '../index.html'; // Redirigir si falta el proyectoId
}

document.addEventListener('DOMContentLoaded', () => {
    const actividadesContainer = document.getElementById('actividadesContainer');
    const tituloProyecto = document.querySelector('.titulo h1'); // Contenedor del nombre del proyecto

    
    function renderItem(item) {
        return `
            <li>
                ${item.NombreItem} - ${item.Porcentaje}%
            </li>
        `;
    }

    // Función para renderizar una actividad con sus ítems
    function renderActividad(actividad) {
        const itemsHtml = actividad.Items.map(renderItem).join('');
        return `
            <div class="proyectos">
                <div class="gestion-proyecto">
                    <div class="gestion_titulo-proyecto">
                    <a href="actividades.html?id=${actividad.Id_Actividad}">Ver Actividad</a>
                        <h3>${actividad.NombreActividad}</h3>
                    </div>
                    <ul>${itemsHtml}</ul>
                </div>
            </div>
        `;
    }

    // Función para cargar actividades desde el backend
    function cargarActividades(proyectoId) {
        fetch(`http://localhost:3000/actividades/${proyectoId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                // Mostrar el nombre del proyecto
                tituloProyecto.textContent = data.nombreProyecto;

                // Mostrar las actividades y sus ítems
                if (data.actividades && data.actividades.length > 0) {
                    const actividadesHtml = data.actividades.map(renderActividad).join('');
                    actividadesContainer.innerHTML = actividadesHtml;
                } else {
                    actividadesContainer.innerHTML = '<p>No se encontraron actividades ni ítems.</p>';
                }
            })
            .catch((error) => {
                console.error('Error al obtener las actividades:', error);
                tituloProyecto.textContent = 'Error al cargar el proyecto';
                actividadesContainer.innerHTML = '<p>Error al cargar las actividades. Por favor, inténtalo más tarde.</p>';
            });
    }

    // Cargar actividades
    cargarActividades(proyectoId);
});
