const express = require('express');
const router = express.Router();
const { createBackup, restoreBackup } = require('../../scripts/backup');
const path = require('path');
const fs = require('fs');

const BACKUP_PATH = process.env.BACKUP_PATH || path.join(__dirname, '../../backups');

// GET /api/backup/export - Exportar todos los datos
router.get('/export', async (req, res) => {
    try {
        const backupFile = await createBackup();
        const data = fs.readFileSync(backupFile, 'utf8');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="cronograma-backup-${new Date().toISOString()}.json"`);
        res.send(data);
    } catch (error) {
        console.error('Error exporting backup:', error);
        res.status(500).json({ error: 'Error al exportar datos' });
    }
});

// POST /api/backup/import - Importar datos desde JSON
router.post('/import', async (req, res) => {
    try {
        const backupData = req.body;

        if (!backupData || !backupData.data) {
            return res.status(400).json({ error: 'Datos de backup inválidos' });
        }

        // Save to temporary file
        const tempFile = path.join(BACKUP_PATH, `temp-restore-${Date.now()}.json`);
        fs.writeFileSync(tempFile, JSON.stringify(backupData));

        // Restore from temporary file
        await restoreBackup(tempFile);

        // Clean up temp file
        fs.unlinkSync(tempFile);

        res.json({ message: 'Datos importados exitosamente' });
    } catch (error) {
        console.error('Error importing backup:', error);
        res.status(500).json({ error: 'Error al importar datos' });
    }
});

// GET /api/backup/list - Listar backups disponibles
router.get('/list', (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_PATH)
            .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
            .map(f => {
                const filepath = path.join(BACKUP_PATH, f);
                const stats = fs.statSync(filepath);
                return {
                    filename: f,
                    size: stats.size,
                    created: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json(files);
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ error: 'Error al listar backups' });
    }
});

// GET /api/backup/auto - Estado de respaldos automáticos
router.get('/auto', (req, res) => {
    res.json({
        enabled: process.env.BACKUP_ENABLED === 'true',
        schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
        path: BACKUP_PATH
    });
});

module.exports = router;
