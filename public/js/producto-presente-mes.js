async function initProductoPresenteMes() {
    await loadProductoPresenteMesData();
}

async function loadProductoPresenteMesData() {
    try {
        const res = await api('/servicios/producto-presente-mes');
        const columns = [
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Nume' },
            { field: 'presupuesto', label: 'Presup', format: 'currency' },
            { field: 'cita_entrega', label: 'Cita entre', format: 'date' },
            { 
                field: 'entregado', 
                label: 'Entre', 
                format: 'checkbox',
                onChange: async (row, checked) => {
                    try {
                        await api(`/servicios/${row.id_servicio}`, {
                            method: 'PUT',
                            body: { entregado: checked ? 1 : 0 }
                        });
                        row.entregado = checked ? 1 : 0;
                    } catch (e) {
                        console.error('Error updating entregado:', e);
                        showNotification('Error al actualizar entregado', 'error');
                    }
                }
            },
            { 
                field: 'acepta', 
                label: 'Acepta', 
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
            { 
                field: 'factura', 
                label: 'fact', 
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
            },
            { field: 'aparato', label: 'Aparato' },
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'servicios_convenidos', label: 'Servicios Convenidos' }
        ];
        createAccessDatasheet(res, 'producto-presente-mes-grid', columns);
    } catch (e) {
        console.error('Error loading producto-presente-mes data:', e);
    }
}
