document.addEventListener('DOMContentLoaded', () => {
    const listaItems = document.getElementById('listaItems');
    const itemsForm = document.getElementById('itemsForm');

    // Función para cargar los ítems en el select
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

    // Función para cargar los datos del ítem en el formulario
    function cargarDatosItem(itemId) {
        fetch(`http://localhost:3000/items/${itemId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del ítem');
                }
                return response.json();
            })
            .then((item) => {
                console.log('Datos del ítem recibidos:', item);
                document.getElementById('nombre').value = item.Nombre || '';
                document.getElementById('porcentage').value = item.Porcentaje || '';
            })
            .catch((error) => {
                console.error('Error al cargar los datos del ítem:', error);
                alert('Error al cargar los datos del ítem.');
            });
    }

    // Escuchar cambios en el select de ítems
    listaItems.addEventListener('change', (e) => {
        const itemId = e.target.value;
        if (itemId) {
            cargarDatosItem(itemId);
        } else {
            itemsForm.reset(); // Limpiar el formulario si no se selecciona un ítem
        }
    });

    // Manejar el envío del formulario
    itemsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const itemId = listaItems.value;
        const nombre = document.getElementById('nombre').value.trim();
        const porcentage = document.getElementById('porcentage').value;

        if (!itemId || !nombre || !porcentage) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        fetch(`http://localhost:3000/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, porcentage }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al actualizar el ítem.');
                }
                return response.json();
            })
            .then((data) => {
                alert(data.message);
                cargarItems(); // Recargar los ítems en el select
            })
            .catch((error) => {
                console.error('Error al actualizar el ítem:', error);
                alert('Error al actualizar el ítem.');
            });
    });

    // Cargar ítems al iniciar la página
    cargarItems();
});
