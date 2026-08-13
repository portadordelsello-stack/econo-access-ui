let currentGastoId = null;
let gastosTotalCount = 0;
let gastosCurrentIndex = 0;
let metaOptions = { proveedors: [], rubros: [] };

async function initGastos() {
    await loadMetaOptions();
    await fetchTotalCount();
    if (gastosTotalCount > 0) {
        await loadRecordByIndex(0);
    } else {
        gas_new();
    }
    
    // Bind buttons
    document.getElementById('btn-prev').onclick = () => navigateOffset(-1);
    document.getElementById('btn-next').onclick = () => navigateOffset(1);
    document.getElementById('btn-last').onclick = () => navigateIndex(gastosTotalCount - 1);
    document.getElementById('btn-new').onclick = () => gas_new();
    
    document.getElementById('gas-save-btn').onclick = () => gas_save();
    document.getElementById('gas-delete-btn').onclick = () => gas_delete();
    
    // Calendar helper
    document.getElementById('btn-calendar').onclick = () => {
        const inp = document.getElementById('gas-fecha');
        const prevVal = inp.value;
        const inputDate = prompt('Ingrese la fecha (MM/DD/YYYY):', prevVal || new Date().toLocaleDateString('en-US'));
        if (inputDate) {
            inp.value = inputDate;
        }
    };
    
    // Live calculation listeners
    const calcInputs = ['gas-parcial', 'gas-sumar', 'gas-restar'];
    calcInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateGastoCalculation);
        }
    });

    // Register custom search for Ctrl+B
    activeDatasheet = {
        customSearch: async () => {
            const findText = document.getElementById('find-text').value.trim();
            const matchType = document.getElementById('find-match').value;
            if (!findText) return;
            
            const res = await api(`/gastos/navegar/buscar?q=${encodeURIComponent(findText)}&match=${matchType}&offset=${gastosCurrentIndex}`);
            if (res && res.offset !== undefined) {
                gastosCurrentIndex = res.offset;
                loadGastoIntoForm(res.record);
            } else {
                showAccessMessageBox('Microsoft Access finalizó la búsqueda de los registros. No se encontró el elemento buscado.');
            }
        }
    };
}

async function loadMetaOptions() {
    try {
        const res = await api('/gastos/meta/options');
        if (res) {
            metaOptions = res;
            
            const provSelect = document.getElementById('gas-proveedor');
            provSelect.innerHTML = `<option value="">(ninguno)</option>` + 
                metaOptions.proveedors.map(p => `<option value="${p}">${p}</option>`).join('');
                
            const rubroSelect = document.getElementById('gas-rubro');
            rubroSelect.innerHTML = `<option value="">(ninguno)</option>` + 
                metaOptions.rubros.map(r => `<option value="${r}">${r}</option>`).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchTotalCount() {
    try {
        const res = await api('/gastos/navegar/total');
        if (res) {
            gastosTotalCount = res.total;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadRecordByIndex(index) {
    if (index < 0 || index >= gastosTotalCount) return;
    try {
        const res = await api(`/gastos/navegar/record?offset=${index}`);
        if (res) {
            gastosCurrentIndex = index;
            loadGastoIntoForm(res);
        }
    } catch (e) {
        console.error(e);
    }
}

function loadGastoIntoForm(gas) {
    currentGastoId = gas.id;
    document.getElementById('gas-fecha').value = gas.fecha || '';
    document.getElementById('gas-parcial').value = gas.parcial !== null ? gas.parcial : '';
    document.getElementById('gas-sumar').value = gas.sumar !== null ? gas.sumar : '';
    document.getElementById('gas-restar').value = gas.restar !== null ? gas.restar : '';
    document.getElementById('gas-desc').value = gas.descripcion || '';
    document.getElementById('gas-proveedor').value = gas.proveedor || '';
    document.getElementById('gas-rubro').value = gas.rubro || '';
    document.getElementById('gas-econoservice').checked = gas.econoservice === 1;
    document.getElementById('gas-fa').checked = gas.fa === 1;
    
    updateGastoCalculation();
    renderStatusRecordNav();
}

function updateGastoCalculation() {
    const parcial = parseFloat(document.getElementById('gas-parcial').value) || 0;
    const sumar = parseFloat(document.getElementById('gas-sumar').value) || 0;
    const restar = parseFloat(document.getElementById('gas-restar').value) || 0;
    const total = parcial + sumar - restar;
    
    document.getElementById('gas-total-gasto').value = formatCurrency(total);
}

function gas_new() {
    currentGastoId = null;
    document.getElementById('gas-fecha').value = new Date().toLocaleDateString('en-US') + ' 00:00:00';
    document.getElementById('gas-parcial').value = '';
    document.getElementById('gas-sumar').value = '';
    document.getElementById('gas-restar').value = '';
    document.getElementById('gas-desc').value = '';
    document.getElementById('gas-proveedor').value = '';
    document.getElementById('gas-rubro').value = '';
    document.getElementById('gas-econoservice').checked = false;
    document.getElementById('gas-fa').checked = false;
    document.getElementById('gas-total-gasto').value = '$0,00';
    
    renderStatusRecordNav(true);
}

async function gas_save() {
    const data = {
        fecha: document.getElementById('gas-fecha').value,
        parcial: parseFloat(document.getElementById('gas-parcial').value) || null,
        sumar: parseFloat(document.getElementById('gas-sumar').value) || null,
        restar: parseFloat(document.getElementById('gas-restar').value) || null,
        descripcion: document.getElementById('gas-desc').value,
        proveedor: document.getElementById('gas-proveedor').value || null,
        rubro: document.getElementById('gas-rubro').value || null,
        econoservice: document.getElementById('gas-econoservice').checked ? 1 : 0,
        fa: document.getElementById('gas-fa').checked ? 1 : 0
    };
    
    try {
        if (currentGastoId) {
            await api(`/gastos/${currentGastoId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Gasto actualizado');
        } else {
            await api('/gastos', { method: 'POST', body: JSON.stringify(data) });
            showNotification('Gasto creado');
            await fetchTotalCount();
            gastosCurrentIndex = gastosTotalCount - 1; // Go to new record
        }
        await loadRecordByIndex(gastosCurrentIndex);
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar');
    }
}

async function gas_delete() {
    if (!currentGastoId) return;
    if (confirm('¿Eliminar gasto?')) {
        try {
            await api(`/gastos/${currentGastoId}`, { method: 'DELETE' });
            showNotification('Gasto eliminado');
            await fetchTotalCount();
            gastosCurrentIndex = Math.max(0, gastosCurrentIndex - 1);
            if (gastosTotalCount > 0) {
                await loadRecordByIndex(gastosCurrentIndex);
            } else {
                gas_new();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

async function navigateOffset(offset) {
    const target = gastosCurrentIndex + offset;
    if (target >= 0 && target < gastosTotalCount) {
        await loadRecordByIndex(target);
    }
}

async function navigateIndex(index) {
    if (index >= 0 && index < gastosTotalCount) {
        await loadRecordByIndex(index);
    }
}

function renderStatusRecordNav(isNew = false) {
    const nav = document.getElementById('gas-record-nav');
    if (!nav) return;
    
    const displayIdx = isNew ? (gastosTotalCount + 1) : (gastosCurrentIndex + 1);
    const displayTotal = isNew ? (gastosTotalCount + 1) : gastosTotalCount;
    
    nav.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px;">
        <button class="access-nav-btn" onclick="navigateIndex(0)" title="Primer registro" style="padding: 1px 4px; font-size: 11px;">|&lt;</button>
        <button class="access-nav-btn" onclick="navigateOffset(-1)" title="Anterior" style="padding: 1px 4px; font-size: 11px;">&lt;</button>
        <span>Registro:</span>
        <input type="text" value="${displayIdx}" onkeydown="if(event.key==='Enter') { let val = parseInt(this.value)-1; if(!isNaN(val)) navigateIndex(val); }" style="width: 35px; text-align: center; font-size: 11px; height: 16px; border: 1px solid #777; background: #fff; color: #000; outline: none; margin: 0 2px;">
        <span>de ${displayTotal}</span>
        <button class="access-nav-btn" onclick="navigateOffset(1)" title="Siguiente" style="padding: 1px 4px; font-size: 11px;">&gt;</button>
        <button class="access-nav-btn" onclick="navigateIndex(gastosTotalCount - 1)" title="Último registro" style="padding: 1px 4px; font-size: 11px;">&gt;|</button>
        <button class="access-nav-btn" onclick="gas_new()" title="Nuevo registro vacío" style="padding: 1px 4px; font-size: 11px;">*</button>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span>Buscar:</span>
        <input type="text" id="status-search-input" onkeydown="if(event.key==='Enter') { document.getElementById('find-text').value = this.value; performSearch(); }" style="width: 140px; height: 16px; font-size: 11px; border: 1px solid #777; background: #fff; color: #000; outline: none; padding-left: 3px;">
      </div>
    `;
}
