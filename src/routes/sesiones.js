import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sesiones
 *   description: API para la gestión de sesiones de usuario (login/logout).
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - contrasena
 *       properties:
 *         email:
 *           type: string
 *           description: El email del usuario.
 *         contrasena:
 *           type: string
 *           format: password
 *           description: La contraseña del usuario.
 *       example:
 *         email: "fatima@example.com"
 *         contrasena: "password123"
 *     Sesion:
 *       type: object
 *       properties:
 *         id_sesion:
 *           type: integer
 *         id_usuario:
 *           type: integer
 *         mensaje:
 *           type: string
 */

// 🕓 INICIAR SESIÓN (crear una sesión)
/**
 * @swagger
 * /sesiones/login:
 *   post:
 *     summary: Inicia sesión de un usuario.
 *     tags: [Sesiones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       201:
 *         description: Sesión iniciada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sesion'
 *       400:
 *         description: Email o contraseña requeridos.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error del servidor.
 */
router.post("/login", async (req, res) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena) {
    return res.status(400).json({ error: "El email y la contraseña son requeridos" });
  }

  try {
    // 1. Buscar al usuario por email
    const [users] = await db.query("SELECT * FROM Usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const user = users[0];

    // 2. Comparar la contraseña enviada con el hash guardado
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Crear la sesión
    const sql = "INSERT INTO Sesiones (id_usuario) VALUES (?)";
    const [result] = await db.query(sql, [user.id_usuario]);
    res.status(201).json({ id_sesion: result.insertId, id_usuario: user.id_usuario, mensaje: "Sesión iniciada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🕓 CERRAR SESIÓN (actualizar fecha_cierre)
/**
 * @swagger
 * /sesiones/logout:
 *   post:
 *     summary: Cierra una sesión activa.
 *     tags: [Sesiones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_sesion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente.
 *       404:
 *         description: La sesión no existe o ya estaba cerrada.
 */
router.post("/logout", async (req, res) => {
  const { id_sesion } = req.body;
  if (!id_sesion) {
    return res.status(400).json({ error: "El id_sesion es requerido" });
  }
  try {
    const sql = "UPDATE Sesiones SET fecha_cierre = NOW() WHERE id_sesion = ? AND fecha_cierre IS NULL";
    const [result] = await db.query(sql, [id_sesion]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "La sesión no existe o ya estaba cerrada" });
    }
    res.json({ mensaje: "Sesión cerrada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;