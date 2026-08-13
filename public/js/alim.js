async function initAlim() {
    try {
        const result = await api('/gastos/alimentos-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('alim-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading alimentos total:', e);
    }
}
