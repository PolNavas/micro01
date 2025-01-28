document.addEventListener('DOMContentLoaded', () => {
    const listaProyectos = document.getElementById('listaAlumnos'); // Cambiar nombre id a "listaProyectos"
    const formulario = document.querySelector('form');

    // Cargar proyectos en el <select>
    function cargarProyectos() {
        fetch('http://localhost:3000/proyectos')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los proyectos.');
                }
                return response.json();
            })
            .then((data) => {
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

    // Manejar el envío del formulario para eliminar el proyecto
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const proyectoId = listaProyectos.value;
    
        if (!proyectoId) {
            alert('Por favor, seleccione un proyecto para eliminar.');
            return;
        }
    
        if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
            return;
        }
    
        console.log('Proyecto seleccionado para eliminar:', proyectoId); // Agregar log
    
        fetch(`http://localhost:3000/eliminar_proyecto/${proyectoId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                console.log('Respuesta del servidor:', response); // Agregar log
                if (!response.ok) {
                    return response.text().then((text) => {
                        console.error('Texto de error del servidor:', text); // Agregar log del texto del servidor
                        throw new Error('Error al eliminar el proyecto.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                console.log('Proyecto eliminado exitosamente:', data); // Agregar log
                cargarProyectos();
            })
            .catch((error) => {
                console.error('Error al eliminar el proyecto:', error);
                alert('Error al eliminar el proyecto.');
            });
    });
    

    // Cargar proyectos al cargar la página
    cargarProyectos();
});
