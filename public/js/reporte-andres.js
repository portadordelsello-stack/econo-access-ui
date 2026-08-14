async function initReporteAndres() {
    await loadReporteAndresData();
}

async function loadReporteAndresData() {
    const container = document.getElementById('andres-report-rows');
    const printBtn = document.getElementById('btn-print-andres');
    const dateSpan = document.getElementById('andres-report-date-span');
    
    try {
        const res = await api('/servicios/taller-andres');
        const rowsData = res || [];
        
        if (dateSpan) {
            dateSpan.innerText = getFormattedDateSpanish();
        }
        
        if (rowsData.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; border: 1px solid #000; color: #666; font-size: 10pt;">
                    No hay servicios asignados en taller para el técnico Andrés.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        rowsData.forEach(r => {
            const formattedCita = r.cita_entrega ? formatDate(r.cita_entrega) : '';
            
            // Format street name and extract only first word if necessary, but actually we can keep the full value
            // and let text wrapping handle it like in Access.
            
            const row = document.createElement('div');
            row.className = 'andres-table-row';
            row.innerHTML = `
                <div class="andres-cell cell-andres-calle">${r.calle || ''}</div>
                <div class="andres-cell cell-andres-num">${r.numero_direccion || ''}</div>
                <div class="andres-cell cell-andres-entrega">${formattedCita}</div>
                <div class="andres-cell cell-andres-apar">${r.aparato || ''}</div>
                <div class="andres-cell cell-andres-marca">${r.marca_modelo || ''}</div>
                <div class="andres-cell cell-andres-servicios">${r.servicios_convenidos || ''}</div>
                <div class="andres-cell cell-andres-informe">${r.resena_interna_servicios || ''}</div>
            `;
            container.appendChild(row);
        });
    } catch (e) {
        console.error('Error loading andres report data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar el reporte de Andrés.
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
