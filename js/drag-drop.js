// Drag and Drop functionality for activity rescheduling

const DragDrop = {
    draggedElement: null,
    draggedActivity: null,

    init() {
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Event delegation for dynamically created elements
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'TR' && e.target.dataset.actividadNombre) {
                this.handleDragStart(e);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.tagName === 'TR') {
                this.handleDragEnd(e);
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.tagName === 'TD' && e.target.dataset.week) {
                this.handleDragOver(e);
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.tagName === 'TD' && e.target.dataset.week) {
                this.handleDrop(e);
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.tagName === 'TD') {
                this.handleDragLeave(e);
            }
        });
    },

    makeRowsDraggable() {
        document.querySelectorAll('tr[data-actividad-nombre]').forEach(row => {
            row.setAttribute('draggable', 'true');
            row.style.cursor = 'move';
        });
    },

    handleDragStart(e) {
        this.draggedElement = e.target;
        this.draggedActivity = {
            nombre: e.target.dataset.actividadNombre,
            id: e.target.dataset.actividadId
        };

        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    },

    handleDragEnd(e) {
        e.target.classList.remove('dragging');

        // Remove drag-over styling from all cells
        document.querySelectorAll('.drag-over').forEach(cell => {
            cell.classList.remove('drag-over');
        });

        this.draggedElement = null;
        this.draggedActivity = null;
    },

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        e.target.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';

        return false;
    },

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    },

    async handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        e.preventDefault();
        e.target.classList.remove('drag-over');

        if (!this.draggedActivity) return;

        const targetWeek = parseInt(e.target.dataset.week);
        const targetYear = parseInt(e.target.dataset.year);

        // Get current activity data
        const activityRow = this.draggedElement;
        const cells = activityRow.querySelectorAll('td[data-week]');

        // Find currently filled weeks
        const currentWeeks = [];
        cells.forEach(cell => {
            if (cell.classList.contains('filled')) {
                currentWeeks.push(parseInt(cell.dataset.week));
            }
        });

        // Calculate the offset
        const firstWeek = Math.min(...currentWeeks);
        const offset = targetWeek - firstWeek;

        // Calculate new weeks
        const newWeeks = currentWeeks.map(week => week + offset).filter(week => week >= 1 && week <= 52);

        // Clear old cells
        cells.forEach(cell => {
            if (cell.classList.contains('filled')) {
                const classes = Array.from(cell.classList);
                const activityClass = classes.find(c => c !== 'filled' && c !== 'current-week');
                cell.classList.remove('filled', activityClass);
                cell.textContent = '';
            }
        });

        // Fill new cells
        newWeeks.forEach(week => {
            const cell = activityRow.querySelector(`td[data-week="${week}"]`);
            if (cell) {
                // Get activity class from the first filled cell we found
                const activityClass = this.getActivityClass(activityRow);
                cell.classList.add('filled', activityClass);
                cell.textContent = '●';
            }
        });

        console.log(`Moved "${this.draggedActivity.nombre}" to weeks:`, newWeeks);

        // Log to historial
        try {
            await Storage.moveActividad(
                this.draggedActivity.id,
                newWeeks,
                'usuario'
            );
            this.showNotification('Actividad movida exitosamente', 'success');
        } catch (error) {
            console.error('Error moving activity:', error);
            this.showNotification('Error al mover actividad', 'error');
        }

        return false;
    },

    getActivityClass(row) {
        const filledCell = row.querySelector('td.filled');
        if (!filledCell) return '';

        const classes = Array.from(filledCell.classList);
        return classes.find(c => c !== 'filled' && c !== 'current-week' && c !== 'drag-over') || '';
    },

    showNotification(message, type = 'info') {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = type === 'success' ? '#059669' : '#dc2626';

            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    }
};
