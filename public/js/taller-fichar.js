async function initTallerFichar() {
    await loadTallerFicharData();
}

async function loadTallerFicharData() {
    try {
        const res = await api('/servicios/taller-fichar');
        
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
            { field: 'fichaok', label: 'fichaok', format: 'checkbox', onChange: makeCheckboxHandler('fichaok') },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Numero direccion' },
            { field: 'depto', label: 'Depto' },
            { field: 'piso', label: 'Piso' },
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'aparato', label: 'Apa' },
            { field: 'marca_modelo', label: 'Marca Mode' },
            { field: 'desperfecto_usuario', label: 'D. Usuario' },
            { field: 'servicios_requeridos', label: 'S. Requerido' },
            { field: 'resena_interna_servicios', label: 'R Interna' },
            { field: 'servicios_convenidos', label: 'S Convenic' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Ll', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lle', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita er', format: 'date' },
            { field: 'repuestos_comprar', label: 'Rep. Co' },
            { field: 'repuestos_comprados', label: 'R', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'pasa_a_stock', label: 'sto', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'cita_dia', label: 'Cita', format: 'date' },
            { field: 'ingreso_taller', label: 'Ing', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'id_servicio', label: 'Id' }
        ];

        createAccessDatasheet(res, 'taller-fichar-grid', columns);
    } catch (e) {
        console.error('Error loading taller_fichar data:', e);
    }
}
