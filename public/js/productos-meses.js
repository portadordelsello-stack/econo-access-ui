async function initProductosMeses() {
    const mesInput = document.getElementById('prod-mes');
    const now = new Date();
    mesInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    mesInput.addEventListener('change', loadProductosMes);
    await loadProductosMes();
}

async function loadProductosMes() {
    const mesVal = document.getElementById('prod-mes').value;
    if (!mesVal) return;
    
    const [year, month] = mesVal.split('-');
    
    try {
        const res = await api(`/servicios?mes=${month}&anio=${year}&limit=1000`);
        const data = res.data || [];
        
        createDatasheet(data, 'prod-grid', [
            { field: 'fecha', label: 'Fecha' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'marca_modelo', label: 'Marca/Modelo' },
            { field: 'presupuesto', label: 'Presupuesto' }
        ], (row) => {
            sessionStorage.setItem('load_service_id', row.id_servicio);
            window.location.hash = '#pedido-servicio';
        });
    } catch (e) {
        console.error(e);
    }
}
