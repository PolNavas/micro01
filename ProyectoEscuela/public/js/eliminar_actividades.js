document.addEventListener('DOMContentLoaded', () => {
    const listaActividades = document.getElementById('listaActividades');
    const eliminarActividadForm = document.getElementById('eliminarActividadForm');

    // Función para cargar actividades en el select
    function cargarActividades() {
        fetch('http://localhost:3000/actividades')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las actividades');
                }
                return response.json();
            })
            .then((data) => {
                listaActividades.innerHTML = '<option value="">Seleccione una actividad</option>';
                data.actividades.forEach((actividad) => {
                    const option = document.createElement('option');
                    option.value = actividad.Id_Actividad;
                    option.textContent = actividad.Nombre;
                    listaActividades.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar las actividades:', error);
                alert('Error al cargar las actividades.');
            });
    }

    // Manejar la eliminación de la actividad
    eliminarActividadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const actividadId = listaActividades.value;

        if (!actividadId) {
            alert('Por favor, seleccione una actividad para eliminar.');
            return;
        }

        if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
            return;
        }

        fetch(`http://localhost:3000/actividades_eliminar/${actividadId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text || 'Error al eliminar la actividad.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                cargarActividades(); // Recargar actividades en el select
            })
            .catch((error) => {
                console.error('Error al eliminar la actividad:', error);
                alert('Error al eliminar la actividad.');
            });
    });

    // Cargar actividades al cargar la página
    cargarActividades();
});
