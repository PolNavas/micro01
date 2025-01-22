const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Configuración de la base de datos para XAMPP
const db = mysql.createConnection({
    host: "localhost",
    database: "proyecto_escuela",
    user: "root",
    password: ""
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar con MySQL:', err);
    } else {
        console.log('Conexión exitosa a MySQL en XAMPP');
    }
});

// Middleware para analizar solicitudes en formato JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Faltan datos' });
    }

    const query = 'SELECT * FROM usuarios WHERE Nombre = ? AND Contrasena = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const user = results[0]; // Suponiendo que solo habrá un resultado para este login

            // Redirigir dependiendo del rol
            if (user.Rol === 'Profesor') {
                return res.status(200).json({
                    message: 'Login exitoso',
                    redirect: 'html/profesor.html',
                    userData: user // Devolver los datos del usuario
                });
            } else if (user.Rol === 'Alumno') {
                return res.status(200).json({
                    message: 'Login exitoso',
                    redirect: 'html/alumno.html',
                    userData: user // Devolver los datos del usuario
                });
            }
        } else {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    });
});
// Ruta para obtener los proyectos de un usuario
app.get('/proyectos/:userId', (req, res) => {
    const userId = req.params.userId;

    // Imprimir el userId en la consola del servidor
    console.log('ID del Usuario recibido:', userId);

    // Validar que el userId sea un número válido
    if (!userId || isNaN(userId)) {
        console.log('El ID del usuario no es válido');
        return res.status(400).json({ message: 'Falta el ID del usuario o no es válido' });
    }

    const query = `
        SELECT proyecto.*,
        DATE_FORMAT(proyecto.Fecha, '%d-%m-%Y') AS Fecha_Inicio,
        DATE_FORMAT(proyecto.Fecha_Entrega, '%d-%m-%Y') AS Fecha_Fin,
        COUNT(actividad.Id_Actividad) AS CantidadDeActividades
        FROM proyecto
        LEFT JOIN actividad ON proyecto.Id_Proyecto = actividad.Id_Proyecto
        JOIN usuarios ON proyecto.Id_Proyecto = usuarios.Id_Proyecto
        WHERE usuarios.Id_usuario = ?
        GROUP BY proyecto.Id_Proyecto;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            return res.status(200).json({ proyectos: results });
        } else {
            console.log('No se encontraron proyectos para el usuario con ID:', userId);
            return res.status(404).json({ message: 'No se encontraron proyectos para este usuario' });
        }
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
