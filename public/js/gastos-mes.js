async function initGastosMes() {
    await loadGastosMes();
}

async function loadGastosMes() {
    try {
        const res = await api('/gastos/gastos-mes');
        createAccessDatasheet(res, 'gastos-mes-grid', [
            { 
                field: 'fecha', 
                label: 'fecha', 
                format: 'date' 
            },
            { 
                field: 'parcial', 
                label: 'gasto', 
                format: 'currency' 
            },
            { 
                field: 'econoservice', 
                label: 'econose', 
                format: 'checkbox',
                onChange: async (row, isChecked) => {
                    await api(`/gastos/${row.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ econoservice: isChecked ? 1 : 0 })
                    });
                    showNotification('Gasto actualizado');
                    await loadGastosMes();
                }
            },
            { 
                field: 'proveedor', 
                label: 'proveedor' 
            },
            { 
                field: 'descripcion', 
                label: 'descripción',
                onInsert: async (val) => {
                    const today = new Date();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    const yy = String(today.getFullYear()).slice(-2);
                    const todayStr = `${mm}/${dd}/${yy} 00:00:00`;
                    
                    await api('/gastos', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            descripcion: val, 
                            parcial: 0, 
                            econoservice: 0, 
                            fa: 0, 
                            fecha: todayStr,
                            rubro: 'varios'
                        })
                    });
                    showNotification('Gasto creado');
                    await loadGastosMes();
                }
            },
            { 
                field: 'fa', 
                label: 'fa', 
                format: 'checkbox',
                onChange: async (row, isChecked) => {
                    await api(`/gastos/${row.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ fa: isChecked ? 1 : 0 })
                    });
                    showNotification('Gasto actualizado');
                    await loadGastosMes();
                }
            },
            { 
                field: 'rubro', 
                label: 'rubro' 
            }
        ]);
    } catch (e) {
        console.error(e);
    }
}
