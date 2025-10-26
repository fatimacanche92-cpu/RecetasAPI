-- =========================================================
-- 🍳 BASE DE DATOS: CookShare (versión corregida)
-- Autor: Melani
-- Descripción: Sistema de recetas públicas y premium con colaboración
-- =========================================================
DROP DATABASE IF EXISTS cookshare;
CREATE DATABASE cookshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cookshare;

-- =========================================================
-- 🧍‍♀️ USUARIOS
-- =========================================================
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('publico','premium') DEFAULT 'publico',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 🕓 SESIONES (para saber si está logueado)
-- =========================================================
CREATE TABLE Sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 🏷️ CATEGORÍAS
-- =========================================================
CREATE TABLE Categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- =========================================================
-- 🍲 RECETAS
-- =========================================================
CREATE TABLE Recetas (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tiempo_preparacion INT,
    costo DECIMAL(6,2) DEFAULT NULL,
    es_publica BOOLEAN DEFAULT TRUE,
    es_premium BOOLEAN DEFAULT FALSE,
    categoria_id INT,
    autor_id INT, -- autor primario
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id_categoria),
    FOREIGN KEY (autor_id) REFERENCES Usuarios(id_usuario)
);

-- =========================================================
-- 👥 AUTORES SECUNDARIOS / INVITACIONES (colaboradores)
-- =========================================================
CREATE TABLE Autores_Receta (
    id_receta INT,
    id_usuario INT,
    rol ENUM('colaborador','invitado') DEFAULT 'colaborador',
    permiso_modificar BOOLEAN DEFAULT FALSE,
    fecha_invitacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_receta, id_usuario),
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 🧂 INGREDIENTES
-- =========================================================
CREATE TABLE Ingredientes (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20)
);

-- =========================================================
-- 🔗 RELACIÓN RECETA - INGREDIENTE
-- =========================================================
CREATE TABLE Receta_Ingrediente (
    id_receta INT,
    id_ingrediente INT,
    cantidad DECIMAL(6,2),
    PRIMARY KEY (id_receta, id_ingrediente),
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_ingrediente) REFERENCES Ingredientes(id_ingrediente) ON DELETE CASCADE
);

-- =========================================================
-- 🪜 PASOS DE PREPARACIÓN
-- =========================================================
CREATE TABLE Pasos (
    id_paso INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT,
    numero_paso INT,
    descripcion TEXT,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE
);

-- =========================================================
-- ⭐ VALORACIONES DE RECETAS
-- =========================================================
CREATE TABLE Valoraciones (
    id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT,
    id_usuario INT,
    puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 💳 SUSCRIPCIONES (Usuarios Premium)
-- =========================================================
CREATE TABLE Suscripciones (
    id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME,
    monto DECIMAL(6,2),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 📂 DATOS DE PRUEBA
-- =========================================================

-- Categorías
INSERT INTO Categorias (nombre) VALUES ('Desayuno'), ('Almuerzo'), ('Cena'), ('Postre');

-- Usuarios
INSERT INTO Usuarios (nombre, email, contrasena, tipo_usuario) VALUES
('Melani', 'melani@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Fátima', 'fatima@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'premium'); -- pass: password123

-- Sesiones
INSERT INTO Sesiones (id_usuario) VALUES (1), (2);

-- Recetas
INSERT INTO Recetas (titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id) VALUES
('Tacos al Pastor', 'Receta tradicional con piña y carne marinada', 30, NULL, TRUE, FALSE, 3, 1),
('Postre Gourmet', 'Receta premium solo para usuarios especiales', 45, 50.00, FALSE, TRUE, 4, 2);

-- Ingredientes
INSERT INTO Ingredientes (nombre, unidad_medida) VALUES
('Carne de cerdo', 'g'),
('Piña', 'rodajas'),
('Tortilla', 'pieza'),
('Azúcar', 'g'),
('Crema', 'ml');

-- Relación Receta - Ingrediente
INSERT INTO Receta_Ingrediente VALUES
(1, 1, 500),
(1, 2, 3),
(1, 3, 10),
(2, 4, 200),
(2, 5, 100);

-- Pasos
INSERT INTO Pasos (id_receta, numero_paso, descripcion) VALUES
(1, 1, 'Cortar la carne en trozos pequeños.'),
(1, 2, 'Marinar con achiote y jugo de piña.'),
(1, 3, 'Cocinar en sartén y servir con piña.'),
(2, 1, 'Mezclar azúcar con crema.'),
(2, 2, 'Hornear durante 30 minutos.');

-- Valoraciones
INSERT INTO Valoraciones (id_receta, id_usuario, puntuacion, comentario) VALUES
(1, 2, 5, '¡Deliciosos tacos!'),
(2, 1, 4, 'Se ve bien, pero soy pobre 😭');

-- Autores secundarios / invitaciones
INSERT INTO Autores_Receta (id_receta, id_usuario, rol, permiso_modificar) VALUES
(1, 2, 'colaborador', TRUE);

-- Suscripción
INSERT INTO Suscripciones (id_usuario, fecha_inicio, fecha_fin, monto) VALUES
(2, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 99.99);

-- Más Categorías
INSERT INTO Categorias (nombre) VALUES ('Aperitivos'), ('Sopas'), ('Ensaladas'), ('Bebidas'), ('Guarniciones');

-- Más Usuarios
INSERT INTO Usuarios (nombre, email, contrasena, tipo_usuario) VALUES
('Carlos', 'carlos@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Ana', 'ana@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Luis', 'luis@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'premium'), -- pass: password123
('Maria', 'maria@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Jorge', 'jorge@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Laura', 'laura@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'premium'), -- pass: password123
('Pedro', 'pedro@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'), -- pass: password123
('Sofia', 'sofia@example.com', '$2b$10$E.qf/dC.6n.CVQ3T.tY.o.v22ITjT5l3aJ2.uUotvsoMMm9g233/K', 'publico'); -- pass: password123

-- Más Recetas (10)
INSERT INTO Recetas (titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id) VALUES
('Ensalada César', 'Clásica ensalada César con pollo a la parrilla.', 20, 15.00, TRUE, FALSE, 7, 3),
('Sopa de Tomate', 'Sopa de tomate casera, perfecta para un día frío.', 25, 10.00, TRUE, FALSE, 6, 4),
('Guacamole', 'Auténtico guacamole mexicano.', 10, 8.00, TRUE, FALSE, 5, 5),
('Limonada Fresca', 'Bebida refrescante de limón.', 5, 5.00, TRUE, FALSE, 8, 6),
('Puré de Papas', 'Cremoso puré de papas como guarnición.', 30, 12.00, TRUE, FALSE, 9, 7),
('Pasta Carbonara', 'Receta italiana de pasta con huevo, queso y panceta.', 25, 25.00, FALSE, TRUE, 2, 8),
('Huevos Benedictinos', 'Un desayuno clásico y elegante.', 20, 20.00, FALSE, TRUE, 1, 9),
('Brownies de Chocolate', 'Brownies densos y chocolatados.', 40, 18.00, TRUE, FALSE, 4, 10),
('Ceviche Peruano', 'Pescado fresco marinado en jugo de limón.', 15, 30.00, FALSE, TRUE, 5, 5),
('Sopa de Lentejas', 'Una sopa nutritiva y reconfortante.', 45, 14.00, TRUE, FALSE, 6, 4);

-- Más Ingredientes
INSERT INTO Ingredientes (nombre, unidad_medida) VALUES
('Lechuga Romana', 'pieza'),
('Pechuga de Pollo', 'g'),
('Crutones', 'g'),
('Queso Parmesano', 'g'),
('Aderezo César', 'ml'),
('Tomate', 'pieza'),
('Cebolla', 'pieza'),
('Ajo', 'diente'),
('Aguacate', 'pieza'),
('Limón', 'pieza'),
('Cilantro', 'manojo'),
('Papa', 'g'),
('Mantequilla', 'g'),
('Leche', 'ml'),
('Spaghetti', 'g'),
('Huevo', 'pieza'),
('Panceta', 'g'),
('Pescado Blanco', 'g'),
('Lentejas', 'g');

-- Relaciones para las nuevas recetas
INSERT INTO Receta_Ingrediente (id_receta, id_ingrediente, cantidad) VALUES
(3, 6, 1), (3, 7, 1), (3, 8, 1), (3, 9, 1), (3, 10, 1), -- Ensalada César
(4, 11, 4), (4, 12, 1), (4, 13, 2), -- Sopa de Tomate
(5, 14, 3), (5, 12, 1), (5, 15, 1), (5, 16, 2), -- Guacamole
(6, 16, 4), (6, 4, 100), -- Limonada
(7, 17, 500), (7, 18, 50), (7, 19, 100), -- Puré de Papas
(8, 20, 400), (8, 21, 3), (8, 22, 150), (8, 9, 100), -- Pasta Carbonara
(11, 23, 200), (11, 12, 1), (11, 16, 3); -- Ceviche

-- Pasos para algunas recetas nuevas
INSERT INTO Pasos (id_receta, numero_paso, descripcion) VALUES
(3, 1, 'Lavar y cortar la lechuga.'), (3, 2, 'Cocinar el pollo a la parrilla y cortarlo en tiras.'), (3, 3, 'Mezclar todo con el aderezo, crutones y queso.'),
(5, 1, 'Machacar los aguacates.'), (5, 2, 'Picar finamente la cebolla, tomate y cilantro.'), (5, 3, 'Mezclar todo y sazonar con limón y sal.');

-- =========================================================
-- ✅ FIN DEL SCRIPT
-- =========================================================
