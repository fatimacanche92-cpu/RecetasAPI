import express from "express";
import db from "../db.js";

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Valoracion:
 *       type: object
 *       required:
 *         - id_receta
 *         - id_usuario
 *         - puntuacion
 *       properties:
 *         id_valoracion:
 *           type: integer
 *           description: El ID auto-generado de la valoración.
 *         id_receta:
 *           type: integer
 *           description: El ID de la receta que se está valorando.
 *         id_usuario:
 *           type: integer
 *           description: El ID del usuario que realiza la valoración.
 *         puntuacion:
 *           type: integer
 *           description: Puntuación de 1 a 5.
 *         comentario:
 *           type: string
 *           description: Comentario opcional sobre la receta.
 *         fecha_valoracion:
 *           type: string
 *           format: date-time
 *           description: La fecha en que se realizó la valoración.
 *       example:
 *         id_valoracion: 1
 *         id_receta: 1
 *         id_usuario: 2
 *         puntuacion: 5
 *         comentario: "¡Deliciosos tacos!"
 */

/**
 * @swagger
 * tags:
 *   name: Valoraciones
 *   description: API para la gestión de valoraciones de recetas.
 */
// ⭐ OBTENER LAS VALORACIONES DE UNA RECETA
/**
 * @swagger
 * /valoraciones/receta/{id_receta}:
 *   get:
 *     summary: Obtiene todas las valoraciones de una receta específica.
 *     tags: [Valoraciones]
 *     parameters:
 *       - in: path
 *         name: id_receta
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Una lista de valoraciones para la receta.
 */
router.get("/receta/:id_receta", async (req, res) => {
  const { id_receta } = req.params;
  try {
    const sql = `
      SELECT v.*, u.nombre as nombre_usuario
      FROM Valoraciones v
      JOIN Usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.id_receta = ?
      ORDER BY v.fecha_valoracion DESC;
    `;
    const [results] = await db.query(sql, [id_receta]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ OBTENER UNA VALORACIÓN POR SU ID
/**
 * @swagger
 * /valoraciones/{id_valoracion}:
 *   get:
 *     summary: Obtiene una valoración por su ID.
 *     tags: [Valoraciones]
 *     parameters:
 *       - in: path
 *         name: id_valoracion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La información de la valoración.
 */
router.get("/:id_valoracion", async (req, res) => {
  const { id_valoracion } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Valoraciones WHERE id_valoracion = ?", [id_valoracion]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Valoración no encontrada" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ CREAR UNA NUEVA VALORACIÓN
/**
 * @swagger
 * /valoraciones:
 *   post:
 *     summary: Crea una nueva valoración para una receta.
 *     tags: [Valoraciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Valoracion'
 *     responses:
 *       201:
 *         description: Valoración creada exitosamente.
 */
router.post("/", async (req, res) => {
  const { id_receta, id_usuario, puntuacion, comentario } = req.body;
  if (!id_receta || !id_usuario || !puntuacion) {
    return res.status(400).json({ error: "id_receta, id_usuario y puntuacion son requeridos" });
  }
  try {
    const sql = "INSERT INTO Valoraciones (id_receta, id_usuario, puntuacion, comentario) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [id_receta, id_usuario, puntuacion, comentario]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ ACTUALIZAR UNA VALORACIÓN
/**
 * @swagger
 * /valoraciones/{id_valoracion}:
 *   put:
 *     summary: Actualiza una valoración existente.
 *     tags: [Valoraciones]
 *     parameters:
 *       - in: path
 *         name: id_valoracion
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Valoracion'
 *     responses:
 *       200:
 *         description: Valoración actualizada correctamente.
 */
router.put("/:id_valoracion", async (req, res) => {
  const { id_valoracion } = req.params;
  const { puntuacion, comentario } = req.body;
  if (!puntuacion) {
    return res.status(400).json({ error: "La puntuacion es requerida" });
  }
  try {
    const sql = "UPDATE Valoraciones SET puntuacion=?, comentario=? WHERE id_valoracion=?";
    await db.query(sql, [puntuacion, comentario, id_valoracion]);
    res.json({ mensaje: "Valoración actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ ELIMINAR UNA VALORACIÓN
/**
 * @swagger
 * /valoraciones/{id_valoracion}:
 *   delete:
 *     summary: Elimina una valoración.
 *     tags: [Valoraciones]
 *     parameters:
 *       - in: path
 *         name: id_valoracion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Valoración eliminada correctamente.
 */
router.delete("/:id_valoracion", async (req, res) => {
  const { id_valoracion } = req.params;
  try {
    await db.query("DELETE FROM Valoraciones WHERE id_valoracion=?", [id_valoracion]);
    res.json({ mensaje: "Valoración eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;