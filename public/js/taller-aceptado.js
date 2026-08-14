async function initTallerAceptado() {
    await loadTallerAceptadoData();
}

async function loadTallerAceptadoData() {
    try {
        const res = await api('/servicios/taller-aceptado');
        
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
            { field: 'piso', label: 'P' },
            { field: 'depto', label: 'D' },
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'aparato', label: 'Apa' },
            { field: 'marca_modelo', label: 'Marca Mode' },
            { field: 'desperfecto_usuario', label: 'Desperfec' },
            { field: 'servicios_requeridos', label: 'Servici' },
            { field: 'resena_interna_servicios', label: 'Reseña In' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Lla', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lle', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita', format: 'date' },
            { field: 'hora_entrega_desde', label: 'Hor' },
            { field: 'hora_entrega_hasta', label: 'Hor' },
            { field: 'repuestos_comprar', label: 'Repues' },
            { field: 'repuestos_comprados', label: 'R', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'entregado', label: 'En', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'garantia', label: 'Gara' },
            { field: 'presup_palabras', label: 'Presup_p' },
            { field: 'terminado', label: 'te', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'tecnico', label: 'tecnico' }
        ];

        createAccessDatasheet(res, 'taller-aceptado-grid', columns);
    } catch (e) {
        console.error('Error loading taller-aceptado data:', e);
    }
}
