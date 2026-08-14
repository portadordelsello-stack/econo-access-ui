async function initLlevarDevolucion() {
    await loadLlevarDevolucionData();
}

async function loadLlevarDevolucionData() {
    try {
        const res = await api('/servicios/llevar-devolucion');
        
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
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Num' },
            { field: 'piso', label: 'Pisc' },
            { field: 'depto', label: 'Der' },
            { field: 'hora_entrega_desde', label: 'des' },
            { field: 'hora_entrega_hasta', label: 'hast' },
            { field: 'marca_modelo', label: 'Marca Mode' },
            { field: 'presupuesto', label: 'Presupuest', format: 'currency' },
            { field: 'servicios_convenidos', label: 'S Convenidos' },
            { field: 'entregado', label: 'Ent', format: 'checkbox', onChange: makeCheckboxHandler('entregado') },
            { field: 'cita_entrega', label: 'Cita entreg', format: 'date' },
            { field: 'desperfecto_usuario', label: 'D Usuario' },
            { field: 'presup_palabras', label: 'Pres' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'garantia', label: 'Garantía' },
            { field: 'info_logistica', label: 'info logistica' },
            { field: 'terminado', label: 'terr', format: 'checkbox', onChange: makeCheckboxHandler('terminado') }
        ];

        createAccessDatasheet(res, 'llevar-devolucion-grid', columns);
    } catch (e) {
        console.error('Error loading llevar-devolucion data:', e);
    }
}
