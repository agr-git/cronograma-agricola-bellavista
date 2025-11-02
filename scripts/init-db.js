require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/cronograma.db');
const cleanStart = process.argv.includes('--clean');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('📁 Created database directory');
}

// Remove existing database if --clean flag is provided
if (cleanStart && fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🗑️  Removed existing database');
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Database schema
const schema = `
-- Tabla de actividades teóricas/planificadas
CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    year INTEGER NOT NULL,
    semanas TEXT, -- JSON array de semanas
    clase TEXT,
    descripcion TEXT,
    es_determinante BOOLEAN DEFAULT 0,
    es_renovacion BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actividades reales ejecutadas
CREATE TABLE IF NOT EXISTS actividades_reales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad TEXT NOT NULL,
    lote TEXT NOT NULL,
    semana INTEGER NOT NULL,
    year INTEGER NOT NULL,
    fecha_ejecucion DATE,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de cambios
CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_cambio TEXT NOT NULL, -- 'mover', 'agregar', 'eliminar'
    actividad TEXT,
    detalle TEXT, -- JSON con detalles del cambio
    usuario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de lotes
CREATE TABLE IF NOT EXISTS lotes (
    id TEXT PRIMARY KEY, -- L1, L2, etc.
    nombre TEXT,
    area_ha REAL,
    arboles INTEGER,
    variedad TEXT,
    edad_anos INTEGER,
    estado TEXT,
    notas TEXT
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_actividades_year ON actividades(year);
CREATE INDEX IF NOT EXISTS idx_actividades_nombre ON actividades(nombre);
CREATE INDEX IF NOT EXISTS idx_actividades_reales_lote ON actividades_reales(lote);
CREATE INDEX IF NOT EXISTS idx_actividades_reales_year ON actividades_reales(year);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial(fecha);
`;

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('❌ Error creating schema:', err.message);
        db.close();
        process.exit(1);
    }
    console.log('✅ Database schema created successfully');

    // Insert default lotes data
    const insertLotes = `
    INSERT OR REPLACE INTO lotes (id, nombre, area_ha, arboles, variedad, edad_anos, estado, notas)
    VALUES
        ('L1', 'Lote 1', 2.5, 12000, 'Castillo', 5, 'productivo', 'Lote principal'),
        ('L2', 'Lote 2', 2.0, 10000, 'Cenicafé 1', 4, 'productivo', NULL),
        ('L3', 'Lote 3', 2.5, 12000, 'Castillo', 6, 'productivo', NULL),
        ('L4', 'Lote 4', 2.0, 10000, 'Cenicafé 1', 3, 'productivo', NULL),
        ('L5', 'Lote 5', 2.5, 12450, 'Castillo', 5, 'productivo', NULL),
        ('L6', 'Lote 6', 2.0, 10000, 'Cenicafé 1', 7, 'productivo', 'Requiere renovación pronto'),
        ('L7', 'Lote 7', 1.5, 15000, 'Castillo', 4, 'productivo', 'Alta densidad');
    `;

    db.exec(insertLotes, (err) => {
        if (err) {
            console.error('⚠️  Warning: Could not insert lotes data:', err.message);
        } else {
            console.log('✅ Default lotes data inserted');
        }

        // Verify tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error('❌ Error verifying tables:', err.message);
            } else {
                console.log('\n📊 Database tables created:');
                tables.forEach(table => {
                    console.log(`   - ${table.name}`);
                });
            }

            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                    process.exit(1);
                }
                console.log('\n✅ Database initialization complete!');
                console.log(`📍 Database location: ${DB_PATH}`);
                console.log('\n🚀 You can now run: npm start');
            });
        });
    });
});
