let currentColabId = null;
let colabData = [];
let colabCurrentIndex = 0;

async function initColaboradores() {
    await loadColaboradores();
}

async function loadColaboradores() {
    try {
        const res = await api('/colaboradores');
        colabData = res || [];
        if (colabData.length > 0) {
            colabCurrentIndex = 0;
            loadColabIntoForm(colabData[0]);
            updateColabNav();
        } else {
            col_new();
            updateColabNav();
        }
    } catch (e) {
        console.error(e);
    }
}

function loadColabIntoForm(c) {
    if (!c) return;
    currentColabId = c.id_colaborador;
    document.getElementById('col-nombre').value = c.nombre || '';
    document.getElementById('col-dni').value = c.dni || '';
    document.getElementById('col-fnac').value = formatDateForDB(c.fecha_nacimiento);
    document.getElementById('col-dom').value = c.domicilio || '';
}

function col_new() {
    currentColabId = null;
    document.getElementById('col-nombre').value = '';
    document.getElementById('col-dni').value = '';
    document.getElementById('col-fnac').value = '';
    document.getElementById('col-dom').value = '';
}

async function col_save() {
    const data = {
        nombre: document.getElementById('col-nombre').value,
        dni: document.getElementById('col-dni').value,
        fecha_nacimiento: document.getElementById('col-fnac').value,
        domicilio: document.getElementById('col-dom').value
    };
    
    try {
        if (currentColabId) {
            await api(`/colaboradores/${currentColabId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Colaborador actualizado');
        } else {
            await api(`/colaboradores`, { method: 'POST', body: JSON.stringify(data) });
            showNotification('Colaborador creado');
        }
        await loadColaboradores();
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar');
    }
}

async function col_delete() {
    if (!currentColabId) return;
    if (confirm('¿Eliminar colaborador?')) {
        try {
            await api(`/colaboradores/${currentColabId}`, { method: 'DELETE' });
            showNotification('Colaborador eliminado');
            await loadColaboradores();
        } catch (e) {
            console.error(e);
        }
    }
}

function updateColabNav() {
    createRecordNav(colabCurrentIndex, colabData.length, 'col-record-nav', (newIndex) => {
        colabCurrentIndex = newIndex;
        loadColabIntoForm(colabData[colabCurrentIndex]);
    });
}
