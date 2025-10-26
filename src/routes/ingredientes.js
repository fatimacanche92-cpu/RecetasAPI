import express from "express";
import db from "../db.js";

const router = express.Router();

// 🧂 OBTENER TODOS LOS INGREDIENTES
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Ingredientes");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧂 OBTENER UN INGREDIENTE POR ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM Ingredientes WHERE id_ingrediente = ?", [id]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Ingrediente no encontrado" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧂 CREAR UN NUEVO INGREDIENTE
router.post("/", async (req, res) => {
  const { nombre, unidad_medida } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
  try {
    const sql = "INSERT INTO Ingredientes (nombre, unidad_medida) VALUES (?, ?)";
    const [result] = await db.query(sql, [nombre, unidad_medida]);
    res.status(201).json({ id: result.insertId, nombre, unidad_medida });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧂 ACTUALIZAR UN INGREDIENTE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, unidad_medida } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
  try {
    const sql = "UPDATE Ingredientes SET nombre=?, unidad_medida=? WHERE id_ingrediente=?";
    await db.query(sql, [nombre, unidad_medida, id]);
    res.json({ mensaje: "Ingrediente actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧂 ELIMINAR UN INGREDIENTE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Ingredientes WHERE id_ingrediente=?", [id]);
    res.json({ mensaje: "Ingrediente eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;