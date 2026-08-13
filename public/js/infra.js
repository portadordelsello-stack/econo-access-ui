async function initInfra() {
    try {
        const result = await api('/gastos/infraestructura-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('infra-suma-cell');
            if (cell) {
                const val = result.SumaDegasto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading infraestructura total:', e);
    }
}
