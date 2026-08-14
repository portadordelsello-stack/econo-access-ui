async function initControlFacturas() {
    // Set current date
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const d = new Date();
    
    const dateText = `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    const pad = (n) => String(n).padStart(2, '0');
    const timeText = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    
    const dateEl = document.getElementById('report-date');
    const timeEl = document.getElementById('report-time');
    if (dateEl) dateEl.textContent = dateText;
    if (timeEl) timeEl.textContent = timeText;

    try {
        const result = await api('/servicios/control-facturas');
        if (result) {
            const facturasAEl = document.getElementById('total-facturas-a');
            const facturadoEl = document.getElementById('total-facturado');
            
            if (facturasAEl) {
                const valA = result.totalFacturasA;
                facturasAEl.textContent = valA > 0 ? formatCurrency(valA) : '';
            }
            
            if (facturadoEl) {
                const valFact = result.totalFacturado;
                facturadoEl.textContent = valFact > 0 ? formatCurrency(valFact) : '$ 0,00';
            }
        }
    } catch (e) {
        console.error('Error loading control-facturas data:', e);
    }
}
