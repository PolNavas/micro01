document.addEventListener('DOMContentLoaded', () => {
    const listaAlumnos = document.getElementById('listaAlumnos');
    const eliminarForm = document.querySelector('form');

    // Función para cargar alumnos activos en el <select>
    function cargarAlumnosActivos() {
        fetch('http://localhost:3000/alumnosActivos')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los alumnos activos');
                }
                return response.json();
            })
            .then((alumnos) => {
                // Limpiar el <select>
                listaAlumnos.innerHTML = '';

                // Agregar una opción por defecto
                listaAlumnos.innerHTML = '<option value="">Seleccione un alumno</option>';

                // Agregar las opciones dinámicamente
                alumnos.forEach((alumno) => {
                    const option = document.createElement('option');
                    option.value = alumno.Id_usuario;
                    option.textContent = `${alumno.Nombre} ${alumno.Apellido}`;
                    listaAlumnos.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar alumnos:', error);
                alert('Error al cargar los alumnos activos.');
            });
    }

    // Función para cambiar el estado del alumno a inactivo
    function cambiarEstadoAlumno(alumnoId) {
        fetch(`http://localhost:3000/alumnos/cambiarEstado/${alumnoId}`, {
            method: 'PUT',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al cambiar el estado del alumno.');
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                console.log('Respuesta del servidor:', data);

                // Recargar la lista de alumnos
                cargarAlumnosActivos();
            })
            .catch((error) => {
                console.error('Error al cambiar el estado del alumno:', error);
                alert('Error al cambiar el estado del alumno.');
            });
    }

    // Escuchar el evento submit del formulario
    eliminarForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const alumnoId = listaAlumnos.value;

        if (!alumnoId) {
            alert('Seleccione un alumno.');
            return;
        }

        if (confirm('¿Estás seguro de que deseas cambiar este alumno a inactivo?')) {
            cambiarEstadoAlumno(alumnoId);
        }
    });

    // Cargar los alumnos activos al cargar la página
    cargarAlumnosActivos();
});
