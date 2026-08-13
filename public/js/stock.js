async function initStock() {
    await loadStockData();
}

async function loadStockData() {
    try {
        const res = await api('/servicios/stock');
        createAccessDatasheet(res, 'stock-grid', [
            { 
                field: 'calle', 
                label: 'Calle' 
            },
            { 
                field: 'numero_direccion', 
                label: 'Numero direccion' 
            },
            { 
                field: 'aparato', 
                label: 'Aparato' 
            },
            { 
                field: 'marca_modelo', 
                label: 'Marca Modelo' 
            },
            { 
                field: 'resena_interna_servicios', 
                label: 'Reseña Interna Servicios' 
            },
            { 
                field: 'pasa_a_stock', 
                label: 'Pasa', 
                format: 'boolean',
                editable: true
            },
            { 
                field: 'fecha', 
                label: 'Fecha', 
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
                    showNotification('Registro de stock actualizado');
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
