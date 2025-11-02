# 🌱 Cronograma Agrícola - Finca Bellavista

Sistema integral de gestión de cronograma agrícola con persistencia de datos, diseñado para la administración eficiente de actividades en una finca cafetera de 15 hectáreas.

## 📋 Características Principales

- **Gestión de Actividades**: Planificación y seguimiento de actividades agrícolas
- **Drag & Drop**: Reorganización visual de actividades mediante arrastre
- **Persistencia Local**: Base de datos SQLite para almacenamiento permanente
- **Historial de Cambios**: Registro completo de modificaciones
- **Exportación/Importación**: Backup y restauración de datos en JSON
- **Vista Multi-Año**: Planificación 2025-2026 con proyecciones
- **Gestión por Lotes**: Control individualizado de 7 lotes productivos

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js v14 o superior
- npm o yarn
- Claude Code (opcional, para desarrollo asistido)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
```bash
cd proyecto-cronograma
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Inicializar la base de datos**
```bash
npm run init-db
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tu configuración
```

5. **Iniciar el servidor**
```bash
npm start
# O para desarrollo con auto-reload:
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
proyecto-cronograma/
├── index.html              # Página principal
├── package.json           # Configuración Node.js
├── server.js             # Servidor Express
├── .env                  # Variables de entorno
├── README.md            # Este archivo
│
├── css/                 # Estilos
│   └── styles.css      # Estilos principales
│
├── js/                  # Scripts del cliente
│   ├── config.js       # Configuración global
│   ├── data.js         # Datos de actividades
│   ├── storage.js      # Manejo de localStorage/API
│   ├── calendar.js     # Generación del calendario
│   ├── drag-drop.js    # Funcionalidad drag & drop
│   └── main.js         # Script principal
│
├── api/                 # Backend API
│   ├── routes/         # Rutas de la API
│   ├── models/         # Modelos de datos
│   └── controllers/    # Lógica de negocio
│
├── database/           # Base de datos
│   ├── cronograma.db  # SQLite database
│   └── migrations/    # Migraciones de BD
│
├── scripts/           # Scripts utilitarios
│   ├── init-db.js    # Inicializar base de datos
│   └── backup.js     # Script de respaldo
│
└── backups/          # Respaldos automáticos
```

## 💾 Base de Datos

### Esquema Principal

```sql
-- Tabla de actividades teóricas/planificadas
CREATE TABLE actividades (
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
CREATE TABLE actividades_reales (
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
CREATE TABLE historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_cambio TEXT NOT NULL, -- 'mover', 'agregar', 'eliminar'
    actividad TEXT,
    detalle TEXT, -- JSON con detalles del cambio
    usuario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de lotes
CREATE TABLE lotes (
    id TEXT PRIMARY KEY, -- L1, L2, etc.
    nombre TEXT,
    area_ha REAL,
    arboles INTEGER,
    variedad TEXT,
    edad_anos INTEGER,
    estado TEXT,
    notas TEXT
);
```

## 🔧 Uso con Claude Code

### Configuración Inicial

1. **Abrir el proyecto en Claude Code**
```bash
claude-code open proyecto-cronograma/
```

2. **Comandos útiles para Claude Code**
```bash
# Analizar el código actual
claude-code analyze

# Sugerir mejoras
claude-code suggest improvements

# Generar tests
claude-code generate tests

# Documentar funciones
claude-code document
```

### Ejemplos de Prompts para Claude Code

```text
"Ayúdame a agregar una nueva funcionalidad para calcular 
el rendimiento esperado basado en las actividades planificadas"

"Crea una API REST para sincronizar los datos con un 
servidor remoto"

"Optimiza las consultas a la base de datos para mejorar 
el rendimiento con lotes grandes de datos"

"Agrega validación de datos antes de guardar cambios 
en la base de datos"
```

## 📊 API Endpoints

### Actividades
- `GET /api/actividades/:year` - Obtener actividades por año
- `POST /api/actividades` - Crear nueva actividad
- `PUT /api/actividades/:id` - Actualizar actividad
- `DELETE /api/actividades/:id` - Eliminar actividad
- `POST /api/actividades/mover` - Mover actividad (drag & drop)

### Actividades Reales
- `GET /api/actividades-reales` - Obtener todas las actividades reales
- `POST /api/actividades-reales` - Registrar actividad ejecutada
- `GET /api/actividades-reales/lote/:lote` - Actividades por lote

### Historial
- `GET /api/historial` - Obtener historial completo
- `GET /api/historial/:fecha` - Historial por fecha
- `DELETE /api/historial` - Limpiar historial

### Respaldos
- `GET /api/backup/export` - Exportar todos los datos
- `POST /api/backup/import` - Importar datos desde JSON
- `GET /api/backup/auto` - Estado de respaldos automáticos

## 🎨 Personalización

### Modificar Colores de Actividades

En `css/styles.css`:
```css
.fertilización { background: #45b7d1; }
.plateo { background: #a29bfe; }
/* Agregar nuevos colores */
.nueva-actividad { background: #tu-color; }
```

### Agregar Nueva Actividad

En `js/data.js`:
```javascript
const actividadesPersonalizadas = {
    'Mi Nueva Actividad': {
        semanas: [1, 2, 3],
        clase: 'nueva-actividad',
        descripcion: 'Descripción de la actividad'
    }
};
```

## 🔐 Seguridad

- Los datos se almacenan localmente en SQLite
- Respaldos automáticos diarios
- Validación de entrada en cliente y servidor
- Sin datos sensibles en el código fuente

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer (no soportado)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📝 Notas de Desarrollo

### Para trabajar con Claude Code:

1. **Mantener contexto**: Guarda siempre el estado actual antes de hacer cambios grandes
2. **Documentar cambios**: Usa comentarios descriptivos para que Claude entienda el contexto
3. **Tests incrementales**: Prueba cada cambio antes de continuar
4. **Versionado semántico**: Actualiza version en package.json con cada release

### Comandos Útiles

```bash
# Crear respaldo manual
npm run backup

# Ver logs del servidor
tail -f logs/server.log

# Limpiar base de datos y reiniciar
npm run init-db -- --clean

# Ejecutar en modo debug
DEBUG=* npm run dev
```

## 🐛 Solución de Problemas

### La base de datos no se inicializa
```bash
# Verificar permisos
chmod 755 database/
chmod 644 database/cronograma.db

# Reiniciar base de datos
rm database/cronograma.db
npm run init-db
```

### Error de CORS
Agregar en `.env`:
```
CORS_ORIGIN=http://tu-dominio.com
```

### Puerto en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👤 Autor

**Alejo** - Finca Bellavista  
Proyecto de transformación digital agrícola

## 🙏 Agradecimientos

- Claude (Anthropic) por la asistencia en desarrollo
- Comunidad cafetera de Caldas
- Cenicafé por la información técnica

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: En desarrollo activo

Para soporte o preguntas, crear un issue en el repositorio.