let currentMinId = null;
let minData = [];
let minCurrentIndex = 0;

async function initMinisterio() {
    await loadColaboradoresList();
    
    // Set up dropdown change listener
    const select = document.getElementById('min-colab');
    select.addEventListener('change', (e) => {
        loadMinisterio(e.target.value);
    });

    const hash = window.location.hash;
    if (hash.includes('?')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const colabId = params.get('colaborador');
        if (colabId) {
            select.value = colabId;
            await loadMinisterio(colabId);
            return;
        }
    }
    await loadMinisterio();
}

async function loadColaboradoresList() {
    try {
        const res = await api('/colaboradores');
        const select = document.getElementById('min-colab');
        select.innerHTML = '<option value="">Seleccione...</option>';
        res.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_colaborador;
            opt.textContent = c.nombre;
            select.appendChild(opt);
        });
        
        // Diego is a special case (lives in ministerio_diego table)
        const diegoOpt = document.createElement('option');
        diegoOpt.value = 'diego';
        diegoOpt.textContent = 'Diego';
        select.appendChild(diegoOpt);
    } catch (e) {
        console.error(e);
    }
}

async function loadMinisterio(colaboradorId = null) {
    try {
        let url = '/ministerio?limit=50';
        if (colaboradorId) {
            url = `/ministerio?colaboradorId=${colaboradorId}`;
        } else {
            const selected = document.getElementById('min-colab').value;
            if (selected) url = `/ministerio?colaboradorId=${selected}`;
        }
        
        const res = await api(url);
        minData = Array.isArray(res) ? res : (res.data || []);
        
        createDatasheet(minData, 'min-grid', [
            { field: 'fecha', label: 'Fecha' },
            { field: 'entrada', label: 'Entrada' },
            { field: 'salida', label: 'Salida' },
            { field: 'horas_hoy', label: 'Horas' }
        ], (row) => {
            loadMinIntoForm(row);
        });
        
        if (minData.length > 0) {
            minCurrentIndex = 0;
            loadMinIntoForm(minData[0]);
            updateMinNav();
        } else {
            min_new();
        }
    } catch (e) {
        console.error(e);
    }
}

function loadMinIntoForm(m) {
    currentMinId = m.id_ministerio;
    document.getElementById('min-colab').value = m.id_colaborador || (m.id_colaborador === undefined ? 'diego' : '');
    document.getElementById('min-fecha').value = formatDateForDB(m.fecha)?.split(' ')[0] || '';
    document.getElementById('min-entrada').value = m.entrada || '';
    document.getElementById('min-salida').value = m.salida || '';
    document.getElementById('min-entradabis').value = m.entrada_bis || '';
    document.getElementById('min-salidabis').value = m.salida_bis || '';
    document.getElementById('min-ajuste').value = m.ajuste || '';
    document.getElementById('min-adelanto').value = m.adelanto || '';
    document.getElementById('min-info').value = m.info || '';
    updateMinNav();
}

function min_new() {
    currentMinId = null;
    document.getElementById('min-fecha').value = today();
    document.getElementById('min-entrada').value = '';
    document.getElementById('min-salida').value = '';
    document.getElementById('min-entradabis').value = '';
    document.getElementById('min-salidabis').value = '';
    document.getElementById('min-ajuste').value = '';
    document.getElementById('min-adelanto').value = '';
    document.getElementById('min-info').value = '';
}

async function min_save() {
    const data = {
        id_colaborador: document.getElementById('min-colab').value,
        fecha: document.getElementById('min-fecha').value,
        entrada: document.getElementById('min-entrada').value,
        salida: document.getElementById('min-salida').value,
        entrada_bis: document.getElementById('min-entradabis').value,
        salida_bis: document.getElementById('min-salidabis').value,
        ajuste: document.getElementById('min-ajuste').value,
        adelanto: document.getElementById('min-adelanto').value,
        info: document.getElementById('min-info').value
    };
    
    try {
        if (currentMinId) {
            await api(`/ministerio/${currentMinId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Registro actualizado');
        } else {
            await api('/ministerio', { method: 'POST', body: JSON.stringify(data) });
            showNotification('Registro creado');
        }
        await loadMinisterio();
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar');
    }
}

async function min_delete() {
    if (!currentMinId) return;
    if (confirm('¿Eliminar registro?')) {
        try {
            await api(`/ministerio/${currentMinId}`, { method: 'DELETE' });
            showNotification('Registro eliminado');
            await loadMinisterio();
        } catch (e) {
            console.error(e);
        }
    }
}

function updateMinNav() {
    document.getElementById('min-record-nav').innerHTML = createRecordNav(minCurrentIndex + 1, minData.length, 'min_navigate');
}

function min_navigate(action) {
    if (action === 'first') minCurrentIndex = 0;
    if (action === 'prev' && minCurrentIndex > 0) minCurrentIndex--;
    if (action === 'next' && minCurrentIndex < minData.length - 1) minCurrentIndex++;
    if (action === 'last') minCurrentIndex = minData.length - 1;
    if (action === 'new') return min_new();
    
    loadMinIntoForm(minData[minCurrentIndex]);
}
