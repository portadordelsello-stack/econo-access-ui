async function initFacturasDeEsteMes() {
    await loadFacturasDeEsteMesData();
}

async function loadFacturasDeEsteMesData() {
    try {
        const res = await api('/servicios/facturas-de-este-mes');
        const columns = [
            { field: 'presupuesto', label: 'Presu', format: 'currency' },
            { 
                field: 'acepta', 
                label: 'Ace', 
                format: 'checkbox',
                onChange: async (row, checked) => {
                    try {
                        await api(`/servicios/${row.id_servicio}`, {
                            method: 'PUT',
                            body: { acepta: checked ? 1 : 0 }
                        });
                        row.acepta = checked ? 1 : 0;
                    } catch (e) {
                        console.error('Error updating acepta:', e);
                        showNotification('Error al actualizar acepta', 'error');
                    }
                }
            },
            { field: 'cita_entrega', label: 'Cita entr', format: 'date' },
            { 
                field: 'factura', 
                label: 'factur', 
                format: 'checkbox',
                onChange: async (row, checked) => {
                    try {
                        await api(`/servicios/${row.id_servicio}`, {
                            method: 'PUT',
                            body: { factura: checked ? 1 : 0 }
                        });
                        row.factura = checked ? 1 : 0;
                    } catch (e) {
                        console.error('Error updating factura:', e);
                        showNotification('Error al actualizar factura', 'error');
                    }
                }
            }
        ];
        createAccessDatasheet(res, 'facturas-de-este-mes-grid', columns);
    } catch (e) {
        console.error('Error loading facturas-de-este-mes data:', e);
    }
}
