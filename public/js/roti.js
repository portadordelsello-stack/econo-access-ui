async function initRoti() {
    try {
        const result = await api('/gastos/rotiseria-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('roti-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading rotiseria total:', e);
    }
}
