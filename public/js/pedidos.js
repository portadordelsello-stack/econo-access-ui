let currentClientId = null;
let currentClientIndex = 0;
let totalClientsCount = 0;

let currentServiceId = null;
let clientServices = [];
let currentServiceIndex = 0;

async function initPedidos() {
    await fetchTotalClients();
    if (totalClientsCount > 0) {
        await loadClientByIndex(0);
    } else {
        cli_new();
    }
    
    // Bind Client Navigation
    document.getElementById('cli-btn-prev').onclick = () => navigateClientOffset(-1);
    document.getElementById('cli-btn-next').onclick = () => navigateClientOffset(1);
    document.getElementById('cli-btn-last').onclick = () => navigateClientIndex(totalClientsCount - 1);
    document.getElementById('cli-btn-new').onclick = () => cli_new();
    document.getElementById('cli-save-btn').onclick = () => cli_save();

    // Bind Service Navigation
    document.getElementById('srv-btn-prev').onclick = () => navigateServiceOffset(-1);
    document.getElementById('srv-btn-next').onclick = () => navigateServiceOffset(1);
    document.getElementById('srv-btn-new').onclick = () => srv_new();
    document.getElementById('srv-save-btn').onclick = () => srv_save();

    // Register custom search for Ctrl+B
    activeDatasheet = {
        customSearch: async () => {
            const findText = document.getElementById('find-text').value.trim();
            const matchType = document.getElementById('find-match').value;
            if (!findText) return;
            
            const res = await api(`/clientes/navegar/buscar?q=${encodeURIComponent(findText)}&match=${matchType}&offset=${currentClientIndex}`);
            if (res && res.offset !== undefined) {
                currentClientIndex = res.offset;
                loadClientIntoForm(res.record);
            } else {
                showAccessMessageBox('Microsoft Access finalizó la búsqueda de los registros. No se encontró el elemento buscado.');
            }
        }
    };
}

async function fetchTotalClients() {
    try {
        const res = await api('/clientes/navegar/total');
        if (res) {
            totalClientsCount = res.total;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadClientByIndex(index) {
    if (index < 0 || index >= totalClientsCount) return;
    try {
        const res = await api(`/clientes/navegar/record?offset=${index}`);
        if (res) {
            currentClientIndex = index;
            loadClientIntoForm(res);
        }
    } catch (e) {
        console.error(e);
    }
}

function loadClientIntoForm(client) {
    currentClientId = client.id_cliente;
    document.getElementById('cli-id').value = client.id_cliente;
    document.getElementById('cli-problematico').checked = client.cliente_problematico === 1;
    document.getElementById('cli-calle').value = client.calle || '';
    document.getElementById('cli-nro').value = client.numero_direccion || '';
    document.getElementById('cli-depto').value = client.depto || '';
    document.getElementById('cli-piso').value = client.piso || '';
    
    // Load services for this client
    loadClientServices(client.id_cliente);
}

async function loadClientServices(clientId) {
    try {
        const services = await api(`/clientes/${clientId}/servicios`);
        clientServices = services || [];
        if (clientServices.length > 0) {
            currentServiceIndex = 0;
            loadServiceIntoForm(clientServices[0]);
        } else {
            srv_new();
        }
    } catch (e) {
        console.error(e);
    }
}

function loadServiceIntoForm(srv) {
    currentServiceId = srv.id_servicio;
    document.getElementById('srv-id').value = srv.id_servicio;
    document.getElementById('srv-cli-id').value = srv.id_cliente;
    document.getElementById('srv-fecha').value = srv.fecha ? srv.fecha.split(' ')[0] : '';
    document.getElementById('srv-aparato').value = srv.aparato || 'Lavarropas';
    document.getElementById('srv-marca-modelo').value = srv.marca_modelo || '';
    document.getElementById('srv-desperfecto').value = srv.desperfecto_usuario || '';
    document.getElementById('srv-cita-dia').value = srv.cita_dia ? srv.cita_dia.split(' ')[0] : '';
    document.getElementById('srv-hora-desde').value = srv.hora_busqueda_desde || '';
    document.getElementById('srv-hora-hasta').value = srv.hora_busqueda_hasta || '';
    document.getElementById('srv-traer-ver').value = srv.traer_ver || 'traer';
    document.getElementById('srv-ingreso-taller').checked = srv.ingreso_taller === 1;
    document.getElementById('srv-reclamo-garantia').checked = srv.reclamo_garantia === 1;
    document.getElementById('srv-arreglado-domicilio').checked = srv.arreglado_en_domicilio === 1;
    document.getElementById('srv-requeridos').value = srv.servicios_requeridos || '';
    document.getElementById('srv-convenidos').value = srv.servicios_convenidos || '';
    document.getElementById('srv-resena-interna').value = srv.resena_interna_servicios || '';
    document.getElementById('srv-presupuesto').value = srv.presupuesto || '0';
    document.getElementById('srv-acepta-presup').checked = srv.acepta === 1;
    document.getElementById('srv-garantia').value = srv.garantia || '';
    document.getElementById('srv-cita-entrega').value = srv.cita_entrega ? srv.cita_entrega.split(' ')[0] : '';
    document.getElementById('srv-stock').checked = srv.pasa_a_stock === 1;
    document.getElementById('srv-entregado').checked = srv.entregado === 1;
    document.getElementById('srv-factura').checked = srv.factura === 1;
    document.getElementById('srv-info-logistica').value = srv.info_logistica || '';
    
    // Calculate months ago
    document.getElementById('srv-hace-meses').value = calculateMonthsAgo(srv.fecha);
    
    renderServiceStatusNav();
}

function calculateMonthsAgo(fechaStr) {
    if (!fechaStr) return '';
    const parts = fechaStr.split(' ')[0].split('/');
    if (parts.length < 3) return '';
    
    let date;
    if (parts[2].length === 2) {
        const year = parseInt(parts[2]) + 2000;
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        date = new Date(year, month, day);
    } else {
        date = new Date(fechaStr);
    }
    
    if (isNaN(date.getTime())) return '';
    const today = new Date();
    return (today.getFullYear() - date.getFullYear()) * 12 + (today.getMonth() - date.getMonth());
}

function cli_new() {
    currentClientId = null;
    document.getElementById('cli-id').value = '(nuevo)';
    document.getElementById('cli-problematico').checked = false;
    document.getElementById('cli-calle').value = '';
    document.getElementById('cli-nro').value = '';
    document.getElementById('cli-depto').value = '';
    document.getElementById('cli-piso').value = '';
    
    srv_new();
}

function srv_new() {
    currentServiceId = null;
    document.getElementById('srv-id').value = '(nuevo)';
    document.getElementById('srv-cli-id').value = currentClientId || '';
    document.getElementById('srv-fecha').value = new Date().toLocaleDateString('en-US');
    document.getElementById('srv-aparato').selectedIndex = 0;
    document.getElementById('srv-marca-modelo').value = '';
    document.getElementById('srv-desperfecto').value = '';
    document.getElementById('srv-cita-dia').value = '';
    document.getElementById('srv-hora-desde').value = '';
    document.getElementById('srv-hora-hasta').value = '';
    document.getElementById('srv-traer-ver').selectedIndex = 0;
    document.getElementById('srv-ingreso-taller').checked = false;
    document.getElementById('srv-reclamo-garantia').checked = false;
    document.getElementById('srv-arreglado-domicilio').checked = false;
    document.getElementById('srv-requeridos').value = '';
    document.getElementById('srv-convenidos').value = '';
    document.getElementById('srv-resena-interna').value = '';
    document.getElementById('srv-presupuesto').value = '0';
    document.getElementById('srv-acepta-presup').checked = false;
    document.getElementById('srv-garantia').value = '';
    document.getElementById('srv-cita-entrega').value = '';
    document.getElementById('srv-stock').checked = false;
    document.getElementById('srv-entregado').checked = false;
    document.getElementById('srv-factura').checked = false;
    document.getElementById('srv-info-logistica').value = '';
    document.getElementById('srv-hace-meses').value = '';
    
    renderServiceStatusNav(true);
}

async function cli_save() {
    const data = {
        cliente_problematico: document.getElementById('cli-problematico').checked ? 1 : 0,
        calle: document.getElementById('cli-calle').value,
        numero_direccion: document.getElementById('cli-nro').value,
        depto: document.getElementById('cli-depto').value || null,
        piso: document.getElementById('cli-piso').value || null
    };
    
    try {
        if (currentClientId) {
            await api(`/clientes/${currentClientId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Cliente actualizado');
            await loadClientByIndex(currentClientIndex);
        } else {
            const res = await api('/clientes', { method: 'POST', body: JSON.stringify(data) });
            showNotification('Cliente creado');
            await fetchTotalClients();
            currentClientIndex = totalClientsCount - 1;
            await loadClientByIndex(currentClientIndex);
        }
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar cliente');
    }
}

async function srv_save() {
    if (!currentClientId) {
        showNotification('Debe guardar el cliente primero');
        return;
    }
    
    const data = {
        id_cliente: currentClientId,
        fecha: document.getElementById('srv-fecha').value + ' 00:00:00',
        aparato: document.getElementById('srv-aparato').value,
        marca_modelo: document.getElementById('srv-marca-modelo').value,
        desperfecto_usuario: document.getElementById('srv-desperfecto').value,
        cita_dia: document.getElementById('srv-cita-dia').value ? document.getElementById('srv-cita-dia').value + ' 00:00:00' : null,
        hora_busqueda_desde: document.getElementById('srv-hora-desde').value || null,
        hora_busqueda_hasta: document.getElementById('srv-hora-hasta').value || null,
        traer_ver: document.getElementById('srv-traer-ver').value,
        ingreso_taller: document.getElementById('srv-ingreso-taller').checked ? 1 : 0,
        reclamo_garantia: document.getElementById('srv-reclamo-garantia').checked ? 1 : 0,
        arreglado_en_domicilio: document.getElementById('srv-arreglado-domicilio').checked ? 1 : 0,
        servicios_requeridos: document.getElementById('srv-requeridos').value || null,
        servicios_convenidos: document.getElementById('srv-convenidos').value || null,
        resena_interna_servicios: document.getElementById('srv-resena-interna').value || null,
        presupuesto: parseFloat(document.getElementById('srv-presupuesto').value) || 0,
        acepta: document.getElementById('srv-acepta-presup').checked ? 1 : 0,
        garantia: document.getElementById('srv-garantia').value || null,
        cita_entrega: document.getElementById('srv-cita-entrega').value ? document.getElementById('srv-cita-entrega').value + ' 00:00:00' : null,
        pasa_a_stock: document.getElementById('srv-stock').checked ? 1 : 0,
        entregado: document.getElementById('srv-entregado').checked ? 1 : 0,
        factura: document.getElementById('srv-factura').checked ? 1 : 0,
        info_logistica: document.getElementById('srv-info-logistica').value || null
    };
    
    try {
        if (currentServiceId) {
            await api(`/servicios/${currentServiceId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Servicio actualizado');
        } else {
            await api('/servicios', { method: 'POST', body: JSON.stringify(data) });
            showNotification('Servicio creado');
        }
        await loadClientServices(currentClientId);
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar servicio');
    }
}

async function navigateClientOffset(offset) {
    const target = currentClientIndex + offset;
    if (target >= 0 && target < totalClientsCount) {
        await loadClientByIndex(target);
    }
}

async function navigateClientIndex(index) {
    if (index >= 0 && index < totalClientsCount) {
        await loadClientByIndex(index);
    }
}

async function navigateServiceOffset(offset) {
    const target = currentServiceIndex + offset;
    if (target >= 0 && target < clientServices.length) {
        currentServiceIndex = target;
        loadServiceIntoForm(clientServices[currentServiceIndex]);
    }
}

async function navigateServiceIndex(index) {
    if (index >= 0 && index < clientServices.length) {
        currentServiceIndex = index;
        loadServiceIntoForm(clientServices[currentServiceIndex]);
    }
}

function renderServiceStatusNav(isNew = false) {
    const nav = document.getElementById('srv-record-nav');
    if (!nav) return;
    
    const displayIdx = isNew ? (clientServices.length + 1) : (clientServices.length > 0 ? currentServiceIndex + 1 : 0);
    const displayTotal = isNew ? (clientServices.length + 1) : clientServices.length;
    
    nav.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px;">
        <button class="access-nav-btn" onclick="navigateServiceIndex(0)" title="Primer servicio" style="padding: 1px 4px; font-size: 11px;">|&lt;</button>
        <button class="access-nav-btn" onclick="navigateServiceOffset(-1)" title="Anterior" style="padding: 1px 4px; font-size: 11px;">&lt;</button>
        <span>Registro:</span>
        <input type="text" value="${displayIdx}" onkeydown="if(event.key==='Enter') { let val = parseInt(this.value)-1; if(!isNaN(val)) navigateServiceIndex(val); }" style="width: 35px; text-align: center; font-size: 11px; height: 16px; border: 1px solid #777; background: #fff; color: #000; outline: none; margin: 0 2px;">
        <span>de ${displayTotal}</span>
        <button class="access-nav-btn" onclick="navigateServiceOffset(1)" title="Siguiente" style="padding: 1px 4px; font-size: 11px;">&gt;</button>
        <button class="access-nav-btn" onclick="navigateServiceIndex(clientServices.length - 1)" title="Último servicio" style="padding: 1px 4px; font-size: 11px;">&gt;|</button>
        <button class="access-nav-btn" onclick="srv_new()" title="Nuevo servicio vacío" style="padding: 1px 4px; font-size: 11px;">*</button>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span>Buscar Cliente:</span>
        <input type="text" id="status-search-input" onkeydown="if(event.key==='Enter') { document.getElementById('find-text').value = this.value; performSearch(); }" style="width: 140px; height: 16px; font-size: 11px; border: 1px solid #777; background: #fff; color: #000; outline: none; padding-left: 3px;">
      </div>
    `;
}
