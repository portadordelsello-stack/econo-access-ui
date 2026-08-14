async function initTallerCristian() {
    await loadTallerCristianData();
}

async function loadTallerCristianData() {
    try {
        const res = await api('/servicios/taller-cristian');
        
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
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Nur' },
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usuario' },
            { field: 'servicios_requeridos', label: 'Servicios Requeric' },
            { field: 'resena_interna_servicios', label: 'Expr1007' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' },
            { field: 'ingreso_taller', label: 'Ing', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'entregado', label: 'Er', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'pasa_a_stock', label: 'Pa', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'cita_entrega', label: 'Cita entre', format: 'date' },
            { field: 'presupuesto', label: 'Presupi', format: 'currency' },
            { field: 'tecnico', label: 'tecnico' },
            { field: 'id_servicio', label: 'Id' }
        ];

        createAccessDatasheet(res, 'taller-cristian-grid', columns);
    } catch (e) {
        console.error('Error loading taller-cristian data:', e);
    }
}
