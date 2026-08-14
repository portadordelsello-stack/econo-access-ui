async function initIngresadosAyer() {
    await loadIngresadosAyerData();
}

async function loadIngresadosAyerData() {
    try {
        const res = await api('/servicios/ingresados-ayer');
        
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
            { field: 'numero_direccion', label: 'Numero dir' },
            { field: 'ingreso_taller', label: 'Ingreso Tall', format: 'checkbox', onChange: makeCheckboxHandler('ingreso_taller') },
            { field: 'cita_dia', label: 'Cita dia', format: 'date' }
        ];

        createAccessDatasheet(res, 'ingresados-ayer-grid', columns);
    } catch (e) {
        console.error('Error loading ingresados-ayer data:', e);
    }
}
