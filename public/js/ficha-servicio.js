let loadedFichas = [];

async function initFichaServicio() {
    await loadFichaServicioData();
}

async function loadFichaServicioData() {
    const container = document.getElementById('ficha-cards-container');
    const markBtn = document.getElementById('btn-mark-printed');
    const printBtn = document.getElementById('btn-print-fichas');
    
    try {
        const res = await api('/servicios/taller-fichar');
        loadedFichas = res || [];
        
        if (loadedFichas.length === 0) {
            container.innerHTML = `
                <div class="ficha-empty-state">
                    <strong>No hay fichas pendientes para imprimir.</strong><br>
                    Todos los servicios del taller tienen su ficha marcada como impresa (fichaok = -1).
                </div>
            `;
            if (markBtn) markBtn.disabled = true;
            if (printBtn) printBtn.disabled = true;
            return;
        }
        
        if (markBtn) markBtn.disabled = false;
        if (printBtn) printBtn.disabled = false;

        container.innerHTML = '';
        loadedFichas.forEach(f => {
            const formattedDate = f.fecha ? formatDate(f.fecha) : '';
            const formattedPresu = f.presupuesto ? formatCurrency(f.presupuesto) : '$0';
            
            const card = document.createElement('div');
            card.className = 'ficha-card';
            card.innerHTML = `
                <!-- Dotted line at the top -->
                <div class="ficha-dashed-line"></div>
                
                <!-- Header row with black box for ID -->
                <div class="ficha-header-row">
                    <span class="ficha-title-left">FICHA DE SERVICIO</span>
                    <div class="ficha-black-box">
                        N° ${f.id_servicio}
                    </div>
                </div>
                
                <!-- Main box with address and device details -->
                <div class="ficha-main-box">
                    <div class="ficha-row">
                        <div class="ficha-col flex-2">
                            <strong>Calle</strong>
                            <span>${f.calle || ''}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Numero</strong>
                            <span>${f.numero_direccion || ''}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Piso</strong>
                            <span>${f.piso || ''}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Depto</strong>
                            <span>${f.depto || ''}</span>
                        </div>
                    </div>
                    
                    <div class="ficha-row">
                        <div class="ficha-col">
                            <strong>Fecha de Ingreso</strong>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Aparato</strong>
                            <span>${f.aparato || ''}</span>
                        </div>
                        <div class="ficha-col flex-1-5">
                            <strong>Marca / Modelo</strong>
                            <span>${f.marca_modelo || ''}</span>
                        </div>
                    </div>
                    
                    <div class="text-area-row">
                        <strong>Desperfecto según Usuario</strong>
                        <span>${f.desperfecto_usuario || ''}</span>
                    </div>
                </div>
                
                <!-- Bottom box with job planning and pricing details -->
                <div class="ficha-bottom-box">
                    <div class="ficha-row">
                        <div class="ficha-col flex-2">
                            <strong>Servicios Requeridos</strong>
                            <span>${f.servicios_requeridos || ''}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Presupuesto</strong>
                            <span>${formattedPresu}</span>
                        </div>
                    </div>
                    
                    <div class="ficha-row">
                        <div class="ficha-col flex-2">
                            <strong>Servicios Convenidos / Reseña Interna</strong>
                            <span>${[f.servicios_convenidos, f.resena_interna_servicios].filter(Boolean).join(' / ') || ''}</span>
                        </div>
                        <div class="ficha-col">
                            <strong>Técnico Asignado</strong>
                            <span>${f.tecnico || 'No asignado'}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Error loading ficha servicio data:', e);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                Error al cargar fichas de servicio.
            </div>
        `;
    }
}

async function markAllFichasAsPrinted() {
    if (loadedFichas.length === 0) return;
    
    if (!confirm(`¿Está seguro de marcar las ${loadedFichas.length} fichas como impresas? Se ocultarán de este listado.`)) {
        return;
    }
    
    const markBtn = document.getElementById('btn-mark-printed');
    if (markBtn) {
        markBtn.disabled = true;
        markBtn.innerText = 'Actualizando...';
    }
    
    try {
        await Promise.all(
            loadedFichas.map(f => api(`/servicios/${f.id_servicio}`, {
                method: 'PUT',
                body: { fichaok: 1 }
            }))
        );
        showNotification('Fichas marcadas como impresas con éxito.', 'success');
        await loadFichaServicioData();
    } catch (e) {
        console.error('Error updating fichas:', e);
        showNotification('Error al marcar las fichas.', 'error');
    } finally {
        if (markBtn) {
            markBtn.innerText = '✓ Marcar como Impresas';
        }
    }
}
