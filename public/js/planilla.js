async function initPlanilla() {
    await loadPlanillaData();
}

async function loadPlanillaData() {
    const container = document.getElementById('planilla-slips-container');
    const printBtn = document.getElementById('btn-print-planilla');
    
    try {
        const res = await api('/servicios/planilla');
        const slips = res || [];
        
        if (slips.length === 0) {
            container.innerHTML = `
                <div class="ficha-empty-state">
                    <strong>No hay entregas pendientes de planilla.</strong><br>
                    Todos los servicios finalizados ya fueron entregados.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        const dateStr = getFormattedDateSpanish();

        slips.forEach((s, idx) => {
            const timeFrom = s.hora_entrega_desde ? formatTime(s.hora_entrega_desde) : '______';
            const timeTo = s.hora_entrega_hasta ? formatTime(s.hora_entrega_hasta) : '______';
            
            // Build the status box content. It shows "terminado" or "devolución".
            // If budget is 0/null or resena contains "devolución", show "devolución".
            // If info_logistica exists, display it.
            let statusText = '';
            if (s.presupuesto === 0 || !s.presupuesto) {
                statusText = s.info_logistica || 'devolución';
            } else {
                statusText = s.info_logistica ? `terminado / ${s.info_logistica}` : 'terminado';
            }

            const slip = document.createElement('div');
            slip.className = 'planilla-slip';
            slip.innerHTML = `
                <!-- Row 1: Date & Time slot & Floor/Dept -->
                <div class="planilla-slip-row">
                    <div class="planilla-slip-left">
                        <span>Santa Fe, <strong>${dateStr}</strong></span>
                        <div class="planilla-time-box">
                            entre las <strong>${timeFrom}</strong> y las <strong>${timeTo}</strong>
                        </div>
                    </div>
                    <div>
                        Piso: <strong>${s.piso || '______'}</strong> &nbsp;&nbsp;
                        Dpto: <strong>${s.depto || '______'}</strong>
                    </div>
                </div>

                <!-- Row 2: Address and Status Box -->
                <div class="planilla-slip-row">
                    <div class="planilla-address-block">
                        En el día de la fecha, recibí en mi domicilio de 
                        <strong>${s.calle || ''} ${s.numero_direccion || ''}</strong>
                    </div>
                    <div class="planilla-status-box">
                        ${statusText}
                    </div>
                </div>

                <!-- Row 3: Device details & Signature / DNI block -->
                <div class="planilla-slip-row" style="margin-top: 12px;">
                    <div>
                        <strong>${s.aparato || ''}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                        <strong>${s.marca_modelo || ''}</strong>
                    </div>
                    <div class="planilla-signature-block">
                        <span>FIRMA</span> <span class="planilla-dotted-line" style="width: 140px;"></span>
                    </div>
                </div>
                
                <div class="planilla-slip-row" style="justify-content: flex-end; margin-top: 4px;">
                    <div class="planilla-signature-block">
                        <span>DNI</span> <span class="planilla-dotted-line" style="width: 140px;"></span>
                    </div>
                </div>
            `;
            
            container.appendChild(slip);
            
            // If it is not the last item, add a visual dashed separator (also visible during print)
            if (idx < slips.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'planilla-separator';
                container.appendChild(sep);
            }
        });
    } catch (e) {
        console.error('Error loading planilla data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar la planilla de entrega.
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
