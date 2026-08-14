async function initReporteRecibos() {
    await loadReporteRecibosData();
}

async function loadReporteRecibosData() {
    const container = document.getElementById('recibos-cards-container');
    const printBtn = document.getElementById('btn-print-recibos');
    
    try {
        const res = await api('/servicios/llevar');
        const recibos = res || [];
        
        if (recibos.length === 0) {
            container.innerHTML = `
                <div class="ficha-empty-state">
                    <strong>No hay recibos pendientes de impresión.</strong><br>
                    Todos los servicios finalizados ya fueron entregados.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        const dateStr = getFormattedDateSpanish();

        recibos.forEach((r, idx) => {
            const formattedPresu = r.presupuesto ? formatCurrency(r.presupuesto) : '$0';
            const techName = r.tecnico ? `Cristian Darío Lepez // Técnico: ${r.tecnico}` : 'Cristian Darío Lepez';
            
            const card = document.createElement('div');
            card.className = 'recibo-card';
            card.innerHTML = `
                <div class="recibo-header">
                    <!-- Header Left (ECONOSERVICE Box) -->
                    <div class="recibo-header-left">
                        <div class="r-title">Econoservice</div>
                        <div class="r-subtitle">Lavarropas</div>
                        <div class="r-address">
                            Marcial Candioti 5798 - Santa Fe<br>
                            Velez Sarsfield 2569 - Santo Tomé
                        </div>
                        <div class="r-phone">342 5 328 992</div>
                    </div>
                    
                    <!-- Header Right (URL and Date) -->
                    <div class="recibo-header-right">
                        <div class="r-url">www.econoservice.com.ar</div>
                        <div class="r-date">${dateStr}</div>
                    </div>
                </div>
                
                <!-- Receipt Body Content -->
                <div class="recibo-body">
                    <p>
                        Recibí de (domicilio) <strong>${r.calle || ''}</strong> 
                        <strong>${r.numero_direccion || ''}</strong> 
                        &nbsp;&nbsp; Piso: <strong>${r.piso || ''}</strong> 
                        &nbsp;&nbsp; Depto: <strong>${r.depto || ''}</strong>
                    </p>
                    <p>
                        la cantidad de pesos <span class="val-text">${r.presup_palabras || ''}</span>
                    </p>
                    <p>
                        en concepto de mantenimiento <strong>${r.aparato || ''}</strong> 
                        <strong>${r.marca_modelo || ''}</strong>
                    </p>
                    <p>
                        <u>Detalle:</u> <span class="val-text">${r.servicios_convenidos || ''}</span>
                    </p>
                </div>
                
                <!-- Receipt Footer -->
                <div class="recibo-footer">
                    <div>
                        <span class="recibo-garantia">Garantía:</span> 
                        <strong>${r.garantia || '6 (seis) meses'}</strong>
                    </div>
                    <div class="recibo-son">
                        Son: &nbsp;&nbsp; ${formattedPresu}
                    </div>
                    <div class="recibo-tecnico">
                        Electrotécnico: ${techName}
                    </div>
                </div>
                
                <!-- Rating Request Box -->
                <div class="recibo-conforme-box">
                    ¡SI QUEDÓ CONFORME CON EL SERVICIO LE AGRADECERÍAMOS SU PUNTUACIÓN Y RESEÑAS POSITIVAS EN GOOGLE!
                </div>
            `;
            
            container.appendChild(card);
            
            // If it is not the last item, add a visual dashed separator (only visible on screen)
            if (idx < recibos.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'recibo-separator no-print';
                container.appendChild(sep);
            }
        });
    } catch (e) {
        console.error('Error loading recibos data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar recibos de clientes.
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
    return `Santa Fe, ${dayName}, ${day} de ${monthName} de ${year}`;
}
