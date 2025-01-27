document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearAlumnoForm');
    const imagenInput = document.getElementById('imagen');
    const imagenPreview = document.getElementById('imagenPreview');

    // Mostrar vista previa de la imagen seleccionada
    imagenInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagenPreview.src = event.target.result;
                imagenPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.src = '';
            imagenPreview.style.display = 'none';
        }
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir la recarga de la página

        const nombre = document.getElementById('nombre').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const contrasena = document.getElementById('contraseña').value.trim();
        const imagen = imagenInput.files[0];

        // Validar campos obligatorios
        if (!nombre || !apellidos || !contrasena) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Crear FormData para enviar los datos
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('apellidos', apellidos);
        formData.append('contrasena', contrasena);
        if (imagen) {
            formData.append('imagen', imagen);
        }

        // Enviar los datos al backend
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
                imagenPreview.src = ''; // Limpiar la vista previa
                imagenPreview.style.display = 'none';
            })
            .catch((error) => {
                console.error('Error al crear el alumno:', error);
                alert(`Error al crear el alumno: ${error.message}`);
            });
    });
});
