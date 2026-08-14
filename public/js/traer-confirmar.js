async function initTraerConfirmar() {
    await loadTraerConfirmarData();
}

async function loadTraerConfirmarData() {
    try {
        const res = await api('/servicios/traer-confirmar');
        
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
            { field: 'hora_busqueda_desde', label: 'Hora' },
            { field: 'hora_busqueda_hasta', label: 'Hora' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Numero direcc' },
            { field: 'depto', label: 'Depto' },
            { field: 'piso', label: 'Pis' },
            { field: 'aparato', label: 'Apara' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto U' },
            { field: 'ingreso_taller', label: 'Ingreso T', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'arreglado_en_domicilio', label: 'Arregla', format: 'checkbox', onChange: makeCheckboxHandler('arreglado_en_domicilio') },
            { field: 'traer_ver', label: 'Traer Ver' },
            { field: 'cita_dia', label: 'Cita dia', format: 'date' },
            { field: 'pasa_a_stock', label: 'Pasa a Stock', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'presupuesto', label: 'Presupu', format: 'currency' },
            { field: 'rechaza_devolver', label: 'Rechaza-De', format: 'checkbox', onChange: makeCheckboxHandler('rechaza_devolver') },
            { field: 'entregado', label: 'Entreg', format: 'checkbox', onChange: makeCheckboxHandler('entregado') }
        ];

        createAccessDatasheet(res, 'traer-confirmar-grid', columns);
    } catch (e) {
        console.error('Error loading traer-confirmar data:', e);
    }
}
