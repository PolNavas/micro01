document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearActividadForm');
    const listaProyectos = document.getElementById('listaProyectos');

    // Cargar proyectos dinámicamente al cargar la página
    fetch('http://localhost:3000/proyectos')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error al obtener los proyectos: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Iterar por los proyectos y agregarlos al select
            data.proyectos.forEach((proyecto) => {
                const option = document.createElement('option');
                option.value = proyecto.Id_Proyecto;
                option.textContent = proyecto.Nombre;
                listaProyectos.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error al cargar los proyectos:', error);
            alert('Error al cargar los proyectos.');
        });

    // Manejar el envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const fechaEntrega = document.getElementById('fecha_entrega').value;
        const proyectoId = listaProyectos.value;

        // Validar que todos los campos estén llenos
        if (!nombre || !descripcion || !fecha || !fechaEntrega || !proyectoId) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        const actividadData = {
            nombre,
            descripcion,
            fecha,
            fecha_entrega: fechaEntrega,
            proyectoId,
        };

        // Enviar datos al backend
        fetch('http://localhost:3000/crearActividad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(actividadData),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || 'Error desconocido');
                    });
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message); // Mostrar mensaje de éxito
                form.reset(); // Limpiar el formulario
            })
            .catch((error) => {
                console.error('Error al crear la actividad:', error);
                alert(`Error al crear la actividad: ${error.message}`);
            });
    });
});
