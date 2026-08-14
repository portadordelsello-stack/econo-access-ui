async function initTallerPresupuestar() {
    await loadTallerPresupuestarData();
}

async function loadTallerPresupuestarData() {
    const container = document.getElementById('presupuestar-report-rows');
    const printBtn = document.getElementById('btn-print-presup');
    const dateSpan = document.getElementById('presupuestar-report-date-span');
    
    try {
        const res = await api('/servicios/taller-espera');
        const rowsData = res || [];
        
        if (dateSpan) {
            dateSpan.innerText = getFormattedDateSpanish();
        }
        
        if (rowsData.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; border: 1px solid #4682B4; color: #666; font-size: 10pt;">
                    No hay servicios registrados esperando presupuesto en el taller.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        rowsData.forEach(r => {
            const formattedDate = r.fecha ? formatDate(r.fecha) : '';
            
            const row = document.createElement('div');
            row.className = 'presupuestar-table-row';
            row.innerHTML = `
                <div class="presupuestar-cell cell-presup-fecha">${formattedDate}</div>
                <div class="presupuestar-cell cell-presup-calle">${r.calle || ''}</div>
                <div class="presupuestar-cell cell-presup-numero">${r.numero_direccion || ''}</div>
                <div class="presupuestar-cell cell-presup-marca">${r.marca_modelo || ''}</div>
                <div class="presupuestar-cell cell-presup-usuario">${r.desperfecto_usuario || ''}</div>
                <div class="presupuestar-cell cell-presup-requerido">${r.servicios_requeridos || ''}</div>
                <div class="presupuestar-cell cell-presup-interna">${r.resena_interna_servicios || ''}</div>
            `;
            container.appendChild(row);
        });
    } catch (e) {
        console.error('Error loading taller-presupuestar report data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar el reporte de Taller Presupuestar.
            </div>
        `;
    }
}

function getFormattedDateSpanish() {
    const date = new Date();
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} de ${monthName} de ${year}`;
}
