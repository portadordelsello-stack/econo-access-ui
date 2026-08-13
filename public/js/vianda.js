async function initVianda() {
    try {
        const result = await api('/gastos/vianda-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('vianda-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading vianda total:', e);
    }
}
