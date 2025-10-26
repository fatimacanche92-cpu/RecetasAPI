import express from "express";
import db from "../db.js";

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Suscripcion:
 *       type: object
 *       required:
 *         - id_usuario
 *         - fecha_fin
 *         - monto
 *       properties:
 *         id_suscripcion:
 *           type: integer
 *           description: El ID auto-generado de la suscripción.
 *         id_usuario:
 *           type: integer
 *           description: El ID del usuario que se suscribe.
 *         fecha_inicio:
 *           type: string
 *           format: date-time
 *           description: La fecha en que inicia la suscripción.
 *         fecha_fin:
 *           type: string
 *           format: date-time
 *           description: La fecha en que termina la suscripción.
 *         monto:
 *           type: number
 *           format: float
 *           description: El costo de la suscripción.
 *       example:
 *         id_suscripcion: 1
 *         id_usuario: 2
 *         fecha_inicio: "2023-10-27T10:00:00Z"
 *         fecha_fin: "2023-11-27T10:00:00Z"
 *         monto: 99.99
 */

/**
 * @swagger
 * tags:
 *   name: Suscripciones
 *   description: API para la gestión de suscripciones de usuarios premium.
 */
// 💳 OBTENER TODAS LAS SUSCRIPCIONES (general, puede ser solo para admin)
/**
 * @swagger
 * /suscripciones:
 *   get:
 *     summary: Obtiene todas las suscripciones (solo para administradores)
 *     tags: [Suscripciones]
 *     responses:
 *       200:
 *         description: Una lista de todas las suscripciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Suscripcion'
 *       500:
 *         description: Error del servidor.
 */
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Suscripciones");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💳 OBTENER LAS SUSCRIPCIONES DE UN USUARIO
/**
 * @swagger
 * /suscripciones/usuario/{id_usuario}:
 *   get:
 *     summary: Obtiene las suscripciones de un usuario específico
 *     tags: [Suscripciones]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID del usuario.
 *     responses:
 *       200:
 *         description: Una lista de las suscripciones del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Suscripcion'
 */
router.get("/usuario/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Suscripciones WHERE id_usuario = ?", [id_usuario]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💳 OBTENER UNA SUSCRIPCIÓN POR SU ID
/**
 * @swagger
 * /suscripciones/{id_suscripcion}:
 *   get:
 *     summary: Obtiene una suscripción por su ID
 *     tags: [Suscripciones]
 *     parameters:
 *       - in: path
 *         name: id_suscripcion
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la suscripción.
 *     responses:
 *       200:
 *         description: La información de la suscripción.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Suscripcion'
 *       404:
 *         description: Suscripción no encontrada.
 */
router.get("/:id_suscripcion", async (req, res) => {
  const { id_suscripcion } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Suscripciones WHERE id_suscripcion = ?", [id_suscripcion]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Suscripción no encontrada" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💳 CREAR UNA NUEVA SUSCRIPCIÓN
/**
 * @swagger
 * /suscripciones:
 *   post:
 *     summary: Crea una nueva suscripción
 *     tags: [Suscripciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Suscripcion'
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 */
router.post("/", async (req, res) => {
  const { id_usuario, fecha_fin, monto } = req.body;
  if (!id_usuario || !fecha_fin || !monto) {
    return res.status(400).json({ error: "id_usuario, fecha_fin y monto son requeridos" });
  }
  try {
    const sql = "INSERT INTO Suscripciones (id_usuario, fecha_fin, monto) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [id_usuario, fecha_fin, monto]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💳 ACTUALIZAR UNA SUSCRIPCIÓN (ej. extender fecha)
/**
 * @swagger
 * /suscripciones/{id_suscripcion}:
 *   put:
 *     summary: Actualiza una suscripción existente
 *     tags: [Suscripciones]
 *     parameters:
 *       - in: path
 *         name: id_suscripcion
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la suscripción a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Suscripcion'
 *     responses:
 *       200:
 *         description: Suscripción actualizada correctamente.
 *       400:
 *         description: Datos de entrada inválidos.
 */
router.put("/:id_suscripcion", async (req, res) => {
  const { id_suscripcion } = req.params;
  const { fecha_fin, monto } = req.body;
  if (!fecha_fin || !monto) {
    return res.status(400).json({ error: "fecha_fin y monto son requeridos" });
  }
  try {
    const sql = "UPDATE Suscripciones SET fecha_fin=?, monto=? WHERE id_suscripcion=?";
    await db.query(sql, [fecha_fin, monto, id_suscripcion]);
    res.json({ mensaje: "Suscripción actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💳 ELIMINAR UNA SUSCRIPCIÓN
/**
 * @swagger
 * /suscripciones/{id_suscripcion}:
 *   delete:
 *     summary: Elimina una suscripción
 *     tags: [Suscripciones]
 *     parameters:
 *       - in: path
 *         name: id_suscripcion
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la suscripción a eliminar.
 *     responses:
 *       200:
 *         description: Suscripción eliminada correctamente.
 */
router.delete("/:id_suscripcion", async (req, res) => {
  const { id_suscripcion } = req.params;
  try {
    await db.query("DELETE FROM Suscripciones WHERE id_suscripcion=?", [id_suscripcion]);
    res.json({ mensaje: "Suscripción eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;