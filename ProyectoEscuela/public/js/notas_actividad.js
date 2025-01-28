document.addEventListener('DOMContentLoaded', () => {
    const listaAlumnos = document.getElementById('listaAlumnos');
    const listaActividades = document.getElementById('listaActividades');
    const NotasForm = document.getElementById('NotasForm');

    // Función para cargar alumnos en el select
    function cargarAlumnos() {
        fetch('http://localhost:3000/alumnosActivos')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los alumnos');
                }
                return response.json();
            })
            .then((data) => {
                listaAlumnos.innerHTML = '<option value="">Seleccione un alumno</option>';
                data.forEach((alumno) => {
                    const option = document.createElement('option');
                    option.value = alumno.Id_usuario;
                    option.textContent = `${alumno.Nombre} ${alumno.Apellido}`;
                    listaAlumnos.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar alumnos:', error);
                alert('Error al cargar los alumnos.');
            });
    }

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
                console.error('Error al cargar actividades:', error);
                alert('Error al cargar las actividades.');
            });
    }

    // Manejar el envío del formulario
    NotasForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nota = document.getElementById('nota').value.trim();
        const alumnoId = listaAlumnos.value;
        const actividadId = listaActividades.value;

        if (!nota || !alumnoId || !actividadId) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const notaData = { nota, alumnoId, actividadId };

        fetch('http://localhost:3000/notas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notaData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al asignar la nota.');
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                NotasForm.reset();
            })
            .catch((error) => {
                console.error('Error al asignar la nota:', error);
                alert('Error al asignar la nota.');
            });
    });

    // Cargar alumnos y actividades al iniciar la página
    cargarAlumnos();
    cargarActividades();
});
