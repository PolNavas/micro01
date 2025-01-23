document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellidos', document.getElementById('apellidos').value);
    formData.append('contraseña', document.getElementById('contraseña').value);
    formData.append('imagen', document.getElementById('imagen').files[0]);

    fetch('http://localhost:3000/crearAlumno', {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error al crear el alumno');
            }
            return response.json();
        })
        .then((data) => {
            alert(data.message); // Mostrar mensaje de éxito
            document.querySelector('form').reset(); // Limpiar formulario
        })
        .catch((error) => {
            console.error(error);
            alert('Ocurrió un error al crear el alumno');
        });
});
