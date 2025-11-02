// Main application initialization and orchestration

// Global state
let currentTab = 'general';
let lotes = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌱 Initializing Cronograma Agrícola...');

    try {
        // Initialize modules
        Calendar.init();
        DragDrop.init();

        // Load initial data
        await loadLotes();

        // Make rows draggable after calendar renders
        setTimeout(() => {
            DragDrop.makeRowsDraggable();
        }, 500);

        // Set up week number headers
        setupWeekHeaders();

        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showError('Error al inicializar la aplicación');
    }
});

// Tab Management
function showTab(tabName) {
    currentTab = tabName;

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Mark button as active
    event.target.classList.add('active');

    // Load tab-specific content
    if (tabName === 'lotes') {
        renderLotesView();
    } else if (tabName === 'info') {
        renderInfoView();
    } else if (tabName === 'historial') {
        renderHistorialView();
    }
}

// Year Selection
function showYear(year) {
    Calendar.showYear(year);
}

// Renovation Toggle
function toggleRenovation() {
    Calendar.toggleRenovacion();
}

// Setup week number headers
function setupWeekHeaders() {
    const headers = ['weekNumbers2025', 'weekNumbers2026'];

    headers.forEach(headerId => {
        const header = document.getElementById(headerId);
        if (!header) return;

        header.innerHTML = '';

        for (let week = 1; week <= CONFIG.WEEKS_PER_YEAR; week++) {
            const th = document.createElement('th');
            th.textContent = week;
            th.style.fontSize = '0.85em';

            // Highlight determinant weeks
            const year = parseInt(headerId.replace('weekNumbers', ''));
            if (CONFIG.DETERMINANT_WEEKS[year]?.includes(week)) {
                th.style.background = '#dc2626';
                th.style.color = 'white';
                th.title = 'Semana determinante (Fertilización)';
            }

            header.appendChild(th);
        }
    });
}

// Save Changes
async function saveChanges() {
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;

    try {
        saveBtn.textContent = '💾 Guardando...';
        saveBtn.disabled = true;

        // Collect all activity data from the calendar
        const actividades2025 = collectActivityData(2025);
        const actividades2026 = collectActivityData(2026);

        // Save to API
        for (const act of [...actividades2025, ...actividades2026]) {
            await Storage.saveActividad(act);
        }

        showNotification('Cambios guardados exitosamente', 'success');
    } catch (error) {
        console.error('Error saving changes:', error);
        showNotification('Error al guardar cambios', 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// Collect activity data from calendar
function collectActivityData(year) {
    const activities = [];
    const tableBody = document.getElementById(`calendarBody${year}`);
    if (!tableBody) return activities;

    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const nombre = row.dataset.actividadNombre;
        if (!nombre) return;

        const semanas = [];
        const cells = row.querySelectorAll('td[data-week]');

        cells.forEach(cell => {
            if (cell.classList.contains('filled')) {
                semanas.push(parseInt(cell.dataset.week));
            }
        });

        const activityClass = DragDrop.getActivityClass(row) || 'general';

        activities.push({
            nombre,
            year,
            semanas,
            clase: activityClass,
            descripcion: '',
            es_determinante: nombre.includes('Fertilización'),
            es_renovacion: ['Trazado', 'Ahoyado', 'Siembra', 'Replante'].some(r => nombre.includes(r))
        });
    });

    return activities;
}

// Export Data
async function exportData() {
    try {
        await Storage.exportData();
        showNotification('Datos exportados exitosamente', 'success');
    } catch (error) {
        console.error('Error exporting:', error);
        showNotification('Error al exportar datos', 'error');
    }
}

// Import Data
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                await Storage.importData(data);

                showNotification('Datos importados exitosamente', 'success');

                // Reload the calendar
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } catch (error) {
                console.error('Error parsing file:', error);
                showNotification('Archivo inválido', 'error');
            }
        };

        reader.readAsText(file);
    } catch (error) {
        console.error('Error importing:', error);
        showNotification('Error al importar datos', 'error');
    }
}

// Load Lotes
async function loadLotes() {
    try {
        lotes = await Storage.fetchLotes();
        console.log('Loaded lotes:', lotes);
    } catch (error) {
        console.error('Error loading lotes:', error);
    }
}

// Render Lotes View
async function renderLotesView() {
    if (lotes.length === 0) {
        await loadLotes();
    }

    const container = document.getElementById('lotes');
    if (!container) return;

    let html = '<div class="lotes-grid">';

    for (const lote of lotes) {
        html += `
            <div class="lote-card">
                <h3>${lote.id} - ${lote.nombre}</h3>
                <div class="lote-info">
                    <div><strong>Área:</strong> ${lote.area_ha} ha</div>
                    <div><strong>Árboles:</strong> ${lote.arboles?.toLocaleString()}</div>
                    <div><strong>Variedad:</strong> ${lote.variedad}</div>
                    <div><strong>Edad:</strong> ${lote.edad_anos} años</div>
                    <div><strong>Estado:</strong> ${lote.estado}</div>
                    ${lote.notas ? `<div colspan="2"><strong>Notas:</strong> ${lote.notas}</div>` : ''}
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Render Info View
function renderInfoView() {
    const container = document.getElementById('info');
    if (!container) return;

    container.innerHTML = `
        <h2>Información de Lotes</h2>
        <table class="info-table">
            <thead>
                <tr>
                    <th>Lote</th>
                    <th>Nombre</th>
                    <th>Área (ha)</th>
                    <th>Árboles</th>
                    <th>Variedad</th>
                    <th>Edad (años)</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${lotes.map(lote => `
                    <tr>
                        <td>${lote.id}</td>
                        <td>${lote.nombre}</td>
                        <td>${lote.area_ha}</td>
                        <td>${lote.arboles?.toLocaleString()}</td>
                        <td>${lote.variedad}</td>
                        <td>${lote.edad_anos}</td>
                        <td>${lote.estado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Render Historial View
async function renderHistorialView() {
    const container = document.getElementById('historial');
    if (!container) return;

    try {
        const historial = await Storage.fetchHistorial(50);

        let html = '<h2>📊 Historial de Cambios</h2>';

        if (historial.length === 0) {
            html += '<p>No hay cambios registrados aún.</p>';
        } else {
            historial.forEach(item => {
                html += `
                    <div class="historial-item ${item.tipo_cambio}">
                        <div class="historial-header">
                            <span><strong>${item.tipo_cambio.toUpperCase()}:</strong> ${item.actividad || 'N/A'}</span>
                            <span>${new Date(item.fecha).toLocaleString('es-CO')}</span>
                        </div>
                        <div class="historial-detalle">
                            Usuario: ${item.usuario || 'Sistema'}
                            ${item.detalle ? `<br>Detalle: ${JSON.stringify(item.detalle)}` : ''}
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading historial:', error);
        container.innerHTML = '<p>Error al cargar el historial.</p>';
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const statusElement = document.getElementById('saveStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6';

        setTimeout(() => {
            statusElement.textContent = '';
        }, 3000);
    }
}

// Show Error
function showError(message) {
    alert(message);
}
