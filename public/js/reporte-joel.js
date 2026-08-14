async function initReporteJoel() {
    await loadReporteJoelData();
}

async function loadReporteJoelData() {
    const container = document.getElementById('joel-report-rows');
    const printBtn = document.getElementById('btn-print-joel');
    const dateSpan = document.getElementById('joel-report-date-span');
    
    try {
        const res = await api('/servicios/taller-joel');
        const rowsData = res || [];
        
        if (dateSpan) {
            dateSpan.innerText = getFormattedDateSpanish();
        }
        
        if (rowsData.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; border: 1px solid #808000; color: #666; font-size: 10pt;">
                    No hay servicios asignados en taller para el técnico Joel.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        rowsData.forEach(r => {
            const formattedCita = r.cita_entrega ? formatDate(r.cita_entrega) : '';
            
            const row = document.createElement('div');
            row.className = 'joel-table-row';
            row.innerHTML = `
                <div class="joel-cell cell-calle">${r.calle || ''}</div>
                <div class="joel-cell cell-numero">${r.numero_direccion || ''}</div>
                <div class="joel-cell cell-cita">${formattedCita}</div>
                <div class="joel-cell cell-aparato">${r.aparato || ''}</div>
                <div class="joel-cell cell-marca">${r.marca_modelo || ''}</div>
                <div class="joel-cell cell-servicios">${r.servicios_convenidos || ''}</div>
            `;
            container.appendChild(row);
        });
    } catch (e) {
        console.error('Error loading joel report data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar el reporte de Joel.
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
