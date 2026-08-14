async function initTallerTerminado() {
    await loadTallerTerminadoData();
}

async function loadTallerTerminadoData() {
    try {
        const res = await api('/servicios/taller-terminado');
        
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
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'aparato', label: 'Apa' },
            { field: 'marca_modelo', label: 'Marca Mode' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usua' },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'servicios_requeridos', label: 'Servicios Req' },
            { field: 'resena_interna_servicios', label: 'Reseña Interna Servicios' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Lla', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lle', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita', format: 'date' },
            { field: 'entregado', label: 'Enti', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'garantia', label: 'Garantía' },
            { field: 'presup_palabras', label: 'Presup_p' },
            { field: 'terminado', label: 'teri', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'hora_entrega_desde', label: 'Hor' },
            { field: 'hora_entrega_hasta', label: 'Hor' }
        ];

        createAccessDatasheet(res, 'taller-terminado-grid', columns);
    } catch (e) {
        console.error('Error loading taller-terminado data:', e);
    }
}
