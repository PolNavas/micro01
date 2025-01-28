document.addEventListener('DOMContentLoaded', () => {
    const listaItems = document.getElementById('listaItems');
    const eliminarItemForm = document.getElementById('eliminarItemForm');

    // Función para cargar ítems en el select
    function cargarItems() {
        fetch('http://localhost:3000/items')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los ítems');
                }
                return response.json();
            })
            .then((data) => {
                listaItems.innerHTML = '<option value="">Seleccione un ítem</option>';
                data.items.forEach((item) => {
                    const option = document.createElement('option');
                    option.value = item.Id_Item;
                    option.textContent = item.Nombre;
                    listaItems.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar los ítems:', error);
                alert('Error al cargar los ítems.');
            });
    }

    // Manejar la eliminación del ítem
    eliminarItemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const itemId = listaItems.value;

        if (!itemId) {
            alert('Por favor, seleccione un ítem para eliminar.');
            return;
        }

        if (!confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
            return;
        }

        fetch(`http://localhost:3000/items_elimanar/${itemId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text || 'Error al eliminar el ítem.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                cargarItems(); // Recargar ítems en el select
            })
            .catch((error) => {
                console.error('Error al eliminar el ítem:', error);
                alert('Error al eliminar el ítem.');
            });
    });

    // Cargar ítems al iniciar la página
    cargarItems();
});
