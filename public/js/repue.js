async function initRepue() {
    try {
        const result = await api('/gastos/repuestos-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('repue-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading repuestos total:', e);
    }
}
