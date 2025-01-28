document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user')); // Obtener el usuario desde localStorage
    const graficoCanvas = document.getElementById('graficoNotas');

    if (!user) {
        alert('Usuario no encontrado en localStorage.');
        return;
    }

    // Función para cargar las notas desde el backend
    function cargarNotas() {
        fetch(`http://localhost:3000/notas/${user.Id_usuario}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las notas.');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Datos de las notas recibidos:', data);
                renderizarGrafico(data);
            })
            .catch((error) => {
                console.error('Error al cargar las notas:', error);
                alert('Error al cargar las notas.');
            });
    }

    // Función para renderizar el gráfico
    function renderizarGrafico(data) {
        const nombresItems = data.map((item) => item.NombreItem); // Nombres de los items
        const notas = data.map((item) => item.Nota); // Notas de los items

        new Chart(graficoCanvas, {
            type: 'bar', // Tipo de gráfico (barras)
            data: {
                labels: nombresItems, // Etiquetas (nombres de los items)
                datasets: [
                    {
                        label: 'Notas',
                        data: notas, // Notas de cada item
                        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de las barras
                        borderColor: 'rgba(75, 192, 192, 1)', // Borde de las barras
                        borderWidth: 1, // Ancho del borde
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true, // Iniciar en 0 en el eje Y
                    },
                },
            },
        });
    }

    // Cargar las notas al iniciar la página
    cargarNotas();
});
