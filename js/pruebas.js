const db = require('./db');

// Ejemplo de una consulta simple
db.query('SELECT * FROM Profesor', (err, results) => {
    if (err) {
        console.error('Error ejecutando la consulta:', err.message);
        return;
    }
    console.log('Resultados:', results);
});
