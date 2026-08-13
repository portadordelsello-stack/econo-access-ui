let currentRepRecordIndex = 0;
let totalRepRecordsCount = 0;
let currentRepRecordId = null;

async function initRepuestos() {
    // Nav buttons
    document.getElementById('rep-nav-first').onclick = () => navigateRepuestos(0);
    document.getElementById('rep-nav-prev').onclick = () => navigateRepuestos(currentRepRecordIndex - 1);
    document.getElementById('rep-nav-next').onclick = () => navigateRepuestos(currentRepRecordIndex + 1);
    document.getElementById('rep-nav-last').onclick = () => navigateRepuestos(totalRepRecordsCount - 1);
    document.getElementById('rep-nav-new').onclick = () => createNewRepuestoRecord();
    document.getElementById('rep-nav-save').onclick = () => saveRepuestoRecord();
    
    // Index inputs and search inputs
    document.getElementById('rep-nav-current').onkeydown = (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(e.target.value) - 1;
            if (!isNaN(val)) navigateRepuestos(val);
        }
    };
    
    document.getElementById('rep-search-input').onkeydown = (e) => {
        if (e.key === 'Enter') {
            searchRepuestos(e.target.value);
        }
    };
    
    // Register custom search callback for Ctrl+B
    activeDatasheet = {
        customSearch: async () => {
            const findText = document.getElementById('find-text').value.trim();
            const matchType = document.getElementById('find-match').value;
            if (findText) {
                await searchRepuestos(findText, matchType);
            }
        }
    };
    
    // Initial fetch of totals and index 0
    await updateRepuestosTotal();
    await navigateRepuestos(0);
}

async function updateRepuestosTotal() {
    try {
        const res = await api('/repuestos/navegar/total');
        if (res) {
            totalRepRecordsCount = res.total;
            document.getElementById('rep-nav-total').innerText = `de ${totalRepRecordsCount}`;
        }
    } catch (e) {
        console.error(e);
    }
}

async function navigateRepuestos(offset) {
    if (offset < 0) offset = 0;
    if (totalRepRecordsCount > 0 && offset >= totalRepRecordsCount) offset = totalRepRecordsCount - 1;
    
    currentRepRecordIndex = offset;
    document.getElementById('rep-nav-current').value = currentRepRecordIndex + 1;
    
    try {
        const res = await api(`/repuestos/navegar/record?offset=${offset}`);
        if (res) {
            loadRepuestoIntoForm(res);
        }
    } catch (e) {
        console.error(e);
    }
}

function loadRepuestoIntoForm(record) {
    currentRepRecordId = record.id;
    document.getElementById('rep-id').value = record.id || '';
    
    // Form fecha if exists
    let fechaStr = '';
    if (record.fecha) {
        const d = parseAccessDate(record.fecha);
        if (d && !isNaN(d.getTime())) {
            fechaStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        } else {
            fechaStr = record.fecha;
        }
    }
    
    document.getElementById('rep-fecha').value = fechaStr;
    document.getElementById('rep-denominacion').value = record.repuesto_denominacion || '';
    document.getElementById('rep-codigo-rep').value = record.codigo_repuesto || '';
    document.getElementById('rep-codigo-prov').value = record.codigo_proveedor || '';
    document.getElementById('rep-precio').value = record.precio !== null && record.precio !== undefined ? formatCurrency(record.precio) : '$ 0,00';
}

function createNewRepuestoRecord() {
    currentRepRecordId = null;
    document.getElementById('rep-id').value = '(Nuevo)';
    
    const now = new Date();
    document.getElementById('rep-fecha').value = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    
    document.getElementById('rep-denominacion').value = '';
    document.getElementById('rep-codigo-rep').value = '';
    document.getElementById('rep-codigo-prov').value = '';
    document.getElementById('rep-precio').value = '$ 0,00';
}

async function saveRepuestoRecord() {
    let rawPrice = document.getElementById('rep-precio').value;
    rawPrice = rawPrice.replace('$', '').replace(/\./g, '').replace(',', '.').trim();
    const precioVal = parseFloat(rawPrice) || 0;
    
    const dateStr = document.getElementById('rep-fecha').value.trim();
    
    const body = {
        fecha: dateStr,
        repuesto_denominacion: document.getElementById('rep-denominacion').value,
        codigo_repuesto: document.getElementById('rep-codigo-rep').value,
        codigo_proveedor: document.getElementById('rep-codigo-prov').value,
        precio: precioVal
    };
    
    try {
        let res;
        if (currentRepRecordId === null) {
            res = await api('/repuestos', {
                method: 'POST',
                body: body
            });
            showNotification('Repuesto creado correctamente');
        } else {
            res = await api(`/repuestos/${currentRepRecordId}`, {
                method: 'PUT',
                body: body
            });
            showNotification('Repuesto guardado');
        }
        
        await updateRepuestosTotal();
        if (currentRepRecordId === null && res) {
            navigateRepuestos(totalRepRecordsCount - 1);
        } else {
            navigateRepuestos(currentRepRecordIndex);
        }
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar el repuesto', 'error');
    }
}

async function searchRepuestos(query, match = 'any') {
    if (!query) return;
    try {
        const res = await api(`/repuestos/navegar/buscar?q=${encodeURIComponent(query)}&match=${match}&offset=${currentRepRecordIndex}`);
        if (res && res.offset !== undefined) {
            await navigateRepuestos(res.offset);
        }
    } catch (e) {
        showNotification('No se encontraron coincidencias para la búsqueda');
    }
}

function parseAccessDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        if (year < 100) {
            year += 2000;
        }
        return new Date(year, month, day);
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    return null;
}
