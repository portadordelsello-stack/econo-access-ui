async function initTallerLavavajillas() {
    await loadTallerLavavajillasData();
}

async function loadTallerLavavajillasData() {
    try {
        const res = await api('/servicios/taller/lavavajillas');
        
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
            { field: 'numero_direccion', label: 'Nu' },
            { field: 'depto', label: 'De' },
            { field: 'piso', label: 'Pi' },
            { field: 'fecha', label: 'Fec', format: 'date' },
            { field: 'aparato', label: 'Apa' },
            { field: 'marca_modelo', label: 'Marca Mode' },
            { field: 'desperfecto_usuario', label: 'D. Usuario' },
            { field: 'servicios_requeridos', label: 'S. Requerido' },
            { field: 'resena_interna_servicios', label: 'R Interna' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'acepta', label: 'A', format: 'checkbox', onChange: makeCheckboxHandler('acepta') },
            { field: 'llamar', label: 'Lla', format: 'checkbox', onChange: makeCheckboxHandler('llamar') },
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { field: 'llevar', label: 'lleva', format: 'checkbox', onChange: makeCheckboxHandler('llevar') },
            { field: 'cita_entrega', label: 'Cita entr', format: 'date' },
            { field: 'repuestos_comprar', label: 'Rep. Comp' },
            { field: 'repuestos_comprados', label: 'R \'', format: 'checkbox', onChange: makeCheckboxHandler('repuestos_comprados') },
            { field: 'rechaza_devolver', label: 'Re', format: 'checkbox', onChange: makeCheckboxHandler('rechaza_devolver') },
            { field: 'para_cristian', label: 'cri', format: 'checkbox', onChange: makeCheckboxHandler('para_cristian') },
            { field: 'pasa_a_stock', label: 'st', format: 'checkbox', onChange: makeCheckboxHandler('pasa_a_stock') },
            { field: 'cita_dia', label: 'Cita d', format: 'date' },
            { field: 'jo', label: 'jo', format: 'checkbox', onChange: makeCheckboxHandler('jo') },
            { field: 'ingreso_taller', label: 'Ing', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'id_servicio', label: 'Id' }
        ];

        createAccessDatasheet(res, 'taller-lavavajillas-grid', columns);
    } catch (e) {
        console.error('Error loading taller-lavavajillas data:', e);
    }
}
