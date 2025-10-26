import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 10; // Factor de coste para el hasheo
/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - contrasena
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: El ID auto-generado del usuario.
 *         nombre:
 *           type: string
 *           description: El nombre del usuario.
 *         email:
 *           type: string
 *           format: email
 *           description: El email del usuario (debe ser único).
 *         contrasena:
 *           type: string
 *           format: password
 *           description: La contraseña del usuario (será hasheada).
 *         tipo_usuario:
 *           type: string
 *           enum: [publico, premium]
 *           default: publico
 *           description: El tipo de cuenta del usuario.
 *       example:
 *         id_usuario: 1
 *         nombre: "Melani"
 *         email: "melani@example.com"
 *         tipo_usuario: "publico"
 */

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: API para la gestión de usuarios.
 */
// ✅ Obtener todos los usuarios
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios.
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Una lista de usuarios (sin la contraseña).
 */
router.get("/", async (req, res) => {
  // Excluimos la contraseña de la respuesta por seguridad
  const sql = "SELECT id_usuario, nombre, email, tipo_usuario, fecha_registro FROM Usuarios";
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear un nuevo usuario
/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un nuevo usuario.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 */
router.post("/", async (req, res) => {
  const { nombre, email, contrasena, tipo_usuario } = req.body;
  try {
    // Hashear la contraseña antes de guardarla
    const hash = await bcrypt.hash(contrasena, saltRounds);
    const sql = "INSERT INTO Usuarios (nombre, email, contrasena, tipo_usuario) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [nombre, email, hash, tipo_usuario]);
    // No devolvemos el hash en la respuesta
    res.status(201).json({ id: result.insertId, nombre, email, tipo_usuario });
  } catch (err) {
    if (err) return res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar usuario
/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario existente.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, tipo_usuario, contrasena } = req.body;

  try {
    // Si se proporciona una nueva contraseña, la hasheamos.
    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, saltRounds);
      const sql = "UPDATE Usuarios SET nombre = ?, email = ?, tipo_usuario = ?, contrasena = ? WHERE id_usuario = ?";
      await db.query(sql, [nombre, email, tipo_usuario, hash, id]);
    } else {
      // Si no se proporciona contraseña, actualizamos los otros campos.
      const sql = "UPDATE Usuarios SET nombre = ?, email = ?, tipo_usuario = ? WHERE id_usuario = ?";
      await db.query(sql, [nombre, email, tipo_usuario, id]);
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar usuario
/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Usuarios WHERE id_usuario = ?", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
