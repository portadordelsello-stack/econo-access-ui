async function initLacuentadeayertotal() {
    await loadLacuentadeayertotalData();
}

async function loadLacuentadeayertotalData() {
    try {
        const hash = window.location.hash;
        let url = '/servicios/lacuentadeayertotal';
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const date = params.get('date');
            if (date) {
                url += `?date=${date}`;
            }
        }
        
        const res = await api(url);
        const cell = document.getElementById('lacuentadeayertotal-suma-cell');
        if (cell) {
            cell.textContent = res ? formatCurrency(res.SumaDePresupuesto) : '$ 0,00';
        }
    } catch (e) {
        console.error('Error loading lacuentadeayertotal data:', e);
    }
}
