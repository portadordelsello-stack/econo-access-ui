async function initClientes1() {
    await loadClientes1Data();
}

async function loadClientes1Data() {
    const container = document.getElementById('retiros-cards-container');
    const printBtn = document.getElementById('btn-print-retiros');
    
    try {
        const res = await api('/servicios/traer');
        const retiros = res || [];
        
        if (retiros.length === 0) {
            container.innerHTML = `
                <div class="ficha-empty-state">
                    <strong>No hay comprobantes de retiro pendientes de impresión.</strong><br>
                    No hay servicios programados para retirar del domicilio.
                </div>
            `;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (printBtn) printBtn.disabled = false;
        container.innerHTML = '';

        const dateStr = getFormattedDateSpanish();

        retiros.forEach((r, idx) => {
            const timeFrom = r.hora_busqueda_desde ? formatTime(r.hora_busqueda_desde) : '______';
            const timeTo = r.hora_busqueda_hasta ? formatTime(r.hora_busqueda_hasta) : '______';
            
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
                <div class="recibo-body" style="font-size: 11pt; line-height: 1.8;">
                    <p style="text-transform: uppercase;">
                        <strong>RETIRAMOS DEL DOMICILIO:</strong> 
                        &nbsp; <strong>${r.calle || ''} ${r.numero_direccion || ''}</strong> 
                        &nbsp;&nbsp; Piso: <strong>${r.piso || ''}</strong> 
                        &nbsp;&nbsp; Depto: <strong>${r.depto || ''}</strong>
                    </p>
                    <p style="font-weight: bold; margin-top: 15px;">
                        ${r.aparato || 'Lavarropas'}
                    </p>
                    <p style="font-weight: bold; font-size: 11pt; margin-top: 15px; text-transform: uppercase; color: #000; letter-spacing: 0.2px;">
                        A LOS FINES DE REVISIÓN, PRUEBA, DETECCIÓN DE FALLAS Y DETERMINACIÓN DE PRESUPUESTO.
                    </p>
                    <p style="font-size: 9.5pt; color: #555; margin-top: 15px;">
                        entre las <strong>${timeFrom}</strong> y las <strong>${timeTo}</strong>
                    </p>
                </div>
                
                <!-- Receipt Footer (Signature Box & Electrotecnico) -->
                <div style="display: flex; align-items: center; gap: 25px; margin-top: 20px;">
                    <div style="border: 1px solid #000; width: 250px; height: 35px; background-color: #FAFAFA;"></div>
                    <div style="color: #28A745; font-weight: bold; font-size: 10pt; font-family: 'Tahoma', sans-serif;">
                        Electrotécnico: Cristian Darío Lepez
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            // If it is not the last item, add a visual dashed separator (only visible on screen)
            if (idx < retiros.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'recibo-separator no-print';
                container.appendChild(sep);
            }
        });
    } catch (e) {
        console.error('Error loading retiros data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar comprobantes de retiro.
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
