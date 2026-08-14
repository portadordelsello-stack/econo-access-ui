async function initCalculadoraTotal() {
    try {
        const result = await api('/servicios/calculadora-total');
        if (result !== null && result !== undefined) {
            const cell = document.getElementById('calculadora-total-suma-cell');
            if (cell) {
                const val = result.SumaDePresupuesto || 0;
                cell.textContent = formatCurrency(val);
            }
        }
    } catch (e) {
        console.error('Error loading calculadora total:', e);
    }
}
