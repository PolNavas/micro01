// Importar la conexión de la base de datos
const db = require('./db');

// Función para insertar datos en la tabla Profesor
function insertarProfesor(nombre, apellido, idProyecto) {
    const query = 'INSERT INTO Profesor (Nombre, Apellido, Id_Proyecto) VALUES (?, ?, ?)';
    db.query(query, [nombre, apellido, idProyecto], (err, results) => {
        if (err) {
            console.error('Error al insertar en Profesor:', err.message);
            return;
        }
        console.log('Profesor insertado con ID:', results.insertId);
    });
}

// Función para insertar datos en la tabla Clase
function insertarClase(nombre, idProfesor) {
    const query = 'INSERT INTO Clase (Nombre, Id_Profesor) VALUES (?, ?)';
    db.query(query, [nombre, idProfesor], (err, results) => {
        if (err) {
            console.error('Error al insertar en Clase:', err.message);
            return;
        }
        console.log('Clase insertada con ID:', results.insertId);
    });
}

// Función para insertar datos en la tabla Alumnos
function insertarAlumno(nombre, apellido, imagenPerfil, idClase) {
    const query = 'INSERT INTO Alumnos (Nombre, Apellido, ImagenPerfil, Id_clase) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, apellido, imagenPerfil, idClase], (err, results) => {
        if (err) {
            console.error('Error al insertar en Alumnos:', err.message);
            return;
        }
        console.log('Alumno insertado con ID:', results.insertId);
    });
}

// Función para insertar datos en la tabla Proyecto
function insertarProyecto(nombre, fecha) {
    const query = 'INSERT INTO Proyecto (Nombre, Fecha) VALUES (?, ?)';
    db.query(query, [nombre, fecha], (err, results) => {
        if (err) {
            console.error('Error al insertar en Proyecto:', err.message);
            return;
        }
        console.log('Proyecto insertado con ID:', results.insertId);
    });
}

// Función para insertar datos en la tabla Alumnos_Proyecto
function insertarAlumnoProyecto(idAlumno, idProyecto) {
    const query = 'INSERT INTO Alumnos_Proyecto (Id_Alumnos, Id_Proyecto) VALUES (?, ?)';
    db.query(query, [idAlumno, idProyecto], (err, results) => {
        if (err) {
            console.error('Error al insertar en Alumnos_Proyecto:', err.message);
            return;
        }
        console.log('Relación Alumnos-Proyecto insertada con ID:', results.insertId);
    });
}

// Ejemplo de inserciones
insertarProfesor('Juan', 'Pérez', 1);
insertarClase('Matemáticas', 1);
insertarAlumno('Ana', 'García', 'perfil1.jpg', 1);
insertarProyecto('Proyecto Final', '2025-01-15');
insertarAlumnoProyecto(1, 1);

// Cierra la conexión al final (opcional, si no usas un pool de conexiones)
db.end((err) => {
    if (err) {
        console.error('Error al cerrar la conexión:', err.message);
    } else {
        console.log('Conexión cerrada correctamente.');
    }
});
