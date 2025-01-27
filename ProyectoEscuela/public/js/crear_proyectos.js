document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearProyectoForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const fechaEntrega = document.getElementById('fecha_entrega').value;

        // Validar que los campos no estén vacíos
        if (!nombre || !descripcion || !fecha || !fechaEntrega) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Validar que la fecha de entrega no sea anterior a la fecha de inicio
        if (new Date(fechaEntrega) < new Date(fecha)) {
            alert('La fecha de entrega no puede ser anterior a la fecha de inicio.');
            return;
        }

        const proyectoData = {
            nombre,
            descripcion,
            fecha,
            fecha_entrega: fechaEntrega,
        };

        // Enviar datos al servidor
        fetch('http://localhost:3000/crearProyecto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proyectoData),
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
                form.reset(); // Limpiar el formulario
            })
            .catch((error) => {
                console.error('Error al crear el proyecto:', error);
                alert(`Error al crear el proyecto: ${error.message}`);
            });
    });
});
