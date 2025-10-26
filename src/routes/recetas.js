import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Receta:
 *       type: object
 *       required:
 *         - titulo
 *         - categoria_id
 *         - autor_id
 *       properties:
 *         id_receta:
 *           type: integer
 *           description: El ID auto-generado de la receta
 *         titulo:
 *           type: string
 *           description: El título de la receta
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la receta
 *         tiempo_preparacion:
 *           type: integer
 *           description: Tiempo en minutos para preparar la receta
 *         costo:
 *           type: number
 *           format: float
 *           description: Costo estimado de la receta
 *         es_publica:
 *           type: boolean
 *           description: Indica si la receta es pública
 *         es_premium:
 *           type: boolean
 *           description: Indica si la receta es premium
 *         categoria_id:
 *           type: integer
 *           description: ID de la categoría a la que pertenece la receta
 *         autor_id:
 *           type: integer
 *           description: ID del usuario autor de la receta
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la receta
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *           description: Última fecha de modificación de la receta
 *       example:
 *         id_receta: 1
 *         titulo: Tacos al Pastor
 *         descripcion: Receta tradicional con piña y carne marinada
 *         tiempo_preparacion: 30
 *         costo: 0.00
 *         es_publica: true
 *         es_premium: false
 *         categoria_id: 3
 *         autor_id: 1
 *         fecha_creacion: "2023-10-26T10:00:00Z"
 *         fecha_modificacion: "2023-10-26T10:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Recetas
 *   description: API para la gestión de recetas
 */

/**
 * @swagger
 * /recetas:
 *   get:
 *     summary: Obtener todas las recetas
 *     tags: [Recetas]
 *     responses:
 *       200:
 *         description: Lista de todas las recetas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Receta'
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        r.id_receta, r.titulo, r.descripcion, r.tiempo_preparacion, r.costo, 
        r.es_publica, r.es_premium, c.nombre AS categoria, u.nombre AS autor
      FROM Recetas r
      JOIN Categorias c ON r.categoria_id = c.id_categoria
      JOIN Usuarios u ON r.autor_id = u.id_usuario;
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /recetas/{id}:
 *   get:
 *     summary: Obtener una receta por ID
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la receta a obtener
 *     responses:
 *       200:
 *         description: Información de la receta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receta'
 *       404:
 *         description: Receta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT 
        r.id_receta, r.titulo, r.descripcion, r.tiempo_preparacion, r.costo, 
        r.es_publica, r.es_premium, c.nombre AS categoria, u.nombre AS autor
      FROM Recetas r
      JOIN Categorias c ON r.categoria_id = c.id_categoria
      JOIN Usuarios u ON r.autor_id = u.id_usuario
      WHERE r.id_receta = ?;
    `;
    const [results] = await db.query(sql, [id]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Receta no encontrada" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /recetas/buscar/{termino}:
 *   get:
 *     summary: Buscar recetas por título o ingredientes
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: termino
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda para título o ingredientes
 *     responses:
 *       200:
 *         description: Lista de recetas que coinciden con el término de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Receta'
 *       500:
 *         description: Error del servidor
 */
router.get("/buscar/:termino", async (req, res) => {
  const { termino } = req.params;
  try {
    const sql = `
      SELECT DISTINCT
        r.id_receta,
        r.titulo,
        r.descripcion,
        r.tiempo_preparacion,
        r.costo,
        r.es_publica,
        r.es_premium,
        c.nombre AS categoria,
        u.nombre AS autor
      FROM Recetas r
      JOIN Categorias c ON r.categoria_id = c.id_categoria
      JOIN Usuarios u ON r.autor_id = u.id_usuario
      LEFT JOIN Receta_Ingrediente ri ON r.id_receta = ri.id_receta
      LEFT JOIN Ingredientes i ON ri.id_ingrediente = i.id_ingrediente
      WHERE r.titulo LIKE ? OR i.nombre LIKE ?;
    `;
    const searchTerm = `%${termino}%`;
    const [results] = await db.query(sql, [searchTerm, searchTerm]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /recetas:
 *   post:
 *     summary: Crear una nueva receta
 *     tags: [Recetas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Receta'
 *     responses:
 *       201:
 *         description: Receta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receta'
 *       500:
 *         description: Error del servidor
 */
router.post("/", async (req, res) => {
  const { titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id } = req.body;
  try {
    const sql = "INSERT INTO Recetas (titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id]);
    res.status(201).json({ id_receta: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /recetas/{id}:
 *   put:
 *     summary: Actualizar una receta existente
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la receta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Receta'
 *     responses:
 *       200:
 *         description: Receta actualizada correctamente
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id } = req.body;
  try {
    const sql = "UPDATE Recetas SET titulo=?, descripcion=?, tiempo_preparacion=?, costo=?, es_publica=?, es_premium=?, categoria_id=?, autor_id=? WHERE id_receta=?";
    await db.query(sql, [titulo, descripcion, tiempo_preparacion, costo, es_publica, es_premium, categoria_id, autor_id, id]);
    res.json({ mensaje: "Receta actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /recetas/{id}:
 *   delete:
 *     summary: Eliminar una receta
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la receta a eliminar
 *     responses:
 *       200:
 *         description: Receta eliminada correctamente
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Recetas WHERE id_receta=?", [id]);
    res.json({ mensaje: "Receta eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
