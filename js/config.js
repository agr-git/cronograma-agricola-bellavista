// Global configuration for Cronograma Agrícola

const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.origin + '/api',

    // Calendar Configuration
    WEEKS_PER_YEAR: 52,
    YEARS: [2025, 2026],
    CURRENT_YEAR: new Date().getFullYear(),

    // Months configuration (weeks per month)
    MONTHS: {
        'ENE': [1, 2, 3, 4],
        'FEB': [5, 6, 7, 8],
        'MAR': [9, 10, 11, 12, 13],
        'ABR': [14, 15, 16, 17],
        'MAY': [18, 19, 20, 21],
        'JUN': [22, 23, 24, 25, 26],
        'JUL': [27, 28, 29, 30],
        'AGO': [31, 32, 33, 34, 35],
        'SEP': [36, 37, 38, 39],
        'OCT': [40, 41, 42, 43],
        'NOV': [44, 45, 46, 47, 48],
        'DIC': [49, 50, 51, 52]
    },

    // Lotes configuration
    LOTES: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'],

    // Activity colors
    ACTIVITY_COLORS: {
        'Fertilización': 'fertilización',
        'Plateo': 'plateo',
        'Deschupona': 'deschupona',
        'Desbejucar': 'desbejucar',
        'Guadaña': 'guadaña',
        'Siembra': 'siembra',
        'Trazado': 'trazado',
        'Ahoyado': 'ahoyado',
        'Replante': 'replante',
        'Renovación': 'renovación',
        'Fumigación': 'fumigación',
        'Poda': 'poda'
    },

    // Determinant activities (critical timing)
    DETERMINANT_WEEKS: {
        2025: [20, 21, 46, 47],
        2026: [20, 21, 46, 47]
    },

    // Storage keys
    STORAGE_KEYS: {
        ACTIVIDADES: 'cronograma_actividades',
        LOTES: 'cronograma_lotes',
        SETTINGS: 'cronograma_settings'
    }
};

// Calculate current week number
CONFIG.getCurrentWeek = function() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
};

// Get week date range
CONFIG.getWeekDateRange = function(year, week) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    return {
        start: weekStart.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
        end: weekEnd.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    };
};
