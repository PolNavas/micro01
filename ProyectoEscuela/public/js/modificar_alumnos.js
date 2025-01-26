document.addEventListener('DOMContentLoaded', () => {
    const listaAlumnos = document.getElementById('listaAlumnos');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');

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

    // Función para cargar los datos de un alumno en el formulario
    function cargarDatosAlumno(alumnoId) {
        fetch(`http://localhost:3000/usuario/${alumnoId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del alumno');
                }
                return response.json();
            })
            .then((alumno) => {
                // Llenar el formulario con los datos del alumno
                nombreInput.value = alumno.Nombre;
                apellidosInput.value = alumno.Apellido;
            })
            .catch((error) => {
                console.error('Error al cargar datos del alumno:', error);
                alert('Error al cargar los datos del alumno.');
            });
    }

    // Escuchar el cambio de selección en el <select>
    listaAlumnos.addEventListener('change', (e) => {
        const alumnoId = e.target.value;

        if (alumnoId) {
            cargarDatosAlumno(alumnoId);
        } else {
            // Limpiar el formulario si no hay selección
            nombreInput.value = '';
            apellidosInput.value = '';
        }
    });

    // Cargar los alumnos activos al cargar la página
    cargarAlumnosActivos();
});
document.getElementById('perfilForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    // Obtener los valores del formulario
    const alumnoId = document.getElementById('listaAlumnos').value;
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();

    // Validar los campos
    if (!alumnoId) {
        alert('Seleccione un alumno.');
        return;
    }

    if (!nombre || !apellidos) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Enviar datos al backend
    fetch(`http://localhost:3000/usuario/${alumnoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellidos }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error al actualizar los datos del alumno.');
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
            console.error('Error al actualizar los datos del alumno:', error);
            alert('Error al actualizar los datos del alumno.');
        });
});
