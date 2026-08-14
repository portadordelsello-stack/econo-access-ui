async function initTallerJoel() {
    await loadTallerJoelData();
}

async function loadTallerJoelData() {
    try {
        const res = await api('/servicios/taller-joel');
        
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
            { field: 'aparato', label: 'Apar' },
            { field: 'marca_modelo', label: 'Marca Mo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usu' },
            { field: 'servicios_requeridos', label: 'Servicios Re' },
            { field: 'resena_interna_servicios', label: 'Reseña Interna Servi' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' },
            { field: 'tecnico', label: 'tecnico' },
            { field: 'ingreso_taller', label: 'Ingr', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'entregado', label: 'Entr', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'pasa_a_stock', label: 'Pasa', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'repuestos_comprar', label: 'Repuestos C' },
            { field: 'repuestos_comprados', label: 'Repu', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'cita_entrega', label: 'Cita entreg', format: 'date' },
            { field: 'terminado', label: 'termin', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'presupuesto', label: 'Presup', format: 'currency' },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'id_servicio', label: 'Id' }
        ];

        createAccessDatasheet(res, 'taller-joel-grid', columns);
    } catch (e) {
        console.error('Error loading taller-joel data:', e);
    }
}
