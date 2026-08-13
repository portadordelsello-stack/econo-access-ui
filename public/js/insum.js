async function initInsum() {
    try {
        const result = await api('/gastos/insumos-eco-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('insum-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading insumos eco total:', e);
    }
}
