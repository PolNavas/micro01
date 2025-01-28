document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('Usuario no encontrado en localStorage.');
        return;
    }

    fetch(`http://localhost:3000/perfil/${user.Id_usuario}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos del usuario desde el servidor.');
            }
            return response.json();
        })
        .then((userData) => {
            console.log('Datos del usuario recibidos:', userData);

            // Actualizar los campos
            document.querySelector('.user h2').textContent = userData.Nombre;
            document.querySelector('.user img').src = userData.ImagenPerfil;
        })
        .catch((error) => {
            console.error('Error al cargar los datos del usuario:', error);
            alert(`Error al cargar los datos del usuario: ${error.message}`);
        });
});
