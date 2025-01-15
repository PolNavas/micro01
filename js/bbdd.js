const mysql = require('mysql2');

// Configuración de la conexión
const connection = mysql.createConnection({
    host: 'localhost',      // Cambiar según la configuración del servidor MySQL
    user: 'root',           // Usuario de la base de datos
    password: '',           // Contraseña del usuario (déjala vacía si no tiene)
    database: 'proyecto_escuela' // Nombre de la base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

module.exports = connection;
