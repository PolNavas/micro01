const mysql = require('mysql2');
const express = require('express');

const app = express();
const port = 3000;

// Configuración de la base de datos para XAMPP
const db = mysql.createConnection({
    host: "localhost",
    database: "proyecto_escuela",
    user: "root",          
    password:  ""  
});


// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar con MySQL:', err);
    } else {
        console.log('Conexión exitosa a MySQL en XAMPP');
    }
});

// Prueba de conexión con una consulta
app.get('/', (req, res) => {
    db.query('SELECT NOW() AS currentTime', (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en la base de datos');
        } else {
            res.send(`La hora actual es: ${results[0].currentTime}`);
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});