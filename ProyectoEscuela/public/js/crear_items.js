document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearItemForm');
    const listaActividades = document.getElementById('listaActividades');

    // Cargar la lista de actividades dinámicamente
    fetch('http://localhost:3000/actividades')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error al obtener las actividades: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            data.actividades.forEach((actividad) => {
                const option = document.createElement('option');
                option.value = actividad.Id_Actividad;
                option.textContent = `${actividad.Nombre} (${actividad.Descripcion || 'Sin descripción'})`;
                listaActividades.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error al cargar las actividades:', error);
            alert('Error al cargar las actividades.');
        });

    // Manejar el envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const porcentage = document.getElementById('porcentage').value.trim();
        const actividadId = listaActividades.value;

        // Validar campos
        if (!nombre || !porcentage || !actividadId) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        const itemData = {
            nombre,
            porcentage,
            actividadId,
        };

        // Enviar datos al backend
        fetch('http://localhost:3000/crearItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
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
                console.error('Error al crear el ítem:', error);
                alert(`Error al crear el ítem: ${error.message}`);
            });
    });
});
