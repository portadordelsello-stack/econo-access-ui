async function initTallerAndres() {
    await loadTallerAndresData();
}

async function loadTallerAndresData() {
    try {
        const res = await api('/servicios/taller-andres');
        
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
            { field: 'numero_direccion', label: 'Nu' },
            { field: 'aparato', label: 'Ap' },
            { field: 'marca_modelo', label: 'Marca I' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usuar' },
            { field: 'servicios_requeridos', label: 'Servicios R' },
            { field: 'resena_interna_servicios', label: 'Reseña Interna Servicios' },
            { field: 'tecnico', label: 'tec' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' },
            { field: 'hora_entrega_desde', label: 'Hor' },
            { field: 'hora_entrega_hasta', label: 'Hor' },
            { field: 'cita_entrega', label: 'Cit', format: 'date' },
            { field: 'terminado', label: 'ter', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'presupuesto', label: 'Pres', format: 'currency' },
            { field: 'ingreso_taller', label: 'In', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'piso', label: 'P' },
            { field: 'depto', label: 'E' },
            { field: 'info_logistica', label: 'info logisti' },
            { field: 'fecha', label: 'Fec', format: 'date' },
            { field: 'repuestos_comprar', label: 'Repue' },
            { field: 'repuestos_comprados', label: 'R', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'id_servicio', label: 'Id' }
        ];

        createAccessDatasheet(res, 'taller-andres-grid', columns);
    } catch (e) {
        console.error('Error loading taller-andres data:', e);
    }
}
