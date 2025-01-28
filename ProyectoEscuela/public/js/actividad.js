document.addEventListener('DOMContentLoaded', () => {
    const actividadId = new URLSearchParams(window.location.search).get('id');
    const archivoInput = document.getElementById('archivo');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!actividadId || !user) {
        alert('No se encontró la actividad o usuario.');
        return;
    }

    // Cargar los datos de la actividad
    function cargarDatosActividad(id) {
        fetch(`http://localhost:3000/actividades/actividad/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la actividad');
                }
                return response.json();
            })
            .then((actividad) => {
                console.log('Datos de la actividad recibidos:', actividad);

                // Actualizar los campos del HTML con los datos de la actividad
                document.getElementById('nombreActividad').textContent = actividad.Nombre || 'Sin nombre';
                document.getElementById('descripcionActividad').textContent = actividad.Descripcion || 'Sin descripción';
                document.getElementById('fechaInicio').textContent = actividad.Fecha || 'Sin fecha';
                document.getElementById('fechaFin').textContent = actividad.Fecha_Entrega || 'Sin fecha';
            })
            .catch((error) => {
                console.error('Error al cargar datos de la actividad:', error);
                alert('Error al cargar los datos de la actividad.');
            });
    }

    // Subir archivo relacionado con la actividad
    document.querySelector('.boton button').addEventListener('click', (e) => {
        e.preventDefault();
    
        const archivo = document.getElementById('archivo').files[0];
        const actividadId = new URLSearchParams(window.location.search).get('id');
        const user = JSON.parse(localStorage.getItem('user'));
    
        if (!archivo) {
            alert('Por favor, selecciona un archivo PDF.');
            return;
        }
    
        console.log('Archivo seleccionado:', archivo);
        console.log('Actividad ID:', actividadId);
        console.log('Usuario desde localStorage:', user);
    
        const formData = new FormData();
        formData.append('usuarioId', user.Id_usuario); // Usuario desde localStorage
        formData.append('actividadId', actividadId); // Actividad desde la URL
        formData.append('archivo', archivo); // El archivo debe llamarse "archivo"
        
        fetch('http://localhost:3000/subirArchivoActividad', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text || 'Error desconocido.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                console.log('Archivo subido exitosamente:', data);
            })
            .catch((error) => {
                console.error('Error al subir el archivo:', error);
                alert(`Error al subir el archivo: ${error.message}`);
            });
        
        
    });
    

    // Ejecutar al cargar la página
    cargarDatosActividad(actividadId);
});
