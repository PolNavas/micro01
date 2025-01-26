const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const multer = require('multer');
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
                    redirect: 'html/profesores.html',
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
            return res.status(401).json({ message: 'Usuario o Contrasena incorrectos' });
        }
    });
});
// Ruta para obtener los proyectos de un usuario
app.get('/proyectos/:userId', (req, res) => {
    const userId = req.params.userId;

    console.log('ID del Usuario recibido:', userId);

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
        JOIN usuario_proyecto ON proyecto.Id_Proyecto = usuario_proyecto.Id_Proyecto
        WHERE usuario_proyecto.Id_Usuario = ?
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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads')); // Carpeta para guardar imágenes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

// Filtro de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, jpeg).'), false);
    }
    cb(null, true);
};

// Configuración del middleware Multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Middleware para analizar solicitudes JSON y datos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para actualizar el perfil del usuario
app.put('/actualizarPerfil/:userId', upload.single('imagen'), (req, res) => {
    const userId = req.params.userId;
    const { nombre, apellidos, Contrasena } = req.body;
    const imagen = req.file ? req.file.filename : null;
    console.log('Datos recibidos para actualizar perfil:', req.body);

    console.log('Datos recibidos para actualizar perfil:', { userId, nombre, apellidos, Contrasena, imagen });

    // Validar que los campos obligatorios están presentes
    if (!nombre || !apellidos || !Contrasena) {
        console.error('Faltan campos obligatorios:', { nombre, apellidos, Contrasena });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    console.log('Datos enviados al servidor:', {
        nombre,
        apellidos,
        Contrasena,
        imagen,
    });
    
    // Construir la consulta para actualizar el perfil
    let query = `
        UPDATE usuarios
        SET Nombre = ?, Apellido = ?, Contrasena = ?
    `;
    const params = [nombre, apellidos, Contrasena];

    if (imagen) {
        query += `, ImagenPerfil = ?`;
        params.push(imagen);
    }

    query += ` WHERE Id_usuario = ?`;
    params.push(userId);

    // Ejecutar la consulta de actualización
    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al actualizar el perfil en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor: ' + err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Consultar los datos actualizados del usuario
        const selectQuery = 'SELECT * FROM usuarios WHERE Id_usuario = ?';
        db.query(selectQuery, [userId], (selectErr, results) => {
            if (selectErr) {
                console.error('Error al recuperar los datos actualizados del usuario:', selectErr.message);
                return res.status(500).json({ message: 'Error al recuperar los datos actualizados' });
            }

            const user = results[0];
            if (user.ImagenPerfil) {
                user.ImagenPerfil = `http://localhost:3000/uploads/${user.ImagenPerfil}`;
            }

            res.status(200).json({
                message: 'Perfil actualizado con éxito',
                userData: user,
            });
        });
    });
});

// Middleware para manejar errores de Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Error de Multer:', err.message);
        return res.status(500).json({ message: 'Error al procesar la imagen: ' + err.message });
    } else if (err) {
        console.error('Error general:', err.message);
        return res.status(500).json({ message: 'Error en el servidor: ' + err.message });
    }
    next();
});

app.get('/actividades/:proyectoId', (req, res) => {
    const proyectoId = req.params.proyectoId;

    console.log('ID del Proyecto recibido:', proyectoId);

    // Validar que el ID sea válido
    if (!proyectoId || isNaN(proyectoId)) {
        return res.status(400).json({ message: 'El ID del proyecto no es válido' });
    }

    const query = `
        SELECT 
            a.Id_Actividad, 
            a.Nombre AS NombreActividad,
            i.Id_Item, 
            i.Nombre AS NombreItem, 
            i.Porcentaje,
            p.Nombre AS NombreProyecto
        FROM actividad a
        LEFT JOIN item_actividad ia ON a.Id_Actividad = ia.Id_Actividad
        LEFT JOIN item i ON ia.Id_Item = i.Id_Item
        JOIN proyecto p ON a.Id_Proyecto = p.Id_Proyecto
        WHERE a.Id_Proyecto = ?;
    `;

    db.query(query, [proyectoId], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const nombreProyecto = results[0].NombreProyecto;

            // Agrupar actividades e ítems relacionados
            const actividades = results.reduce((acc, row) => {
                // Buscar si la actividad ya existe en el array
                let actividad = acc.find(act => act.Id_Actividad === row.Id_Actividad);

                if (!actividad) {
                    // Si no existe, crear una nueva actividad y agregarla
                    actividad = {
                        Id_Actividad: row.Id_Actividad,
                        NombreActividad: row.NombreActividad,
                        Items: [],
                    };
                    acc.push(actividad);
                }

                // Si hay un ítem relacionado, agregarlo a la actividad
                if (row.Id_Item) {
                    actividad.Items.push({
                        Id_Item: row.Id_Item,
                        NombreItem: row.NombreItem,
                        Porcentaje: row.Porcentaje,
                    });
                }

                return acc;
            }, []);

            // Responder con los datos del proyecto y sus actividades
            return res.status(200).json({ 
                nombreProyecto, 
                actividades 
            });
        } else {
            // No se encontraron actividades para este proyecto
            return res.status(404).json({ message: 'No se encontraron actividades ni ítems para este proyecto' });
        }
    });
});




// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
