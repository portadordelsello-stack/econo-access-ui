async function initLlevarManana() {
    await loadLlevarMananaData();
}

async function loadLlevarMananaData() {
    try {
        const res = await api('/servicios/llevar-manana');
        
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
            { field: 'numero_direccion', label: 'Nume' },
            { field: 'piso', label: 'Pi' },
            { field: 'depto', label: 'D' },
            { field: 'hora_entrega_desde', label: 'Hora' },
            { field: 'hora_entrega_hasta', label: 'Hora' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'presupuesto', label: 'Presupuesto', format: 'currency' },
            { field: 'servicios_convenidos', label: 'Servicios Convenid' },
            { field: 'entregado', label: 'Entreg', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'cita_entrega', label: 'Cita entrega', format: 'date' },
            { field: 'info_logistica', label: 'info logistic' }
        ];

        createAccessDatasheet(res, 'llevar-manana-grid', columns);
    } catch (e) {
        console.error('Error loading llevar-manana data:', e);
    }
}
