const loginForm = document.getElementById('loginForm');

// Escuchar el evento de envío del formulario
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página

    // Capturar los valores de los campos del formulario
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validar que ambos campos estén completos
    if (!username || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const loginData = { username, password };

    try {
        // Realizar la solicitud al servidor
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            alert('Login exitoso. Bienvenido!');

            // Eliminar cualquier dato anterior en localStorage antes de almacenar el nuevo usuario
            localStorage.removeItem('user');
            
            // Guardar los datos del usuario en el localStorage
            localStorage.setItem('user', JSON.stringify(result.userData));  // Guardar datos de usuario correctamente

            // Redirigir a la página correspondiente según el rol
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                alert("No se pudo redirigir. Intenta nuevamente.");
            }
        } else {
            // Mostrar mensaje de error del servidor
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        alert('Error en el servidor. Inténtalo de nuevo más tarde.');
    }
});
