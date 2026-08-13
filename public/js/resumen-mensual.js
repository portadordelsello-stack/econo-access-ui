async function initResumenMensual() {
    const mesInput = document.getElementById('res-mes');
    const now = new Date();
    mesInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    mesInput.addEventListener('change', loadResumen);
    await loadResumen();
}

async function loadResumen() {
    const mesVal = document.getElementById('res-mes').value;
    if (!mesVal) return;
    
    const [year, month] = mesVal.split('-');
    
    try {
        // Get delivered services for income
        // The API might not support `mes` and `anio` out of the box, we may need to fetch all or assume it does
        const srvRes = await api(`/servicios?mes=${month}&anio=${year}&limit=1000`);
        const srvData = srvRes.data || [];
        
        const ingresos = srvData
            .filter(s => s.entregado)
            .reduce((sum, s) => sum + (parseFloat(s.presupuesto) || 0), 0);
            
        // Get expenses for the month
        // Assume API has /api/gastos/mes/total or similar, or we just calculate from list
        let egresos = 0;
        try {
            const gasRes = await api(`/gastos/mes/total?mes=${month}&anio=${year}`);
            egresos = gasRes.total || 0;
        } catch (e) {
            // fallback: fetch gastos and calculate manually
            const gList = await api(`/gastos?mes=${month}&anio=${year}&limit=1000`);
            const gData = gList.data || [];
            egresos = gData.reduce((sum, g) => sum + (parseFloat(g.parcial) || 0), 0);
        }
        
        const balance = ingresos - egresos;
        
        document.getElementById('res-ingresos').textContent = formatCurrency(ingresos);
        document.getElementById('res-egresos').textContent = formatCurrency(egresos);
        
        const balEl = document.getElementById('res-balance');
        balEl.textContent = formatCurrency(balance);
        balEl.style.color = balance >= 0 ? 'green' : 'red';
        
    } catch (e) {
        console.error(e);
    }
}
