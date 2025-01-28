document.addEventListener('DOMContentLoaded', () => {
    const listaAlumnos = document.getElementById('listaAlumnos');
    const listaItems = document.getElementById('listaItems');
    const notasItemsForm = document.getElementById('notasItemsForm');

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

    // Función para cargar ítems en el select
    function cargarItems() {
        fetch('http://localhost:3000/items')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los ítems');
                }
                return response.json();
            })
            .then((data) => {
                listaItems.innerHTML = '<option value="">Seleccione un ítem</option>';
                data.items.forEach((item) => {
                    const option = document.createElement('option');
                    option.value = item.Id_Item;
                    option.textContent = item.Nombre;
                    listaItems.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar ítems:', error);
                alert('Error al cargar los ítems.');
            });
    }

    // Manejar el envío del formulario
    notasItemsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nota = document.getElementById('nota').value.trim();
        const alumnoId = listaAlumnos.value;
        const itemId = listaItems.value;

        if (!nota || !alumnoId || !itemId) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const notaData = { nota, alumnoId, itemId };

        fetch('http://localhost:3000/notas/items', {
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
                notasItemsForm.reset();
            })
            .catch((error) => {
                console.error('Error al asignar la nota:', error);
                alert('Error al asignar la nota.');
            });
    });

    // Cargar alumnos y ítems al iniciar la página
    cargarAlumnos();
    cargarItems();
});
