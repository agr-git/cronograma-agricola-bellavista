const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/lotes - Obtener todos los lotes
router.get('/', async (req, res) => {
    try {
        const lotes = await db.all('SELECT * FROM lotes ORDER BY id');
        res.json(lotes);
    } catch (error) {
        console.error('Error fetching lotes:', error);
        res.status(500).json({ error: 'Error al obtener lotes' });
    }
});

// GET /api/lotes/:id - Obtener lote específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lote = await db.get('SELECT * FROM lotes WHERE id = ?', [id]);

        if (!lote) {
            return res.status(404).json({ error: 'Lote no encontrado' });
        }

        res.json(lote);
    } catch (error) {
        console.error('Error fetching lote:', error);
        res.status(500).json({ error: 'Error al obtener lote' });
    }
});

// PUT /api/lotes/:id - Actualizar lote
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, area_ha, arboles, variedad, edad_anos, estado, notas } = req.body;

        await db.run(
            `UPDATE lotes
             SET nombre = ?, area_ha = ?, arboles = ?, variedad = ?,
                 edad_anos = ?, estado = ?, notas = ?
             WHERE id = ?`,
            [nombre, area_ha, arboles, variedad, edad_anos, estado, notas, id]
        );

        res.json({ message: 'Lote actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating lote:', error);
        res.status(500).json({ error: 'Error al actualizar lote' });
    }
});

module.exports = router;
