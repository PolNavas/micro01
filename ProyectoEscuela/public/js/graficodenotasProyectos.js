document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.Id_usuario;

    if (!userId) {
        alert('No se encontró el usuario. Por favor, inicia sesión nuevamente.');
        window.location.href = '../index.html'; // Redirige al login si no hay usuario
        return;
    }

    const ctx = document.getElementById('notasGrafico').getContext('2d'); // Referencia al canvas del gráfico

    // Función para cargar las notas de los proyectos
    function cargarNotasProyectos() {
        fetch(`http://localhost:3000/notasProyectos/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las notas de los proyectos.');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Notas de los proyectos:', data.proyectos);

                if (data.proyectos.length === 0) {
                    alert('No tienes proyectos asignados.');
                    return;
                }

                // Extraer datos para el gráfico
                const nombresProyectos = data.proyectos.map((p) => p.NombreProyecto);
                const notasPromedio = data.proyectos.map((p) => p.NotaTotal);

                // Renderizar gráfico
                renderizarGrafico(nombresProyectos, notasPromedio);
            })
            .catch((error) => {
                console.error('Error al cargar las notas de los proyectos:', error);
                alert('Error al cargar las notas de los proyectos.');
            });
    }

    // Función para renderizar el gráfico
    function renderizarGrafico(labels, data) {
        new Chart(ctx, {
            type: 'bar', // Gráfico de barras
            data: {
                labels: labels, // Nombres de los proyectos
                datasets: [
                    {
                        label: 'Nota Promedio del Proyecto',
                        data: data, // Notas promedio
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Notas promedio por proyecto',
                    },
                },
            },
        });
    }

    // Cargar las notas de los proyectos al iniciar la página
    cargarNotasProyectos();
});
