async function initTaller() {
    await loadTallerData();
}

async function loadTallerData() {
    try {
        const res = await api('/servicios/taller');
        
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
            { field: 'fichaok', label: 'fichaok', format: 'checkbox', onChange: makeCheckboxHandler('fichaok') },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Num' },
            { field: 'depto', label: 'De' },
            { field: 'piso', label: 'Pi' },
            { field: 'fecha', label: 'Fect', format: 'date' },
            { field: 'aparato', label: 'Apa' },
            { field: 'marca_modelo', label: 'Marca Model' },
            { field: 'desperfecto_usuario', label: 'D. Usuario' },
            { field: 'servicios_requeridos', label: 'S. Requerido' },
            { field: 'resena_interna_servicios', label: 'R Interna' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Ll', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lle', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita er', format: 'date' },
            { field: 'repuestos_comprar', label: 'Rep. Co' },
            { field: 'repuestos_comprados', label: 'R "', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'pasa_a_stock', label: 'sto', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'cita_dia', label: 'Cita', format: 'date' },
            { field: 'ingreso_taller', label: 'Ing', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'terminado', label: 'ter', format: 'checkbox', onChange: makeCheckboxHandler('terminado') },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'tecnico', label: 'tecnico' }
        ];

        createAccessDatasheet(res, 'taller-grid', columns);
    } catch (e) {
        console.error('Error loading taller data:', e);
    }
}
