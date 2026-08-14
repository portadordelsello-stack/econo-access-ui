async function initLlevarMananaMas() {
    await loadLlevarMananaMasData();
}

async function loadLlevarMananaMasData() {
    try {
        const res = await api('/servicios/llevar-aceptado-pas-pas-manana');
        
        const makeCheckboxHandler = (field) => async (row, checked) => {
            try {
                await api(`/servicios/${row.id_servicio}`, {
                    method: 'PUT',
                    body: { [field]: checked ? 1 : 0 }
                });
                row[field] = checked ? 1 : 0;
            } catch (e) {
                console.error(`Error updating ${field}:`, e);
                showNotification(`Error al actualizar ${field}`, 'error');
            }
        };

        const columns = [
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Numero' },
            { field: 'piso', label: 'Piso' },
            { field: 'depto', label: 'Dep' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'servicios_convenidos', label: 'Servicios Convenid' },
            { field: 'entregado', label: 'Entreg', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'cita_entrega', label: 'Cita entr', format: 'date' },
            { field: 'hora_entrega_desde', label: 'Hora entr' },
            { field: 'hora_entrega_hasta', label: 'Hora er' },
            { field: 'info_logistica', label: 'info logistica' }
        ];

        createAccessDatasheet(res, 'llevar-manana-mas-grid', columns);
    } catch (e) {
        console.error('Error loading llevar-manana-mas data:', e);
    }
}
