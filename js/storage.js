// Storage and API communication layer

const Storage = {
    // API Methods
    async fetchActividades(year) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/actividades/${year}`);
            if (!response.ok) throw new Error('Error fetching actividades');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            // Fallback to localStorage
            return this.getLocal(CONFIG.STORAGE_KEYS.ACTIVIDADES + '_' + year) || [];
        }
    },

    async saveActividad(actividad) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/actividades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actividad)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving actividad:', error);
            throw error;
        }
    },

    async moveActividad(id, nuevasSemanas, usuario = 'usuario') {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/actividades/mover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nuevasSemanas, usuario })
            });
            return await response.json();
        } catch (error) {
            console.error('Error moving actividad:', error);
            throw error;
        }
    },

    async fetchActividadesReales(lote = null, year = null) {
        try {
            let url = `${CONFIG.API_BASE_URL}/actividades-reales?`;
            if (lote) url += `lote=${lote}&`;
            if (year) url += `year=${year}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error fetching actividades reales');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    async saveActividadReal(actividad) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/actividades-reales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actividad)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving actividad real:', error);
            throw error;
        }
    },

    async fetchLotes() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/lotes`);
            if (!response.ok) throw new Error('Error fetching lotes');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return this.getLocal(CONFIG.STORAGE_KEYS.LOTES) || [];
        }
    },

    async fetchHistorial(limit = 100) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/historial?limit=${limit}`);
            if (!response.ok) throw new Error('Error fetching historial');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    async exportData() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/backup/export`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cronograma-backup-${new Date().toISOString()}.json`;
            a.click();
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error al exportar datos');
        }
    },

    async importData(fileData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/backup/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    },

    // LocalStorage fallback methods
    saveLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    },

    getLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return null;
        }
    },

    removeLocal(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }
};
