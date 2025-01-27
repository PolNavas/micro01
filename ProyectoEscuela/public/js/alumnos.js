const user = JSON.parse(localStorage.getItem('user'));

if (user) {
    // Mostrar los datos del usuario en la página
    document.getElementById('username').textContent = user.Nombre;
} else {
    // Si no hay datos del usuario, redirigir al login
    window.location.href = '../index.html';
}

// Función para generar el contenido de un proyecto
function renderProyecto(proyecto) {
    const proyectoElement = document.createElement('div');
    proyectoElement.classList.add('proyectos');

    proyectoElement.innerHTML = `
            <div class="gestion-proyecto">
                <div class="gestion_icono-proyecyo"><div class="fondo-proyecto"><img src="../Img/programacion.png" alt="icono-group"></div></div>
                <div class="gestion_titulo-proyecto"><h3>${proyecto.Nombre}</h3></div>
            </div>

            <p id="Descripcion" >${proyecto.Descripcion || 'Sin descripción disponible'}</p>
            <p id="Fechas">Fechas: ${proyecto.Fecha_Inicio || 'N/A'} - ${proyecto.Fecha_Fin || 'N/A'}</p>
            <p id="CantidadDeActividades">Actividades: ${proyecto.CantidadDeActividades || 'N/A'}</p>
            <div class="info_boton2">
                <a href="../html/proyectos.html?proyectoId=${proyecto.Id_Proyecto}">Ver Proyecto</a>
            </div>
        </div>
    `;
    return proyectoElement;
}

// Función para cargar los proyectos desde el backend
function cargarProyectos(userId) {
    const proyectosContainer = document.getElementById('proyectosContainer');
    proyectosContainer.classList.remove("proyectos");

    fetch(`http://localhost:3000/proyectos/${userId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Comprobar si hay proyectos
            if (data.proyectos && data.proyectos.length > 0) {
                data.proyectos.forEach((proyecto) => {
                    const proyectoElement = renderProyecto(proyecto);
                    proyectosContainer.appendChild(proyectoElement);
                });
            } else {
                proyectosContainer.innerHTML = '<p>No hay proyectos asignados.</p>';
            }
        })
        .catch((error) => {
            console.error('Error al obtener los proyectos:', error);
            proyectosContainer.innerHTML = '<p>Error al cargar los proyectos. Por favor, inténtalo más tarde.</p>';
        });
}

// Comprobar si el usuario es un profesor
if (user) {
    cargarProyectos(user.Id_usuario);
} else {
    // Redirigir si no es un profesor
    alert('Acceso denegado. Esta página es solo para profesores.');
    window.location.href = '/';
}
