// Calendar generation and rendering

const Calendar = {
    currentYear: 2025,
    showRenovacion: false,
    actividades: {},

    init() {
        this.currentYear = CONFIG.CURRENT_YEAR >= 2025 && CONFIG.CURRENT_YEAR <= 2026 ?
            CONFIG.CURRENT_YEAR : 2025;
        this.render(this.currentYear);
    },

    async loadActividades(year) {
        // Load from API
        const apiActividades = await Storage.fetchActividades(year);

        // Merge with data.js definitions
        const dataActividades = getAllActividades(year, this.showRenovacion);

        // Use API data if available, otherwise use default data
        this.actividades[year] = apiActividades.length > 0 ? apiActividades :
            Object.entries(dataActividades).map(([nombre, data]) => ({
                nombre,
                year,
                ...data
            }));
    },

    async render(year) {
        await this.loadActividades(year);

        const tableBody = document.getElementById(`calendarBody${year}`);
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const actividades = this.actividades[year] || [];

        actividades.forEach((actividad, index) => {
            // Skip renovation activities if not enabled
            if (actividad.es_renovacion && !this.showRenovacion) return;

            const row = document.createElement('tr');
            row.dataset.actividadId = index;
            row.dataset.actividadNombre = actividad.nombre;

            // Activity name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'activity-name';
            nameCell.textContent = actividad.nombre;
            if (actividad.es_determinante) {
                nameCell.textContent += ' 🔑';
            }
            row.appendChild(nameCell);

            // Week cells (52 weeks)
            for (let week = 1; week <= CONFIG.WEEKS_PER_YEAR; week++) {
                const cell = document.createElement('td');
                cell.dataset.week = week;
                cell.dataset.year = year;

                // Check if activity is scheduled for this week
                const semanas = Array.isArray(actividad.semanas) ?
                    actividad.semanas :
                    (actividad.semanas ? JSON.parse(actividad.semanas) : []);

                if (semanas.includes(week)) {
                    cell.classList.add('filled', actividad.clase);
                    cell.textContent = '●';
                }

                // Highlight current week
                if (year === CONFIG.CURRENT_YEAR && week === CONFIG.getCurrentWeek()) {
                    cell.classList.add('current-week');
                }

                // Make cell interactive
                cell.addEventListener('click', (e) => this.handleCellClick(e, actividad, week));

                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        });

        this.updateLegend();
        this.updateCurrentWeekInfo();
    },

    handleCellClick(event, actividad, week) {
        const cell = event.target;
        const isFilled = cell.classList.contains('filled');

        if (isFilled) {
            // Remove activity from this week
            cell.classList.remove('filled', actividad.clase);
            cell.textContent = '';
        } else {
            // Add activity to this week
            cell.classList.add('filled', actividad.clase);
            cell.textContent = '●';
        }

        // Update activity data (will be saved when user clicks save)
        console.log(`Activity "${actividad.nombre}" toggled for week ${week}`);
    },

    updateLegend() {
        const legendContainer = document.getElementById('legend');
        if (!legendContainer) return;

        legendContainer.innerHTML = '';

        const uniqueClasses = new Set();
        const actividades = this.actividades[this.currentYear] || [];

        actividades.forEach(act => {
            if (act.clase && !act.es_renovacion || (act.es_renovacion && this.showRenovacion)) {
                uniqueClasses.add(act.clase);
            }
        });

        uniqueClasses.forEach(clase => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const color = document.createElement('div');
            color.className = `legend-color ${clase}`;

            const label = document.createElement('span');
            label.textContent = clase.charAt(0).toUpperCase() + clase.slice(1);

            item.appendChild(color);
            item.appendChild(label);
            legendContainer.appendChild(item);
        });
    },

    updateCurrentWeekInfo() {
        const currentWeek = CONFIG.getCurrentWeek();
        const currentYear = new Date().getFullYear();
        const weekInfo = document.getElementById('currentWeekInfo');
        const statusInfo = document.getElementById('currentStatus');

        if (weekInfo) {
            const dateRange = CONFIG.getWeekDateRange(currentYear, currentWeek);
            weekInfo.textContent = `${currentWeek} (${dateRange.start} - ${dateRange.end})`;
        }

        if (statusInfo && currentYear >= 2025 && currentYear <= 2026) {
            const isDeterminant = CONFIG.DETERMINANT_WEEKS[currentYear]?.includes(currentWeek);
            statusInfo.textContent = isDeterminant ?
                '🔑 Semana de FERTILIZACIÓN (Determinante)' :
                '✓ Semana normal';
            statusInfo.style.color = isDeterminant ? '#dc2626' : '#059669';
            statusInfo.style.fontWeight = isDeterminant ? 'bold' : 'normal';
        }
    },

    toggleRenovacion() {
        this.showRenovacion = !this.showRenovacion;
        const toggle = document.getElementById('renovationToggle');
        if (toggle) {
            toggle.classList.toggle('active');
        }
        this.render(this.currentYear);
    },

    showYear(year) {
        this.currentYear = parseInt(year);

        // Update year buttons
        document.querySelectorAll('.year-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show/hide calendar tables
        document.querySelectorAll('.calendar-table').forEach(table => {
            table.style.display = 'none';
        });

        if (year === 'completo') {
            document.getElementById('calendarTable2025').style.display = 'table';
            document.getElementById('calendarTable2026').style.display = 'table';
            this.render(2025);
            this.render(2026);
        } else {
            document.getElementById(`calendarTable${year}`).style.display = 'table';
            this.render(parseInt(year));
        }
    }
};
