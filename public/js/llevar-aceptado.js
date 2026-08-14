async function initLlevarAceptado() {
    await loadLlevarAceptadoData();
}

async function loadLlevarAceptadoData() {
    try {
        const res = await api('/servicios/llevar');
        
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
            { field: 'ir', label: 'ir', format: 'checkbox', onChange: makeCheckboxHandler('ir') },
            { field: 'fecha', label: 'Fecha', format: 'date' },
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Num' },
            { field: 'piso', label: 'P' },
            { field: 'depto', label: 'D' },
            { field: 'marca_modelo', label: 'Marca M' },
            { field: 'hora_entrega_desde', label: 'desde' },
            { field: 'hora_entrega_hasta', label: 'hasta' },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'presupuesto', label: 'Presupue', format: 'currency' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'entregado', label: 'Entr', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'cita_entrega', label: 'Cita entreg', format: 'date' },
            { field: 'desperfecto_usuario', label: 'D Usuario' },
            { field: 'presup_palabras', label: 'Presup_palat' },
            { field: 'aparato', label: 'Aparat' },
            { field: 'garantia', label: 'Garantía' },
            { field: 'factura', label: 'fa', format: 'checkbox', onChange: makeCheckboxHandler('factura') },
            { field: 'resena_interna_servicios', label: 'Reseña Inter' },
            { field: 'terminado', label: 'terr', format: 'checkbox', onChange: makeCheckboxHandler('terminado') }
        ];

        createAccessDatasheet(res, 'llevar-aceptado-grid', columns);
    } catch (e) {
        console.error('Error loading llevar-aceptado data:', e);
    }
}
