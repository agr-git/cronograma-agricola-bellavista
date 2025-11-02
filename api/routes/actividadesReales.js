const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/actividades-reales - Obtener todas las actividades reales
router.get('/', async (req, res) => {
    try {
        const { year, lote } = req.query;
        let sql = 'SELECT * FROM actividades_reales WHERE 1=1';
        const params = [];

        if (year) {
            sql += ' AND year = ?';
            params.push(year);
        }

        if (lote) {
            sql += ' AND lote = ?';
            params.push(lote);
        }

        sql += ' ORDER BY year, semana';

        const actividades = await db.all(sql, params);
        res.json(actividades);
    } catch (error) {
        console.error('Error fetching actividades reales:', error);
        res.status(500).json({ error: 'Error al obtener actividades reales' });
    }
});

// GET /api/actividades-reales/lote/:lote - Actividades por lote
router.get('/lote/:lote', async (req, res) => {
    try {
        const { lote } = req.params;
        const actividades = await db.all(
            'SELECT * FROM actividades_reales WHERE lote = ? ORDER BY year, semana',
            [lote]
        );
        res.json(actividades);
    } catch (error) {
        console.error('Error fetching actividades by lote:', error);
        res.status(500).json({ error: 'Error al obtener actividades del lote' });
    }
});

// POST /api/actividades-reales - Registrar actividad ejecutada
router.post('/', async (req, res) => {
    try {
        const { actividad, lote, semana, year, fecha_ejecucion, notas } = req.body;

        if (!actividad || !lote || !semana || !year) {
            return res.status(400).json({
                error: 'Actividad, lote, semana y año son requeridos'
            });
        }

        const result = await db.run(
            `INSERT INTO actividades_reales (actividad, lote, semana, year, fecha_ejecucion, notas)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [actividad, lote, semana, year, fecha_ejecucion || new Date().toISOString(), notas]
        );

        res.status(201).json({
            id: result.lastID,
            message: 'Actividad real registrada exitosamente'
        });
    } catch (error) {
        console.error('Error creating actividad real:', error);
        res.status(500).json({ error: 'Error al registrar actividad real' });
    }
});

// DELETE /api/actividades-reales/:id - Eliminar actividad real
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM actividades_reales WHERE id = ?', [id]);
        res.json({ message: 'Actividad real eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting actividad real:', error);
        res.status(500).json({ error: 'Error al eliminar actividad real' });
    }
});

module.exports = router;
