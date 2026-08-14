async function initLlevadoAyer() {
    await loadLlevadoAyerData();
}

async function loadLlevadoAyerData() {
    try {
        const res = await api('/servicios/llevado-ayer');
        
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
            { field: 'numero_direccion', label: 'Num' },
            { field: 'piso', label: 'Pis' },
            { field: 'depto', label: 'De' },
            { field: 'marca_modelo', label: 'Marca Mo' },
            { field: 'presupuesto', label: 'Presupue', format: 'currency' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'entregado', label: 'Entregad', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'cita_entrega', label: 'Cita entr', format: 'date' },
            { field: 'hora_entrega_desde', label: 'des' },
            { field: 'hora_entrega_hasta', label: 'hasta' },
            { field: 'desperfecto_usuario', label: 'D Usuario' },
            { field: 'presup_palabras', label: 'Presup_palat' },
            { field: 'aparato', label: 'Aparat' },
            { field: 'garantia', label: 'Garantía' },
            { field: 'factura', label: 'fact', format: 'checkbox', onChange: makeCheckboxHandler('factura') },
            { field: 'resena_interna_servicios', label: 'Reseñ' }
        ];

        createAccessDatasheet(res, 'llevado-ayer-grid', columns);
    } catch (e) {
        console.error('Error loading llevado-ayer data:', e);
    }
}
