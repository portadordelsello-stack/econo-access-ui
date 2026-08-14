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
        console.error('Error loading collaborators:', e);
    }
}

async function loadColabIntoForm(c) {
    if (!c) return;
    currentColabId = c.id_colaborador;
    document.getElementById('col-nombre').value = c.nombre || '';
    document.getElementById('col-dni').value = c.dni || '';
    document.getElementById('col-fnac').value = c.fecha_nacimiento || '';
    document.getElementById('col-id').value = c.id_colaborador || '';

    // Load ministry logs for this collaborator
    await loadColabMinistryLogs(c.id_colaborador);
}

async function loadColabMinistryLogs(colabId) {
    const gridContainer = document.getElementById('col-min-grid');
    if (!gridContainer) return;

    try {
        const logs = await api(`/ministerio?colaboradorId=${colabId}`);
        gridContainer.innerHTML = '';

        const subColumns = [
            { field: 'id_ministerio', label: 'Id r' },
            { field: 'fecha', label: 'fecha', format: 'date' },
            { field: 'entrada', label: 'entrada' },
            { field: 'salida', label: 'salida' },
            { field: 'entrada_bis', label: 'entrada bis' },
            { field: 'salida_bis', label: 'salida bis' },
            { field: 'ajuste', label: 'ajuste' }
        ];

        createAccessDatasheet(logs, 'col-min-grid', subColumns);
    } catch (e) {
        console.error('Error loading collaborator logs:', e);
        gridContainer.innerHTML = `<div style="padding: 10px; color: red;">Error al cargar registros del ministerio.</div>`;
    }
}

function col_new() {
    currentColabId = null;
    document.getElementById('col-nombre').value = '';
    document.getElementById('col-dni').value = '';
    document.getElementById('col-fnac').value = '';
    document.getElementById('col-id').value = '(Nuevo)';
    
    const gridContainer = document.getElementById('col-min-grid');
    if (gridContainer) gridContainer.innerHTML = '';
}

async function col_save() {
    const data = {
        nombre: document.getElementById('col-nombre').value,
        dni: document.getElementById('col-dni').value,
        fecha_nacimiento: document.getElementById('col-fnac').value
    };
    
    try {
        if (currentColabId) {
            await api(`/colaboradores/${currentColabId}`, { 
                method: 'PUT',
                body: data 
            });
            showNotification('Colaborador actualizado');
        } else {
            const res = await api(`/colaboradores`, { 
                method: 'POST',
                body: data 
            });
            currentColabId = res.id_colaborador;
            showNotification('Colaborador creado');
        }
        await loadColaboradores();
    } catch (e) {
        console.error('Error saving collaborator:', e);
        showNotification('Error al guardar', 'error');
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
            console.error('Error deleting collaborator:', e);
            showNotification('Error al eliminar', 'error');
        }
    }
}

function prevColab() {
    if (colabCurrentIndex > 0) {
        colabCurrentIndex--;
        loadColabIntoForm(colabData[colabCurrentIndex]);
        updateColabNav();
    }
}

function nextColab() {
    if (colabCurrentIndex < colabData.length - 1) {
        colabCurrentIndex++;
        loadColabIntoForm(colabData[colabCurrentIndex]);
        updateColabNav();
    }
}

function updateColabNav() {
    const recordText = document.getElementById('col-record-text');
    if (recordText) {
        recordText.innerText = `Registro: ${colabData.length > 0 ? colabCurrentIndex + 1 : 0} de ${colabData.length}`;
    }
}
