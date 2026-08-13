async function initFranjaProd() {
    await loadFranjaProdData();
}

async function loadFranjaProdData() {
    try {
        const res = await api('/servicios/franja-prod');
        createAccessDatasheet(res, 'franja-prod-grid', [
            { 
                field: 'SumaDePresupuesto', 
                label: 'SumaDePresupuesto',
                format: 'currency'
            }
        ]);
    } catch (e) {
        console.error('Error loading franja prod data:', e);
    }
}
