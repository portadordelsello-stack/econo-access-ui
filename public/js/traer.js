async function initTraer() {
    await loadTraerData();
}

async function loadTraerData() {
    try {
        const res = await api('/servicios/traer');
        
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
            { field: 'ir', label: 'ic', format: 'checkbox', onChange: makeCheckboxHandler('ir') },
            { field: 'fecha', label: 'Fech', format: 'date' },
            { field: 'hora_busqueda_desde', label: 'Ho' },
            { field: 'hora_busqueda_hasta', label: 'Ho' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Num' },
            { field: 'depto', label: 'D' },
            { field: 'piso', label: 'Pi' },
            { field: 'aparato', label: 'Apara' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto Usuario' },
            { field: 'ingreso_taller', label: 'Ingreso T', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'arreglado_en_domicilio', label: 'Arreglado', format: 'checkbox', onChange: makeCheckboxHandler('arreglado_en_domicilio') },
            { field: 'traer_ver', label: 'Traer Ver' },
            { field: 'cita_dia', label: 'Cita dia', format: 'date' },
            { field: 'pasa_a_stock', label: 'Pasa', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'presupuesto', label: 'Presupu', format: 'currency' },
            { field: 'rechaza_devolver', label: 'Recha', format: 'checkbox', onChange: makeCheckboxHandler('rechaza_devolver') },
            { field: 'entregado', label: 'Entr', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'cita_entrega', label: 'Cita', format: 'date' }
        ];

        createAccessDatasheet(res, 'traer-grid', columns);
    } catch (e) {
        console.error('Error loading traer data:', e);
    }
}
