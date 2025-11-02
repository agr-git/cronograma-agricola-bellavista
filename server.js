require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const winston = require('winston');
const cron = require('node-cron');

// Import API routes
const actividadesRoutes = require('./api/routes/actividades');
const actividadesRealesRoutes = require('./api/routes/actividadesReales');
const historialRoutes = require('./api/routes/historial');
const backupRoutes = require('./api/routes/backup');
const lotesRoutes = require('./api/routes/lotes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'combined.log')
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// API Routes
app.use('/api/actividades', actividadesRoutes);
app.use('/api/actividades-reales', actividadesRealesRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/lotes', lotesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Server Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(err.status || 500).json({
        error: 'Error del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// Scheduled backup task (runs daily at 2 AM)
if (process.env.BACKUP_ENABLED === 'true') {
    const backupSchedule = process.env.BACKUP_SCHEDULE || '0 2 * * *';
    cron.schedule(backupSchedule, () => {
        logger.info('Running scheduled backup...');
        const { createBackup } = require('./scripts/backup');
        createBackup()
            .then(() => logger.info('Scheduled backup completed'))
            .catch(err => logger.error('Scheduled backup failed:', err));
    });
    logger.info(`Backup scheduled: ${backupSchedule}`);
}

// Start server
app.listen(PORT, () => {
    logger.info(`🌱 Cronograma Agrícola Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database: ${process.env.DB_PATH || './database/cronograma.db'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
