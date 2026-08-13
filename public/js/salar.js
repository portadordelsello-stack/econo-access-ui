async function initSalar() {
    try {
        const result = await api('/gastos/salarios-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('salar-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading salarios total:', e);
    }
}
