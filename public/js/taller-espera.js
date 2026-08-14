async function initTallerEspera() {
    await loadTallerEsperaData();
}

async function loadTallerEsperaData() {
    try {
        const res = await api('/servicios/taller-espera');
        
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
            { field: 'id_servicio', label: 'Id' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Nu' },
            { field: 'fecha', label: 'Fech', format: 'date' },
            { field: 'aparato', label: 'Ap' },
            { field: 'marca_modelo', label: 'Marc' },
            { field: 'desperfecto_usuario', label: 'D. Usuario' },
            { field: 'servicios_requeridos', label: 'S. Reque' },
            { field: 'resena_interna_servicios', label: 'R Interna' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Lla', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lle', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita en', format: 'date' },
            { field: 'repuestos_comprar', label: 'Rep. Comp' },
            { field: 'repuestos_comprados', label: 'R', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'pasa_a_stock', label: 'stc', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'hora_entrega_desde', label: 'Hor' },
            { field: 'hora_entrega_hasta', label: 'Hor' },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'terminado', label: 'ter', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'tecnico', label: 'tecnico' },
            { field: 'fichaok', label: 'ficha', format: 'checkbox', onChange: makeCheckboxHandler('fichaok') }
        ];

        createAccessDatasheet(res, 'taller-espera-grid', columns);
    } catch (e) {
        console.error('Error loading taller-espera data:', e);
    }
}
