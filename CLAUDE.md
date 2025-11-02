# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cronograma Agrícola - Finca Bellavista** is a full-stack web application for managing agricultural scheduling on a 15-hectare coffee farm with 81,450 trees across 7 productive lots at 1200-1350 msnm elevation. The system provides visual calendar-based planning with drag-and-drop functionality, activity tracking, and data persistence.

**Domain**: Coffee farm management (Variedades Castillo y Cenicafé 1)
**Language**: Spanish (UI, documentation, database content)
**Status**: Early development - core HTML structure exists, backend implementation pending

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run init-db         # Initialize SQLite database with schema
npm run dev             # Start development server with auto-reload (nodemon)
npm start               # Start production server (port 3000)
```

### Database & Backup
```bash
npm run backup          # Create manual database backup
npm run init-db -- --clean   # Reinitialize database (destructive)
DEBUG=* npm run dev     # Run with debug logging enabled
```

### Environment Setup
```bash
cp .env.example .env    # Create environment config (PORT, CORS_ORIGIN)
```

## Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 - no framework
- **Backend**: Node.js + Express.js 4.18.2
- **Database**: SQLite3 5.1.6 (local file-based)
- **Key Libraries**: Winston (logging), node-cron (scheduled backups), Multer (file uploads)

### Application Structure

**Client-Side Modules** (referenced in index.html, need implementation):
- `js/config.js` - Global configuration constants
- `js/data.js` - Activity definitions and agricultural data
- `js/storage.js` - API communication layer (abstracts localStorage/backend)
- `js/calendar.js` - Calendar generation and week-based rendering
- `js/drag-drop.js` - Drag & drop activity rescheduling
- `js/main.js` - Application orchestration and initialization

**Backend Structure** (documented but not implemented):
- `server.js` - Express server entry point (port 3000)
- `api/routes/` - RESTful API route definitions
- `api/controllers/` - Business logic for activity management
- `api/models/` - Database models and queries
- `scripts/init-db.js` - Database schema initialization
- `scripts/backup.js` - Backup utility with node-cron integration

### Database Schema

**Four Core Tables**:
1. **actividades** - Planned/theoretical activities with week assignments (JSON array)
2. **actividades_reales** - Executed activities with actual completion dates
3. **historial** - Change log (tipo_cambio: 'mover', 'agregar', 'eliminar') with JSON details
4. **lotes** - Lot configuration (id: L1-L7, area_ha, arboles, variedad, edad_anos, estado)

Key fields: `es_determinante` (critical timing), `es_renovacion` (renovation activities)

## Agricultural Domain Knowledge

### Activity Sequence (Critical)
Activities follow a strict temporal sequence tied to **fertilization** (determinant activity):
1. **Guadaña** (brush cutting): 4 weeks before desbejuque
2. **Desbejucar** (weed removal): 2-3 weeks before plateo
3. **Plateo + Deschupona** (weeding + sucker removal): 4 weeks before fertilization
4. **Fertilización** (KEY ACTIVITY): Weeks 20-21 and 46-47 (semi-annual cycle)

### Spanish Terminology
- **cronograma** = schedule/calendar
- **lotes** = agricultural lots/plots (L1-L7)
- **semanas** = weeks (52-week planning cycle)
- **actividades determinantes** = timing-critical activities
- **actividades de renovación** = renovation/replanting activities
- **msnm** = meters above sea level

### Farm Configuration
- 7 productive lots with individual tracking
- Multi-year planning (2025-2026 with projections)
- Week-based granularity (not daily)
- Activity color-coding by type in CSS

## Key API Endpoints

**Activities**:
- `GET /api/actividades/:year` - Get planned activities
- `POST /api/actividades/mover` - Handle drag-and-drop moves
- `PUT /api/actividades/:id` - Update activity

**Real Activities**:
- `GET /api/actividades-reales/lote/:lote` - Activities by lot
- `POST /api/actividades-reales` - Record completed activity

**Backup**:
- `GET /api/backup/export` - Export all data as JSON
- `POST /api/backup/import` - Import from JSON backup

**History**:
- `GET /api/historial` - Full change log
- `DELETE /api/historial` - Clear history

## Development Patterns

### File Organization
- Single Page Application (SPA) with tab-based navigation
- No page reloads - dynamic content rendering via JavaScript
- Modular separation: config, data, storage, UI, interactions
- CSS classes map to activity types for color-coding

### Data Flow
1. Client loads initial data from API/localStorage
2. User interactions update in-memory state
3. Manual save writes to backend/localStorage
4. Drag-and-drop triggers activity reassignment
5. All changes logged to historial table

### Testing Approach
- Incremental testing recommended (no test framework currently)
- Manual verification via browser at localhost:3000
- Check database state with SQLite CLI tools

## Important Conventions

### Naming
- Use Spanish for domain terminology (activities, field names)
- UI labels and messages in Spanish
- Code comments can be English or Spanish
- CSS classes match activity names (e.g., `.fertilización`, `.plateo`)

### State Management
- Three-tier persistence: database (primary), localStorage (fallback), JSON export (backup)
- Optimistic UI updates with server sync
- Change history tracks usuario (user), tipo_cambio (change type), detalle (JSON details)

### Security Notes
- Local-first architecture (SQLite, no external servers)
- CORS configuration required if frontend served separately
- Input validation needed on both client and server
- No sensitive data in code (use .env for configuration)

## Development Context

### Current State
The project archive contains only:
- `index.html` (complete UI structure with 5 tabs, calendar tables, controls)
- `package.json` (dependencies specified, scripts defined)
- `README.md` (comprehensive documentation)

**Missing**: Backend implementation (server.js, API, database scripts), CSS styling, JavaScript modules

### Next Steps for Implementation
1. Create `server.js` with Express configuration and API routes
2. Implement `scripts/init-db.js` with SQL schema from README
3. Build JavaScript modules (config, data, storage, calendar, drag-drop, main)
4. Create `css/styles.css` with activity color schemes and responsive layout
5. Set up `.env.example` template with PORT and CORS_ORIGIN

### Browser Compatibility
Target: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (IE not supported)

## Troubleshooting

**Database Issues**:
```bash
# Fix permissions
chmod 755 database/
chmod 644 database/cronograma.db

# Reinitialize if corrupted
rm database/cronograma.db && npm run init-db
```

**Port Conflicts**: Change `PORT=3001` in `.env`

**CORS Errors**: Set `CORS_ORIGIN=http://localhost:3000` in `.env` (or appropriate domain)

## Version & Author

- **Version**: 1.0.0
- **Author**: Alejo - Finca Bellavista
- **License**: MIT
- **Last Updated**: November 2025
