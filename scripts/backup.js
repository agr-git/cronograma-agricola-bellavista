require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/cronograma.db');
const BACKUP_PATH = process.env.BACKUP_PATH || path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
    console.log('📁 Created backup directory');
}

/**
 * Create a backup of all database data as JSON
 */
async function createBackup() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('❌ Error connecting to database:', err.message);
                reject(err);
                return;
            }
        });

        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: {}
        };

        const tables = ['actividades', 'actividades_reales', 'historial', 'lotes'];
        let completed = 0;

        tables.forEach(table => {
            db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                if (err) {
                    console.error(`❌ Error reading ${table}:`, err.message);
                    reject(err);
                    db.close();
                    return;
                }

                backup.data[table] = rows;
                completed++;

                if (completed === tables.length) {
                    // All tables read, save backup
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `backup-${timestamp}.json`;
                    const filepath = path.join(BACKUP_PATH, filename);

                    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
                    console.log(`✅ Backup created: ${filename}`);
                    console.log(`   - actividades: ${backup.data.actividades.length} registros`);
                    console.log(`   - actividades_reales: ${backup.data.actividades_reales.length} registros`);
                    console.log(`   - historial: ${backup.data.historial.length} registros`);
                    console.log(`   - lotes: ${backup.data.lotes.length} registros`);

                    // Clean old backups (keep last 30 days)
                    cleanOldBackups(30);

                    db.close();
                    resolve(filepath);
                }
            });
        });
    });
}

/**
 * Restore database from a backup file
 */
async function restoreBackup(backupFilePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(backupFilePath)) {
            reject(new Error('Backup file not found'));
            return;
        }

        const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
        });

        console.log(`🔄 Restoring backup from ${path.basename(backupFilePath)}...`);

        db.serialize(() => {
            // Begin transaction
            db.run('BEGIN TRANSACTION');

            try {
                // Clear existing data
                db.run('DELETE FROM actividades');
                db.run('DELETE FROM actividades_reales');
                db.run('DELETE FROM historial');
                db.run('DELETE FROM lotes');

                // Restore lotes
                const lotesStmt = db.prepare(`
                    INSERT INTO lotes (id, nombre, area_ha, arboles, variedad, edad_anos, estado, notas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                backupData.data.lotes.forEach(lote => {
                    lotesStmt.run(lote.id, lote.nombre, lote.area_ha, lote.arboles,
                        lote.variedad, lote.edad_anos, lote.estado, lote.notas);
                });
                lotesStmt.finalize();

                // Restore actividades
                const actStmt = db.prepare(`
                    INSERT INTO actividades (nombre, year, semanas, clase, descripcion, es_determinante, es_renovacion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                backupData.data.actividades.forEach(act => {
                    actStmt.run(act.nombre, act.year, act.semanas, act.clase,
                        act.descripcion, act.es_determinante, act.es_renovacion);
                });
                actStmt.finalize();

                // Restore actividades_reales
                const realStmt = db.prepare(`
                    INSERT INTO actividades_reales (actividad, lote, semana, year, fecha_ejecucion, notas)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                backupData.data.actividades_reales.forEach(real => {
                    realStmt.run(real.actividad, real.lote, real.semana, real.year,
                        real.fecha_ejecucion, real.notas);
                });
                realStmt.finalize();

                // Restore historial
                const histStmt = db.prepare(`
                    INSERT INTO historial (tipo_cambio, actividad, detalle, usuario, fecha)
                    VALUES (?, ?, ?, ?, ?)
                `);
                backupData.data.historial.forEach(hist => {
                    histStmt.run(hist.tipo_cambio, hist.actividad, hist.detalle,
                        hist.usuario, hist.fecha);
                });
                histStmt.finalize();

                // Commit transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                    } else {
                        console.log('✅ Backup restored successfully');
                        db.close();
                        resolve();
                    }
                });
            } catch (error) {
                db.run('ROLLBACK');
                reject(error);
            }
        });
    });
}

/**
 * Clean backups older than specified days
 */
function cleanOldBackups(days) {
    const files = fs.readdirSync(BACKUP_PATH);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;

    files.forEach(file => {
        if (!file.startsWith('backup-') || !file.endsWith('.json')) return;

        const filepath = path.join(BACKUP_PATH, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filepath);
            deletedCount++;
        }
    });

    if (deletedCount > 0) {
        console.log(`🗑️  Cleaned ${deletedCount} old backup(s)`);
    }
}

// Run backup if called directly
if (require.main === module) {
    createBackup()
        .then(() => {
            console.log('✅ Backup completed successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Backup failed:', err.message);
            process.exit(1);
        });
}

module.exports = {
    createBackup,
    restoreBackup,
    cleanOldBackups
};
