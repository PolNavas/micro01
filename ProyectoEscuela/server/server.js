const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.json());
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
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Error de Multer:', err.message);
        return res.status(400).json({ message: 'Error al procesar el archivo: ' + err.message });
    }
    next(err);
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
        SELECT 
            p.Id_Proyecto,
            p.Nombre,
            p.Descripcion,
            DATE_FORMAT(p.Fecha, '%d-%m-%Y') AS Fecha_Inicio,
            DATE_FORMAT(p.Fecha_Entrega, '%d-%m-%Y') AS Fecha_Fin,
            (
                SELECT COUNT(DISTINCT a.Id_Actividad)
                FROM actividad a
                JOIN usuario_proyecto up ON up.Id_Proyecto = a.Id_Proyecto
                WHERE up.Id_Usuario = ? AND a.Id_Proyecto = p.Id_Proyecto
            ) AS CantidadDeActividades
        FROM proyecto p
        JOIN usuario_proyecto up ON up.Id_Proyecto = p.Id_Proyecto
        WHERE up.Id_Usuario = ?
        GROUP BY p.Id_Proyecto;
    `;

    db.query(query, [userId, userId], (err, results) => {
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, jpeg) y archivos PDF.'), false);
    }
    cb(null, true);
};

// Configuración del middleware Multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB (ajustar según necesidad)
});


// Middleware para analizar solicitudes JSON y datos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para actualizar el perfil del usuario
app.put('/actualizarPerfil/:userId', upload.single('imagen'), (req, res) => {
    const userId = req.params.userId;
    const { nombre, apellidos, Contrasena } = req.body; // Eliminar Estado del cuerpo
    const imagen = req.file ? req.file.filename : null;

    console.log('Datos recibidos para actualizar perfil:', { userId, nombre, apellidos, Contrasena, imagen });

    // Validar que los campos obligatorios están presentes
    if (!nombre || !apellidos || !Contrasena) {
        console.error('Faltan campos obligatorios:', { nombre, apellidos, Contrasena });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Construir la consulta para actualizar el perfil
    let query = `
        UPDATE usuarios
        SET Nombre = ?, Apellido = ?, Contrasena = ?, Estado = 'Activo' 
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
                message: 'Perfil actualizado con éxito y estado cambiado a Inactivo',
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
app.get('/alumnosActivos', (req, res) => {
    const query = `
        SELECT Id_usuario, Nombre, Apellido 
        FROM usuarios 
        WHERE Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los alumnos activos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json(results);
    });
});
app.get('/usuario/:id', (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT Id_usuario, Nombre, Apellido 
        FROM usuarios 
        WHERE Id_usuario = ? AND Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
        }

        res.status(200).json(results[0]);
    });
});

app.put('/usuario/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, apellidos } = req.body;

    console.log('Datos recibidos:', { userId, nombre, apellidos });

    if (!nombre || !apellidos) {
        console.log('Error: Datos faltantes');
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        UPDATE usuarios
        SET Nombre = ?, Apellido = ?
        WHERE Id_usuario = ? AND Rol = 'Alumno';
    `;

    db.query(query, [nombre, apellidos, userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            console.log('Usuario no encontrado o no es un alumno');
            return res.status(404).json({ message: 'Usuario no encontrado o no es un alumno' });
        }

        console.log('Usuario actualizado con éxito');
        res.status(200).json({ message: 'Alumno actualizado con éxito' });
    });
});
app.put('/alumnos/cambiarEstado/:id', (req, res) => {
    const alumnoId = req.params.id;

    const query = `
        UPDATE usuarios
        SET Estado = 'Inactivo'
        WHERE Id_usuario = ? AND Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, [alumnoId], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del alumno:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Alumno no encontrado o ya inactivo' });
        }

        res.status(200).json({ message: 'Alumno cambiado a inactivo con éxito' });
    });
});
// Ruta para crear un nuevo alumno
app.post('/crearAlumno', upload.single('imagen'), (req, res) => {
    const { nombre, apellidos, contrasena } = req.body;
    const imagen = req.file ? req.file.filename : null;

    console.log('Datos recibidos del cliente:', { nombre, apellidos, contrasena, imagen });

    if (!nombre || !apellidos || !contrasena) {
        console.error('Faltan campos obligatorios:', { nombre, apellidos, contrasena });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        INSERT INTO usuarios (Nombre, Apellido, ImagenPerfil, Rol, Estado, Contrasena)
        VALUES (?, ?, ?, 'Alumno', 'Activo', ?)
    `;

    db.query(query, [nombre, apellidos, imagen, contrasena], (err, result) => {
        if (err) {
            console.error('Error al insertar el alumno en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        console.log('Alumno creado exitosamente:', result);
        res.status(201).json({ message: 'Alumno creado exitosamente' });
    });
});
app.post('/crearProyecto', (req, res) => {
    const { nombre, descripcion, fecha, fecha_entrega } = req.body;

    console.log('Datos recibidos para crear proyecto:', { nombre, descripcion, fecha, fecha_entrega });

    // Validar los campos obligatorios
    if (!nombre || !descripcion || !fecha || !fecha_entrega) {
        console.error('Faltan campos obligatorios:', { nombre, descripcion, fecha, fecha_entrega });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        INSERT INTO proyecto (Nombre, Descripcion, Fecha, Fecha_Entrega)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [nombre, descripcion, fecha, fecha_entrega], (err, result) => {
        if (err) {
            console.error('Error al insertar el proyecto en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        console.log('Proyecto creado exitosamente:', result);
        res.status(201).json({ message: 'Proyecto creado exitosamente' });
    });
});


app.post('/crearActividad', (req, res) => {
    const { nombre, descripcion, fecha, fecha_entrega, proyectoId } = req.body;
    
    console.log('Datos recibidos para crear actividad:', { nombre, descripcion, fecha, fecha_entrega, proyectoId });
    
    // Validar que todos los campos están presentes
    if (!nombre || !descripcion || !fecha || !fecha_entrega || !proyectoId) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    const query = `
    INSERT INTO actividad (Nombre, Descripcion, Fecha, Fecha_Entrega, Id_Proyecto)
    VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(query, [nombre, descripcion, fecha, fecha_entrega, proyectoId], (err, result) => {
        if (err) {
            console.error('Error al insertar la actividad en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(201).json({ message: 'Actividad creada exitosamente' });
    });
});
app.get('/actividades', (req, res) => {
    const query = `
    SELECT Id_Actividad, Nombre, Descripcion
    FROM actividad
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las actividades:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        res.status(200).json({ actividades: results });
    });
});

app.post('/crearItem', (req, res) => {
    const { nombre, porcentage, actividadId } = req.body;
    
    console.log('Datos recibidos para crear item:', { nombre, porcentage, actividadId });
    
    // Validar campos obligatorios
    if (!nombre || !porcentage || !actividadId) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    // Paso 1: Insertar el ítem en la tabla `item`
    const queryItem = `
    INSERT INTO item (Nombre, Porcentaje)
    VALUES (?, ?)
    `;
    
    db.query(queryItem, [nombre, porcentage], (err, result) => {
        if (err) {
            console.error('Error al insertar el item en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error al crear el ítem' });
        }
        
        const itemId = result.insertId; // Obtener el ID del ítem recién creado
        
        // Paso 2: Insertar la relación en la tabla `item_actividad`
        const queryItemActividad = `
        INSERT INTO item_actividad (Id_Actividad, Id_Item)
        VALUES (?, ?)
        `;
        
        db.query(queryItemActividad, [actividadId, itemId], (err2) => {
            if (err2) {
                console.error('Error al insertar la relación en item_actividad:', err2.message);
                return res.status(500).json({ message: 'Error al vincular el ítem con la actividad' });
            }
            
            res.status(201).json({ message: 'Ítem creado y vinculado a la actividad exitosamente' });
        });
    });
});
app.get('/proyectos', (req, res) => {
    const query = 'SELECT Id_Proyecto, Nombre FROM proyecto';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los proyectos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        console.log('Proyectos encontrados:', results); // Log para verificar los resultados
        res.status(200).json({ proyectos: results });
    });
});


app.get('/proyectos/:id', (req, res) => {
    const proyectoId = req.params.id;

    console.log('ID del proyecto recibido:', proyectoId); // Log para depurar

    if (!proyectoId || isNaN(proyectoId)) {
        console.error('ID de proyecto inválido.');
        return res.status(400).json({ message: 'ID de proyecto inválido.' });
    }

    const query = `
        SELECT Id_Proyecto, Nombre, Descripcion, 
        DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, 
        DATE_FORMAT(Fecha_Entrega, '%Y-%m-%d') AS Fecha_Entrega
        FROM proyecto
        WHERE Id_Proyecto = ?
    `;

    db.query(query, [proyectoId], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            console.warn('No se encontró el proyecto con el ID:', proyectoId);
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        console.log('Proyecto encontrado:', results[0]);
        res.status(200).json(results[0]);
    });
});

app.put('/proyectos/:id', (req, res) => {
    const proyectoId = req.params.id;
    const { nombre, descripcion, fecha, fecha_entrega } = req.body;

    console.log('Datos recibidos para actualizar el proyecto:', {
        proyectoId,
        nombre,
        descripcion,
        fecha,
        fecha_entrega,
    });

    if (!nombre || !descripcion || !fecha || !fecha_entrega) {
        console.error('Faltan campos obligatorios:', {
            nombre,
            descripcion,
            fecha,
            fecha_entrega,
        });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        UPDATE proyecto
        SET Nombre = ?, Descripcion = ?, Fecha = ?, Fecha_Entrega = ?
        WHERE Id_Proyecto = ?
    `;

    db.query(query, [nombre, descripcion, fecha, fecha_entrega, proyectoId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el proyecto:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            console.warn('No se encontró el proyecto con el ID:', proyectoId);
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        console.log('Proyecto actualizado exitosamente:', result);
        res.status(200).json({ message: 'Proyecto actualizado exitosamente' });
    });
});
// Ruta para obtener todas las actividades
// Mantén solo una definición de la ruta para obtener una actividad específica por su ID
app.get('/actividades/actividad/:id', (req, res) => {
    const actividadId = req.params.id;

    console.log('ID de la actividad recibida:', actividadId);

    const query = `
        SELECT Id_Actividad, Nombre, Descripcion, 
               DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, 
               DATE_FORMAT(Fecha_Entrega, '%Y-%m-%d') AS Fecha_Entrega
        FROM actividad
        WHERE Id_Actividad = ?
    `;

    db.query(query, [actividadId], (err, results) => {
        if (err) {
            console.error('Error al obtener la actividad:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            console.warn('Actividad no encontrada con el ID:', actividadId);
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }

        console.log('Datos de la actividad enviados al cliente:', results[0]);
        res.status(200).json(results[0]);
    });
});
// Ruta para obtener una actividad específica por su ID
app.get('/actividades/actividad/:id', (req, res) => {
    const actividadId = req.params.id;

    console.log('ID de la actividad recibida:', actividadId);

    const query = `
        SELECT Id_Actividad, Nombre, Descripcion, 
               DATE_FORMAT(Fecha, '%Y-%m-%d') AS Fecha, 
               DATE_FORMAT(Fecha_Entrega, '%Y-%m-%d') AS Fecha_Entrega
        FROM actividad
        WHERE Id_Actividad = ?
    `;

    db.query(query, [actividadId], (err, results) => {
        if (err) {
            console.error('Error al obtener la actividad:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            console.warn('Actividad no encontrada con el ID:', actividadId);
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }

        console.log('Datos de la actividad enviados al cliente:', results[0]);
        res.status(200).json(results[0]);
    });
});

app.post('/subirArchivoActividad', upload.single('archivo'), (req, res) => {
    const { usuarioId, actividadId } = req.body;
    const archivo = req.file ? req.file.filename : null;

    console.log('Datos recibidos:', { usuarioId, actividadId, archivo });

    // Verifica si faltan datos
    if (!usuarioId || !actividadId || !archivo) {
        console.error('Faltan campos obligatorios:', { usuarioId, actividadId, archivo });
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Inserta los datos en la tabla `usuario_actividad`
    const query = `
        INSERT INTO usuario_actividad (Id_Usuario, Id_Actividad, Archivo)
        VALUES (?, ?, ?)
    `;

    db.query(query, [usuarioId, actividadId, archivo], (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error al guardar el archivo en la base de datos.' });
        }

        console.log('Archivo subido exitosamente:', result);
        res.status(201).json({ message: 'Archivo subido exitosamente.' });
    });
});



// Ruta para obtener los archivos relacionados con una actividad
app.get('/archivos/:actividadId', (req, res) => {
    const actividadId = req.params.actividadId;

    const query = `
        SELECT ua.Archivo, u.Nombre AS UsuarioNombre, u.Apellido AS UsuarioApellido, ua.Fecha_Subida
        FROM usuario_actividad ua
        JOIN usuarios u ON ua.Id_Usuario = u.Id_usuario
        WHERE ua.Id_Actividad = ?
    `;

    db.query(query, [actividadId], (err, results) => {
        if (err) {
            console.error('Error al obtener los archivos de la actividad:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json({ archivos: results });
    });
});
app.get('/perfil/:id', (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT Id_usuario, Nombre, Apellido, ImagenPerfil
        FROM usuarios
        WHERE Id_usuario = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = results[0];

        // Generar la ruta completa de la imagen
        if (user.ImagenPerfil) {
            user.ImagenPerfil = `http://localhost:3000/uploads/${user.ImagenPerfil}`;
        } else {
            user.ImagenPerfil = '../Img/default-profile.png'; // Ruta de la imagen por defecto
        }

        res.status(200).json(user);
    });
});
// Ruta para eliminar un proyecto por su ID
app.delete('/eliminar_proyecto/:id', (req, res) => {
    const proyectoId = req.params.id;

    console.log('ID del proyecto recibido para eliminar:', proyectoId); // Agregar log

    if (!proyectoId || isNaN(proyectoId)) {
        console.error('ID de proyecto inválido:', proyectoId); // Agregar log
        return res.status(400).json({ message: 'ID de proyecto inválido.' });
    }

    const query = `
        DELETE FROM proyecto
        WHERE Id_Proyecto = ?
    `;

    db.query(query, [proyectoId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el proyecto en la base de datos:', err.message); // Agregar log
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            console.warn('No se encontró un proyecto con el ID especificado:', proyectoId); 
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }

        console.log('Proyecto eliminado exitosamente:', proyectoId);
        res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
    });
});
// Ruta para eliminar una actividad
app.delete('/actividades_eliminar/:id', (req, res) => {
    const actividadId = req.params.id;

    console.log('ID de la actividad recibida para eliminar:', actividadId);

    if (!actividadId || isNaN(actividadId)) {
        console.error('ID de actividad inválido:', actividadId);
        return res.status(400).json({ message: 'ID de actividad inválido.' });
    }

    const query = `
        DELETE FROM actividad
        WHERE Id_Actividad = ?
    `;

    db.query(query, [actividadId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la actividad en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            console.warn('No se encontró una actividad con el ID especificado:', actividadId);
            return res.status(404).json({ message: 'Actividad no encontrada.' });
        }

        console.log('Actividad eliminada exitosamente:', actividadId);
        res.status(200).json({ message: 'Actividad eliminada exitosamente.' });
    });
});
// Ruta para obtener todos los ítems
app.get('/items', (req, res) => {
    const query = `
        SELECT Id_Item, Nombre 
        FROM item
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los ítems:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json({ items: results });
    });
});

// Ruta para eliminar un ítem
app.delete('/items_elimanar/:id', (req, res) => {
    const itemId = req.params.id;

    console.log('ID del ítem recibido para eliminar:', itemId);

    if (!itemId || isNaN(itemId)) {
        console.error('ID de ítem inválido:', itemId);
        return res.status(400).json({ message: 'ID de ítem inválido.' });
    }

    const query = `
        DELETE FROM item
        WHERE Id_Item = ?
    `;

    db.query(query, [itemId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el ítem en la base de datos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            console.warn('No se encontró un ítem con el ID especificado:', itemId);
            return res.status(404).json({ message: 'Ítem no encontrado.' });
        }

        console.log('Ítem eliminado exitosamente:', itemId);
        res.status(200).json({ message: 'Ítem eliminado exitosamente.' });
    });
});

// Ruta para obtener un ítem por su ID
app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;

    const query = `
        SELECT Id_Item, Nombre, Porcentaje 
        FROM item 
        WHERE Id_Item = ?
    `;

    db.query(query, [itemId], (err, results) => {
        if (err) {
            console.error('Error al obtener el ítem:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Ítem no encontrado' });
        }

        res.status(200).json(results[0]);
    });
});

// Ruta para actualizar un ítem por su ID
app.put('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const { nombre, porcentage } = req.body;

    if (!nombre || !porcentage) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        UPDATE item 
        SET Nombre = ?, Porcentaje = ? 
        WHERE Id_Item = ?
    `;

    db.query(query, [nombre, porcentage, itemId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el ítem:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ítem no encontrado' });
        }

        res.status(200).json({ message: 'Ítem actualizado exitosamente' });
    });
});
app.get('/alumnosActivos', (req, res) => {
    const query = `
        SELECT Id_usuario, Nombre, Apellido 
        FROM usuarios 
        WHERE Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los alumnos activos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json(results);
    });
});
app.get('/actividades', (req, res) => {
    const query = `
        SELECT Id_Actividad, Nombre 
        FROM actividad;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las actividades:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json({ actividades: results });
    });
});
app.post('/notas', (req, res) => {
    const { nota, alumnoId, actividadId } = req.body;

    console.log('Datos recibidos para asignar nota:', { nota, alumnoId, actividadId });

    if (!nota || !alumnoId || !actividadId) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `
        INSERT INTO notas_actividad (Nota, Id_Usuario, Id_Actividad)
        VALUES (?, ?, ?);
    `;

    db.query(query, [nota, alumnoId, actividadId], (err, result) => {
        if (err) {
            console.error('Error al asignar la nota:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(201).json({ message: 'Nota asignada exitosamente' });
    });
});
app.get('/alumnosActivos', (req, res) => {
    const query = `
        SELECT Id_usuario, Nombre, Apellido 
        FROM usuarios 
        WHERE Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los alumnos activos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json(results);
    });
});
app.get('/alumnosActivos', (req, res) => {
    const query = `
        SELECT Id_usuario, Nombre, Apellido 
        FROM usuarios 
        WHERE Rol = 'Alumno' AND Estado = 'Activo';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los alumnos activos:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        res.status(200).json(results);
    });
});
app.get('/notas/:alumnoId', (req, res) => {
    const alumnoId = req.params.alumnoId;

    console.log('ID del alumno recibido para obtener notas:', alumnoId);

    const query = `
        SELECT n.Id_Nota, n.Nota, i.Nombre AS NombreItem
        FROM notas n
        JOIN item i ON n.Id_Item = i.Id_Item
        WHERE n.Id_Alumno = ?;
    `;

    db.query(query, [alumnoId], (err, results) => {
        if (err) {
            console.error('Error al obtener las notas:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            console.warn('No se encontraron notas para el alumno con ID:', alumnoId);
            return res.status(404).json({ message: 'No se encontraron notas para este alumno.' });
        }

        console.log('Notas enviadas al cliente:', results);
        res.status(200).json(results);
    });
});
app.get('/notasActividades/:userId', (req, res) => {
    const userId = req.params.userId;

    console.log('ID del Usuario recibido:', userId);

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'El ID del usuario no es válido' });
    }

    const query = `
        SELECT 
            a.Id_Actividad,
            a.Nombre AS ActividadNombre,
            na.Nota
        FROM notas_actividad na
        JOIN actividad a ON na.Id_Actividad = a.Id_Actividad
        WHERE na.Id_Usuario = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener las notas de las actividades:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron notas para este usuario.' });
        }

        res.status(200).json({ notasActividades: results });
    });
});






// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
