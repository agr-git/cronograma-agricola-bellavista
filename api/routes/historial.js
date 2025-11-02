const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/historial - Obtener historial completo
router.get('/', async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        const historial = await db.all(
            'SELECT * FROM historial ORDER BY fecha DESC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );

        // Parse detalle JSON
        const parsed = historial.map(h => ({
            ...h,
            detalle: h.detalle ? JSON.parse(h.detalle) : null
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching historial:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// GET /api/historial/:fecha - Historial por fecha
router.get('/:fecha', async (req, res) => {
    try {
        const { fecha } = req.params;
        const historial = await db.all(
            'SELECT * FROM historial WHERE DATE(fecha) = ? ORDER BY fecha DESC',
            [fecha]
        );

        const parsed = historial.map(h => ({
            ...h,
            detalle: h.detalle ? JSON.parse(h.detalle) : null
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching historial by date:', error);
        res.status(500).json({ error: 'Error al obtener historial por fecha' });
    }
});

// DELETE /api/historial - Limpiar historial
router.delete('/', async (req, res) => {
    try {
        const { before } = req.query;

        if (before) {
            await db.run('DELETE FROM historial WHERE fecha < ?', [before]);
        } else {
            await db.run('DELETE FROM historial');
        }

        res.json({ message: 'Historial limpiado exitosamente' });
    } catch (error) {
        console.error('Error clearing historial:', error);
        res.status(500).json({ error: 'Error al limpiar historial' });
    }
});

module.exports = router;
