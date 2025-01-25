const user = JSON.parse(localStorage.getItem('user'));

if (user) {
    // Autocompletar los campos del formulario con los datos del usuario
    document.getElementById('nombre').value = user.Nombre;
    document.getElementById('apellidos').value = user.Apellido;
    document.getElementById('Contrasena').value = ''; // No mostrar contraseñas por seguridad
    if (user.ImagenPerfil) {
        document.getElementById('imagenActual').src = user.ImagenPerfil;
    } else {
        document.getElementById('imagenActual').src = '../Img/default-profile.png'; // Imagen por defecto
    }
} else {
    // Si no hay datos del usuario, redirigir al login
    window.location.href = '../index.html';
}

document.getElementById('perfilForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Capturar los valores de los campos
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const Contrasena = document.getElementById('Contrasena').value.trim(); // El nombre coincide ahora con el backend
    const imagen = document.getElementById('imagen').files[0];

    // Validar campos obligatorios
    if (!nombre || !apellidos || !Contrasena) {
        alert('Por favor, completa todos los campos obligatorios.');
        console.log({
            nombre: nombre || 'Campo vacío',
            apellidos: apellidos || 'Campo vacío',
            Contrasena: Contrasena || 'Campo vacío',
        });
        return;
    }

    // Preparar los datos para enviar
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);
    formData.append('Contrasena', Contrasena); // Asegúrate de usar la misma clave que el backend espera
    if (imagen) {
        formData.append('imagen', imagen);
    }

    // Enviar los datos al servidor
    fetch(`http://localhost:3000/actualizarPerfil/${user.Id_usuario}`, {
        method: 'PUT',
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
            alert(data.message);
            localStorage.setItem('user', JSON.stringify(data.userData));
            if (confirm('Perfil actualizado. ¿Deseas recargar la página?')) {
                window.location.reload();
            }
        })
        .catch((error) => {
            console.error('Error al actualizar el perfil:', error);
            alert(`Error al actualizar el perfil: ${error.message}`);
        });
});


// Mostrar vista previa de la imagen seleccionada
document.getElementById('imagen').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagenActual').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
