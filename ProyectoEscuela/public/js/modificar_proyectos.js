const formulario = document.getElementById('proyectoForm'); 
document.addEventListener('DOMContentLoaded', () => {
    const listaProyectos = document.getElementById('listaProyectos');

    // Cargar proyectos en el <select>
    function cargarProyectos() {
        fetch('http://localhost:3000/proyectos')
            .then((response) => {
                console.log('Respuesta de cargar proyectos:', response);
                if (!response.ok) {
                    throw new Error('Error al obtener los proyectos');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Proyectos obtenidos:', data); // Verificar los proyectos obtenidos
                listaProyectos.innerHTML = '<option value="">Seleccione un proyecto</option>';
                data.proyectos.forEach((proyecto) => {
                    const option = document.createElement('option');
                    option.value = proyecto.Id_Proyecto;
                    option.textContent = proyecto.Nombre;
                    listaProyectos.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar proyectos:', error);
                alert('Error al cargar los proyectos.');
            });
    }

    // Cargar los datos de un proyecto en el formulario
    function cargarDatosProyecto(proyectoId) {
        fetch(`http://localhost:3000/proyectos/${proyectoId}`)
            .then((response) => {
                console.log('Respuesta del servidor:', response); // Verificar la respuesta completa
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del proyecto');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Datos del proyecto recibido:', data); // Verificar los datos del proyecto
                if (data.proyectos && data.proyectos.length > 0) {
                    const proyecto = data.proyectos[0]; // Acceder al primer proyecto en el array
                    document.getElementById('nombre').value = proyecto.Nombre || '';
                    document.getElementById('descripcion').value = proyecto.Descripcion || '';
                    document.getElementById('fecha').value = proyecto.Fecha.split('T')[0] || ''; // Ajustar formato de fecha
                    document.getElementById('fecha_entrega').value = proyecto.Fecha_Entrega.split('T')[0] || ''; // Ajustar formato de fecha
                } else {
                    alert('No se encontraron datos para el proyecto seleccionado.');
                }
            })
            .catch((error) => {
                console.error('Error al cargar los datos del proyecto:', error);
                alert('Error al cargar los datos del proyecto.');
            });
    }
    

    // Evento al cambiar el proyecto seleccionado
    listaProyectos.addEventListener('change', (e) => {
        const proyectoId = e.target.value;
        console.log('Proyecto seleccionado con ID:', proyectoId);

        if (proyectoId) {
            cargarDatosProyecto(proyectoId); // Llama a la función ahora definida
        } else {
            formulario.reset(); // Limpiar el formulario si no se selecciona un proyecto
        }
    });

    // Cargar los proyectos al cargar la página
    cargarProyectos();
});
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const proyectoId = listaProyectos.value;
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha = document.getElementById('fecha').value;
    const fechaEntrega = document.getElementById('fecha_entrega').value;

    console.log('Datos enviados:', { proyectoId, nombre, descripcion, fecha, fechaEntrega });

    if (!proyectoId || !nombre || !descripcion || !fecha || !fechaEntrega) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const proyectoData = {
        nombre,
        descripcion,
        fecha,
        fecha_entrega: fechaEntrega,
    };

    fetch(`http://localhost:3000/proyectos/${proyectoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(proyectoData),
    })
        .then((response) => {
            console.log('Respuesta del servidor:', response);
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
        })
        .catch((error) => {
            console.error('Error al actualizar el proyecto:', error);
            alert(`Error al actualizar el proyecto: ${error.message}`);
        });
});
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const proyectoId = listaProyectos.value;
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha = document.getElementById('fecha').value;
    const fechaEntrega = document.getElementById('fecha_entrega').value;

    console.log('Datos enviados:', { proyectoId, nombre, descripcion, fecha, fechaEntrega });

    if (!proyectoId || !nombre || !descripcion || !fecha || !fechaEntrega) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const proyectoData = {
        nombre,
        descripcion,
        fecha,
        fecha_entrega: fechaEntrega,
    };

    fetch(`http://localhost:3000/proyectos/${proyectoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(proyectoData),
    })
        .then((response) => {
            console.log('Respuesta del servidor:', response);
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
        })
        .catch((error) => {
            console.error('Error al actualizar el proyecto:', error);
            alert(`Error al actualizar el proyecto: ${error.message}`);
        });
});
