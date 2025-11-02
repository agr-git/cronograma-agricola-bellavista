// Agricultural activities data for Finca Bellavista

const ACTIVIDADES_2025 = {
    // Actividades determinantes (fertilización)
    'Fertilización 1° Semestre': {
        semanas: [20, 21],
        clase: 'fertilización',
        descripcion: 'Fertilización primer semestre - Actividad determinante',
        es_determinante: true,
        es_renovacion: false
    },
    'Fertilización 2° Semestre': {
        semanas: [46, 47],
        clase: 'fertilización',
        descripcion: 'Fertilización segundo semestre - Actividad determinante',
        es_determinante: true,
        es_renovacion: false
    },

    // Actividades de mantenimiento general
    'Plateo 1': {
        semanas: [16, 17],
        clase: 'plateo',
        descripcion: 'Plateo antes de fertilización del primer semestre (4 semanas antes)',
        es_determinante: false,
        es_renovacion: false
    },
    'Plateo 2': {
        semanas: [42, 43],
        clase: 'plateo',
        descripcion: 'Plateo antes de fertilización del segundo semestre (4 semanas antes)',
        es_determinante: false,
        es_renovacion: false
    },
    'Deschupona 1': {
        semanas: [16, 17],
        clase: 'deschupona',
        descripcion: 'Deschupona conjunta con plateo del primer semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Deschupona 2': {
        semanas: [42, 43],
        clase: 'deschupona',
        descripcion: 'Deschupona conjunta con plateo del segundo semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Desbejucar 1': {
        semanas: [13, 14],
        clase: 'desbejucar',
        descripcion: 'Desbejucar 2-3 semanas antes del plateo del primer semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Desbejucar 2': {
        semanas: [39, 40],
        clase: 'desbejucar',
        descripcion: 'Desbejucar 2-3 semanas antes del plateo del segundo semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Guadaña 1': {
        semanas: [9, 10],
        clase: 'guadaña',
        descripcion: 'Guadaña 4 semanas antes del desbejuque del primer semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Guadaña 2': {
        semanas: [35, 36],
        clase: 'guadaña',
        descripcion: 'Guadaña 4 semanas antes del desbejuque del segundo semestre',
        es_determinante: false,
        es_renovacion: false
    },

    // Actividades adicionales
    'Poda': {
        semanas: [5, 6, 7],
        clase: 'poda',
        descripcion: 'Poda de mantenimiento',
        es_determinante: false,
        es_renovacion: false
    },
    'Fumigación': {
        semanas: [15, 28, 41],
        clase: 'fumigación',
        descripcion: 'Fumigación preventiva',
        es_determinante: false,
        es_renovacion: false
    }
};

const ACTIVIDADES_2026 = {
    // Similar structure for 2026 (optimized cycle)
    'Fertilización 1° Semestre': {
        semanas: [20, 21],
        clase: 'fertilización',
        descripcion: 'Fertilización primer semestre - Actividad determinante',
        es_determinante: true,
        es_renovacion: false
    },
    'Fertilización 2° Semestre': {
        semanas: [46, 47],
        clase: 'fertilización',
        descripcion: 'Fertilización segundo semestre - Actividad determinante',
        es_determinante: true,
        es_renovacion: false
    },
    'Plateo 1': {
        semanas: [16, 17],
        clase: 'plateo',
        descripcion: 'Plateo antes de fertilización del primer semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Plateo 2': {
        semanas: [42, 43],
        clase: 'plateo',
        descripcion: 'Plateo antes de fertilización del segundo semestre',
        es_determinante: false,
        es_renovacion: false
    },
    'Deschupona 1': {
        semanas: [16, 17],
        clase: 'deschupona',
        descripcion: 'Deschupona conjunta con plateo',
        es_determinante: false,
        es_renovacion: false
    },
    'Deschupona 2': {
        semanas: [42, 43],
        clase: 'deschupona',
        descripcion: 'Deschupona conjunta con plateo',
        es_determinante: false,
        es_renovacion: false
    },
    'Desbejucar 1': {
        semanas: [13, 14],
        clase: 'desbejucar',
        descripcion: 'Desbejucar antes del plateo',
        es_determinante: false,
        es_renovacion: false
    },
    'Desbejucar 2': {
        semanas: [39, 40],
        clase: 'desbejucar',
        descripcion: 'Desbejucar antes del plateo',
        es_determinante: false,
        es_renovacion: false
    },
    'Guadaña 1': {
        semanas: [9, 10],
        clase: 'guadaña',
        descripcion: 'Guadaña antes del desbejuque',
        es_determinante: false,
        es_renovacion: false
    },
    'Guadaña 2': {
        semanas: [35, 36],
        clase: 'guadaña',
        descripcion: 'Guadaña antes del desbejuque',
        es_determinante: false,
        es_renovacion: false
    },
    'Poda': {
        semanas: [5, 6, 7],
        clase: 'poda',
        descripcion: 'Poda de mantenimiento',
        es_determinante: false,
        es_renovacion: false
    },
    'Fumigación': {
        semanas: [15, 28, 41],
        clase: 'fumigación',
        descripcion: 'Fumigación preventiva',
        es_determinante: false,
        es_renovacion: false
    }
};

// Actividades de renovación (opcional)
const ACTIVIDADES_RENOVACION = {
    'Trazado': {
        semanas: [8],
        clase: 'trazado',
        descripcion: 'Trazado para renovación',
        es_determinante: false,
        es_renovacion: true
    },
    'Ahoyado': {
        semanas: [9, 10],
        clase: 'ahoyado',
        descripcion: 'Ahoyado para siembra',
        es_determinante: false,
        es_renovacion: true
    },
    'Siembra': {
        semanas: [11, 12],
        clase: 'siembra',
        descripcion: 'Siembra de chapolas',
        es_determinante: false,
        es_renovacion: true
    },
    'Replante': {
        semanas: [24, 25],
        clase: 'replante',
        descripcion: 'Replante de fallas',
        es_determinante: false,
        es_renovacion: true
    }
};

// Get activities for specific year
function getActividadesPorYear(year) {
    if (year === 2025) return ACTIVIDADES_2025;
    if (year === 2026) return ACTIVIDADES_2026;
    return {};
}

// Get all activities including renovation if enabled
function getAllActividades(year, incluirRenovacion = false) {
    const actividades = getActividadesPorYear(year);
    if (incluirRenovacion) {
        return { ...actividades, ...ACTIVIDADES_RENOVACION };
    }
    return actividades;
}
