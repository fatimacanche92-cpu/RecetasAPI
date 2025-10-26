import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id_categoria:
 *           type: integer
 *           description: El ID auto-generado de la categoría.
 *         nombre:
 *           type: string
 *           description: El nombre de la categoría.
 *       example:
 *         id_categoria: 1
 *         nombre: "Postres"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: API para la gestión de categorías de recetas.
 */

// 🏷️ OBTENER TODAS LAS CATEGORÍAS
/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Obtiene una lista de todas las categorías.
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Una lista de categorías.
 */
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Categorias");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏷️ OBTENER UNA CATEGORÍA POR ID
/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por su ID.
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La información de la categoría.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Categorias WHERE id_categoria = ?", [id]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Categoría no encontrada" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏷️ CREAR UNA NUEVA CATEGORÍA
/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crea una nueva categoría.
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente.
 */
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
  try {
    const sql = "INSERT INTO Categorias (nombre) VALUES (?)";
    const [result] = await db.query(sql, [nombre]);
    res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏷️ ACTUALIZAR UNA CATEGORÍA
/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualiza una categoría existente.
 *     tags: [Categorias]
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
 *             $ref: '#/components/schemas/CategoriaUpdate'
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
  try {
    const sql = "UPDATE Categorias SET nombre=? WHERE id_categoria=?";
    await db.query(sql, [nombre, id]);
    res.json({ mensaje: "Categoría actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏷️ ELIMINAR UNA CATEGORÍA
/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría.
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada correctamente.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Categorias WHERE id_categoria=?", [id]);
    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;