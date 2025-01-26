// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearAlumnoForm');

    // Escuchar el evento 'submit' del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

        // Capturar los valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const contrasena = document.getElementById('contraseña').value.trim();
        const imagen = document.getElementById('imagen').files[0];

        // Validar los campos
        if (!nombre || !apellidos || !contrasena) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Crear un objeto FormData para enviar los datos
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('apellidos', apellidos);
        formData.append('contrasena', contrasena);
        if (imagen) {
            formData.append('imagen', imagen);
        }

        // Enviar los datos al servidor
        fetch('http://localhost:3000/crearAlumno', {
            method: 'POST',
            body: formData,
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
                console.error('Error al crear el alumno:', error);
                alert(`Ocurrió un error: ${error.message}`);
            });
    });
});

document.getElementById('imagen').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Crear o actualizar una vista previa de la imagen
            let preview = document.getElementById('imagenPreview');
            if (!preview) {
                preview = document.createElement('img');
                preview.id = 'imagenPreview';
                preview.style.maxWidth = '200px';
                preview.style.marginTop = '10px';
                e.target.parentNode.appendChild(preview);
            }
            preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
