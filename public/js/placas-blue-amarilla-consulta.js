async function initPlacasBlueAmarillaConsulta() {
    await loadPlacasBlueAmarillaConsultaData();
}

async function loadPlacasBlueAmarillaConsultaData() {
    try {
        const res = await api('/servicios/placas-blue-amarilla-consulta');
        const columns = [
            { field: 'id', label: 'Id' },
            { field: 'codigo', label: 'codigo' },
            { field: 'codigo_abreviado', label: 'codigo abrevi' },
            { field: 'hardware', label: 'hard' },
            { field: 'software', label: 'softw' },
            { field: 'marca', label: 'marca' },
            { field: 'modelo', label: 'modelo' }
        ];
        createAccessDatasheet(res, 'placas-blue-amarilla-consulta-grid', columns);
    } catch (e) {
        console.error('Error loading placas-blue-amarilla-consulta data:', e);
    }
}
