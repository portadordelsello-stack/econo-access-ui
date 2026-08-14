async function initLacuentadehoybis() {
    await loadLacuentadehoybisData();
}

async function loadLacuentadehoybisData() {
    try {
        const res = await api('/servicios/cuenta-hoy');
        const columns = [
            { field: 'calle', label: 'Calle' },
            { field: 'numero_direccion', label: 'Numer' },
            { field: 'piso', label: 'Piso' },
            { field: 'depto', label: 'Depto' },
            { field: 'cita_entrega', label: 'Cita entrega', format: 'date' },
            { field: 'presupuesto', label: 'Presupue', format: 'currency' },
            { 
                field: 'entregado', 
                label: 'Entregado', 
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
            { field: 'marca_modelo', label: 'Marca Modelo' },
            { field: 'info_logistica', label: 'info logistica' },
            { 
                field: 'arreglado_en_domicilio', 
                label: 'Arr', 
                format: 'checkbox',
                onChange: async (row, checked) => {
                    try {
                        await api(`/servicios/${row.id_servicio}`, {
                            method: 'PUT',
                            body: { arreglado_en_domicilio: checked ? 1 : 0 }
                        });
                        row.arreglado_en_domicilio = checked ? 1 : 0;
                    } catch (e) {
                        console.error('Error updating arreglado_en_domicilio:', e);
                        showNotification('Error al actualizar arreglado_en_domicilio', 'error');
                    }
                }
            }
        ];
        createAccessDatasheet(res, 'lacuentadehoybis-grid', columns);
    } catch (e) {
        console.error('Error loading lacuentadehoybis data:', e);
    }
}
