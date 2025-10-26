import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Paso:
 *       type: object
 *       required:
 *         - id_receta
 *         - numero_paso
 *         - descripcion
 *       properties:
 *         id_paso:
 *           type: integer
 *           description: El ID auto-generado del paso.
 *         id_receta:
 *           type: integer
 *           description: El ID de la receta a la que pertenece el paso.
 *         numero_paso:
 *           type: integer
 *           description: El orden del paso en la secuencia de la receta.
 *         descripcion:
 *           type: string
 *           description: La descripción detallada del paso.
 *       example:
 *         id_paso: 1
 *         id_receta: 1
 *         numero_paso: 1
 *         descripcion: "Cortar la carne en trozos pequeños."
 */

/**
 * @swagger
 * tags:
 *   name: Pasos
 *   description: API para la gestión de los pasos de una receta.
 */

// 🪜 OBTENER LOS PASOS DE UNA RECETA
/**
 * @swagger
 * /pasos/receta/{id_receta}:
 *   get:
 *     summary: Obtiene todos los pasos de una receta específica.
 *     tags: [Pasos]
 *     parameters:
 *       - in: path
 *         name: id_receta
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Una lista de los pasos de la receta, ordenados por número de paso.
 */
// 🪜 OBTENER LOS PASOS DE UNA RECETA
router.get("/receta/:id_receta", async (req, res) => {
  const { id_receta } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Pasos WHERE id_receta = ? ORDER BY numero_paso", [id_receta]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /pasos/{id_paso}:
 *   get:
 *     summary: Obtiene un paso específico por su ID.
 *     tags: [Pasos]
 *     parameters:
 *       - in: path
 *         name: id_paso
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La información del paso.
 */
// 🪜 OBTENER UN PASO POR SU ID
router.get("/:id_paso", async (req, res) => {
  const { id_paso } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Pasos WHERE id_paso = ?", [id_paso]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Paso no encontrado" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /pasos:
 *   post:
 *     summary: Crea un nuevo paso para una receta.
 *     tags: [Pasos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paso'
 *     responses:
 *       201:
 *         description: Paso creado exitosamente.
 */
// 🪜 CREAR UN NUEVO PASO
router.post("/", async (req, res) => {
  const { id_receta, numero_paso, descripcion } = req.body;
  if (!id_receta || !numero_paso || !descripcion) {
    return res.status(400).json({ error: "id_receta, numero_paso y descripcion son requeridos" });
  }
  try {
    const sql = "INSERT INTO Pasos (id_receta, numero_paso, descripcion) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [id_receta, numero_paso, descripcion]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /pasos/{id_paso}:
 *   put:
 *     summary: Actualiza un paso existente.
 *     tags: [Pasos]
 *     parameters:
 *       - in: path
 *         name: id_paso
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paso'
 *     responses:
 *       200:
 *         description: Paso actualizado correctamente.
 */
// 🪜 ACTUALIZAR UN PASO
router.put("/:id_paso", async (req, res) => {
  const { id_paso } = req.params;
  const { numero_paso, descripcion } = req.body;
  if (!numero_paso || !descripcion) {
    return res.status(400).json({ error: "numero_paso y descripcion son requeridos" });
  }
  try {
    const sql = "UPDATE Pasos SET numero_paso=?, descripcion=? WHERE id_paso=?";
    await db.query(sql, [numero_paso, descripcion, id_paso]);
    res.json({ mensaje: "Paso actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /pasos/{id_paso}:
 *   delete:
 *     summary: Elimina un paso.
 *     tags: [Pasos]
 *     parameters:
 *       - in: path
 *         name: id_paso
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paso eliminado correctamente.
 */
// 🪜 ELIMINAR UN PASO
router.delete("/:id_paso", async (req, res) => {
  const { id_paso } = req.params;
  try {
    await db.query("DELETE FROM Pasos WHERE id_paso=?", [id_paso]);
    res.json({ mensaje: "Paso eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;