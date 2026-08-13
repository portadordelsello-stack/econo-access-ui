async function initMisiones() {
    await loadMisiones();
}

async function loadMisiones() {
    try {
        const res = await api('/misiones');
        createAccessDatasheet(res, 'mis-grid', [
            { 
                field: 'mision', 
                label: 'mision',
                onInsert: async (val) => {
                    await api('/misiones', {
                        method: 'POST',
                        body: JSON.stringify({ mision: val, realizado: 0 })
                    });
                    showNotification('Misión creada');
                    await loadMisiones();
                }
            },
            { 
                field: 'realizado', 
                label: 'realizado', 
                format: 'checkbox',
                onChange: async (row, isChecked) => {
                    await api(`/misiones/${row.id_mision}`, {
                        method: 'PUT',
                        body: JSON.stringify({ realizado: isChecked ? 1 : 0 })
                    });
                    showNotification(isChecked ? 'Misión completada' : 'Misión pendiente');
                    await loadMisiones();
                }
            }
        ]);
    } catch (e) {
        console.error(e);
    }
}
