const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/actividades/:year - Obtener actividades por año
router.get('/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const actividades = await db.all(
            'SELECT * FROM actividades WHERE year = ? ORDER BY nombre',
            [year]
        );

        // Parse semanas JSON string to array
        const parsed = actividades.map(act => ({
            ...act,
            semanas: act.semanas ? JSON.parse(act.semanas) : []
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching actividades:', error);
        res.status(500).json({ error: 'Error al obtener actividades' });
    }
});

// GET /api/actividades - Obtener todas las actividades
router.get('/', async (req, res) => {
    try {
        const actividades = await db.all(
            'SELECT * FROM actividades ORDER BY year, nombre'
        );

        const parsed = actividades.map(act => ({
            ...act,
            semanas: act.semanas ? JSON.parse(act.semanas) : []
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching all actividades:', error);
        res.status(500).json({ error: 'Error al obtener actividades' });
    }
});

// POST /api/actividades - Crear nueva actividad
router.post('/', async (req, res) => {
    try {
        const { nombre, year, semanas, clase, descripcion, es_determinante, es_renovacion } = req.body;

        if (!nombre || !year) {
            return res.status(400).json({ error: 'Nombre y año son requeridos' });
        }

        const result = await db.run(
            `INSERT INTO actividades (nombre, year, semanas, clase, descripcion, es_determinante, es_renovacion)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, year, JSON.stringify(semanas || []), clase, descripcion, es_determinante || 0, es_renovacion || 0]
        );

        res.status(201).json({
            id: result.lastID,
            message: 'Actividad creada exitosamente'
        });
    } catch (error) {
        console.error('Error creating actividad:', error);
        res.status(500).json({ error: 'Error al crear actividad' });
    }
});

// PUT /api/actividades/:id - Actualizar actividad
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, year, semanas, clase, descripcion, es_determinante, es_renovacion } = req.body;

        await db.run(
            `UPDATE actividades
             SET nombre = ?, year = ?, semanas = ?, clase = ?, descripcion = ?,
                 es_determinante = ?, es_renovacion = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [nombre, year, JSON.stringify(semanas || []), clase, descripcion,
             es_determinante || 0, es_renovacion || 0, id]
        );

        res.json({ message: 'Actividad actualizada exitosamente' });
    } catch (error) {
        console.error('Error updating actividad:', error);
        res.status(500).json({ error: 'Error al actualizar actividad' });
    }
});

// DELETE /api/actividades/:id - Eliminar actividad
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM actividades WHERE id = ?', [id]);
        res.json({ message: 'Actividad eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting actividad:', error);
        res.status(500).json({ error: 'Error al eliminar actividad' });
    }
});

// POST /api/actividades/mover - Mover actividad (drag & drop)
router.post('/mover', async (req, res) => {
    try {
        const { id, nuevasSemanas, usuario } = req.body;

        if (!id || !nuevasSemanas) {
            return res.status(400).json({ error: 'ID y nuevas semanas son requeridas' });
        }

        // Get current activity data
        const actividad = await db.get('SELECT * FROM actividades WHERE id = ?', [id]);

        if (!actividad) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        // Update activity
        await db.run(
            'UPDATE actividades SET semanas = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(nuevasSemanas), id]
        );

        // Log to historial
        const detalle = JSON.stringify({
            semanas_anteriores: JSON.parse(actividad.semanas || '[]'),
            semanas_nuevas: nuevasSemanas
        });

        await db.run(
            `INSERT INTO historial (tipo_cambio, actividad, detalle, usuario)
             VALUES (?, ?, ?, ?)`,
            ['mover', actividad.nombre, detalle, usuario || 'sistema']
        );

        res.json({ message: 'Actividad movida exitosamente' });
    } catch (error) {
        console.error('Error moving actividad:', error);
        res.status(500).json({ error: 'Error al mover actividad' });
    }
});

module.exports = router;
