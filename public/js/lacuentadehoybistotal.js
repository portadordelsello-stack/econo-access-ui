async function initLacuentadehoybistotal() {
    await loadLacuentadehoybistotalData();
}

async function loadLacuentadehoybistotalData() {
    try {
        const hash = window.location.hash;
        let url = '/servicios/lacuentadehoybistotal';
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const date = params.get('date');
            if (date) {
                url += `?date=${date}`;
            }
        }
        
        const res = await api(url);
        const cell = document.getElementById('lacuentadehoybistotal-suma-cell');
        if (cell) {
            cell.textContent = res ? formatCurrency(res.SumaDePresupuesto) : '$ 0,00';
        }
    } catch (e) {
        console.error('Error loading lacuentadehoybistotal data:', e);
    }
}
