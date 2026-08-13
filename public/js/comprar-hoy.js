async function initComprarHoy() {
    await loadComprarHoyData();
}

async function loadComprarHoyData() {
    try {
        const res = await api('/servicios/comprar-hoy');
        createAccessDatasheet(res, 'comprar-hoy-grid', [
            { 
                field: 'calle', 
                label: 'Calle' 
            },
            { 
                field: 'numero_direccion', 
                label: 'Nur' 
            },
            { 
                field: 'marca_modelo', 
                label: 'Marca Modelo' 
            },
            { 
                field: 'repuestos_comprar', 
                label: 'Repuestos Comprar' 
            },
            { 
                field: 'repuestos_comprados', 
                label: 'Repuestos Comprados', 
                format: 'boolean',
                editable: true
            },
            { 
                field: 'cita_entrega', 
                label: 'Cita entrega', 
                format: 'date' 
            },
            { 
                field: 'cita_dia', 
                label: 'Cita dia', 
                format: 'date' 
            }
        ], {
            onCellChange: async (row, field, newVal) => {
                try {
                    const body = {};
                    body[field] = newVal ? 1 : 0;
                    await api(`/servicios/${row.id_servicio}`, {
                        method: 'PUT',
                        body: body
                    });
                    showNotification('Registro de compra actualizado');
                } catch (e) {
                    console.error(e);
                    showNotification('Error al actualizar el registro', 'error');
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}
