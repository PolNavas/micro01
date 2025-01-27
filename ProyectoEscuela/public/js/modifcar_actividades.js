document.addEventListener('DOMContentLoaded', () => {
    const listaActividades = document.getElementById('listaActividades');
    const actividadForm = document.getElementById('actividadForm');

    // Función para cargar actividades en el <select>
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

    // Función para cargar los datos de una actividad en el formulario
    function cargarDatosActividad(actividadId) {
        fetch(`http://localhost:3000/actividades/actividad/${actividadId}`) // Ruta correcta
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la actividad');
                }
                return response.json();
            })
            .then((actividad) => {
                console.log('Datos de la actividad recibidos:', actividad);

                // Verifica si los elementos existen
                const nombreInput = document.getElementById('nombre');
                const descripcionInput = document.getElementById('descripcion');
                const fechaInput = document.getElementById('fecha');
                const fechaEntregaInput = document.getElementById('fechaEntrega');

                if (!nombreInput || !descripcionInput || !fechaInput || !fechaEntregaInput) {
                    throw new Error('Faltan elementos en el formulario HTML.');
                }

                // Función para formatear las fechas
                const formatFecha = (fecha) => {
                    if (!fecha) return '';
                    return fecha.includes('T') ? fecha.split('T')[0] : fecha;
                };

                // Rellena los datos en el formulario
                nombreInput.value = actividad.Nombre || '';
                descripcionInput.value = actividad.Descripcion || '';
                fechaInput.value = formatFecha(actividad.Fecha);
                fechaEntregaInput.value = formatFecha(actividad.Fecha_Entrega);

                console.log('Formulario actualizado correctamente.');
            })
            .catch((error) => {
                console.error('Error al cargar datos de la actividad:', error);
                alert('Error al cargar los datos de la actividad.');
            });
    }

    // Escuchar el cambio de selección en el <select>
    listaActividades.addEventListener('change', (e) => {
        const actividadId = e.target.value;
        console.log('Actividad seleccionada con ID:', actividadId); // Verifica el ID seleccionado

        if (actividadId) {
            cargarDatosActividad(actividadId);
        } else {
            actividadForm.reset(); // Limpiar el formulario si no se selecciona una actividad
            console.log('Formulario reseteado porque no se seleccionó ninguna actividad.');
        }
    });

    // Manejar el envío del formulario
    actividadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const actividadId = listaActividades.value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const fechaEntrega = document.getElementById('fechaEntrega').value;

        console.log('Datos enviados:', { actividadId, nombre, descripcion, fecha, fechaEntrega });

        if (!actividadId || !nombre || !descripcion || !fecha || !fechaEntrega) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        fetch(`http://localhost:3000/actividades/${actividadId}`, { // Asegúrate de que esta ruta esté bien definida en el backend
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, descripcion, fecha, fecha_entrega: fechaEntrega }),
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
                console.log('Respuesta exitosa del servidor:', data);
                alert(data.message);
                cargarActividades(); // Recargar actividades para reflejar cambios
            })
            .catch((error) => {
                console.error('Error al actualizar la actividad:', error);
                alert(`Error al actualizar la actividad: ${error.message}`);
            });
    });

    // Cargar actividades al iniciar la página
    cargarActividades();
});
