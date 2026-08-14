async function initRecaudacionDeMananaTotal() {
    await loadRecaudacionDeMananaTotalData();
}

async function loadRecaudacionDeMananaTotalData() {
    try {
        const hash = window.location.hash;
        let url = '/servicios/recaudacion-de-manana-total';
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const date = params.get('date');
            if (date) {
                url += `?date=${date}`;
            }
        }
        
        const res = await api(url);
        const cell = document.getElementById('recaudacion-de-manana-total-suma-cell');
        if (cell) {
            cell.textContent = res && res.SumaDePresupuesto > 0 ? formatCurrency(res.SumaDePresupuesto) : '';
        }
    } catch (e) {
        console.error('Error loading recaudacion-de-manana-total data:', e);
    }
}
