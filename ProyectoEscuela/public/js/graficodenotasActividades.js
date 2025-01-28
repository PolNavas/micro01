document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.Id_usuario) {
        alert('Usuario no encontrado en localStorage.');
        return;
    }

    const userId = user.Id_usuario;

    // Función para cargar notas por actividad
    function cargarNotasActividades() {
        fetch(`http://localhost:3000/notasActividades/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las notas de las actividades.');
                }
                return response.json();
            })
            .then((data) => {
                if (!data.notasActividades || data.notasActividades.length === 0) {
                    alert('No se encontraron notas para las actividades de este usuario.');
                    return;
                }
                renderizarGrafico(data.notasActividades);
            })
            .catch((error) => {
                console.error('Error al cargar las notas de las actividades:', error);
                alert('Error al cargar las notas de las actividades.');
            });
    }

    // Función para renderizar el gráfico
    function renderizarGrafico(notasActividades) {
        const ctx = document.getElementById('notasActividadesChart').getContext('2d');
        const labels = notasActividades.map((actividad) => actividad.ActividadNombre);
        const valores = notasActividades.map((actividad) => actividad.Nota);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Notas por Actividad',
                    data: valores,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 10, // Por ejemplo, si las notas son del 0 al 10
                    },
                },
            },
        });
    }

    // Cargar notas al cargar la página
    cargarNotasActividades();
});
