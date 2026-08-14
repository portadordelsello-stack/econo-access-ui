async function initTraerMananaMas() {
    await loadTraerMananaMasData();
}

async function loadTraerMananaMasData() {
    try {
        const res = await api('/servicios/traer-manana-mas');
        
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
            { field: 'hora_busqueda_desde', label: 'Hor' },
            { field: 'hora_busqueda_hasta', label: 'Hor' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Num' },
            { field: 'depto', label: 'D' },
            { field: 'piso', label: 'Pi' },
            { field: 'aparato', label: 'Apara' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usuario' },
            { field: 'ingreso_taller', label: 'Ingreso T', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'arreglado_en_domicilio', label: 'Arreglado en do', format: 'checkbox', onChange: makeCheckboxHandler('arreglado_en_domicilio') },
            { field: 'traer_ver', label: 'Traer' },
            { field: 'cita_dia', label: 'Cita dia', format: 'date' },
            { field: 'pasa_a_stock', label: 'Pasa a Stoc', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'presupuesto', label: 'Presupu', format: 'currency' },
            { field: 'rechaza_devolver', label: 'Rechaza-D', format: 'checkbox', onChange: makeCheckboxHandler('rechaza_devolver') },
            { field: 'entregado', label: 'Entregado', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'info_logistica', label: 'info logistica' }
        ];

        createAccessDatasheet(res, 'traer-manana-mas-grid', columns);
    } catch (e) {
        console.error('Error loading traer-manana-mas data:', e);
    }
}
