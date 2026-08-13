let currentClientId = null;
let clientData = [];
let clientCurrentIndex = 0;
let clientPage = 1;

async function initClientes() {
    await loadClientes();
}

async function loadClientes(searchTerm = '') {
    try {
        const res = await api(`/clientes?q=${searchTerm}&limit=50&page=${clientPage}`);
        clientData = res.data || [];
        if (clientData.length > 0) {
            clientCurrentIndex = 0;
            loadClientIntoForm(clientData[0]);
            updateClientNav();
        } else {
            cli_new();
            updateClientNav();
        }
    } catch (e) {
        console.error(e);
    }
}

async function cli_doSearch() {
    const term = document.getElementById('cli-search').value;
    clientPage = 1;
    await loadClientes(term);
}

function loadClientIntoForm(cli) {
    if (!cli) return;
    currentClientId = cli.id_cliente;
    document.getElementById('cli-nombre').value = cli.nombre_apellido || '';
    document.getElementById('cli-dni').value = ''; // Not in schema, leave blank or map if needed
    document.getElementById('cli-tel1').value = cli.tel_fijo || '';
    document.getElementById('cli-tel2').value = cli.tel_cel || '';
    document.getElementById('cli-calle').value = cli.calle || '';
    document.getElementById('cli-numero').value = cli.numero_direccion || '';
    document.getElementById('cli-piso').value = cli.piso || '';
    document.getElementById('cli-localidad').value = cli.localidad || '';
    
    loadClientSubform(currentClientId);
    updateClientNav();
}

async function loadClientSubform(id) {
    try {
        const res = await api(`/clientes/${id}/servicios`);
        createDatasheet(res, 'cli-subform', [
            { field: 'fecha', label: 'Fecha' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'desperfecto_usuario', label: 'Desperfecto' }
        ]);
    } catch (e) {
        console.error(e);
    }
}

function cli_new() {
    currentClientId = null;
    document.getElementById('cli-nombre').value = '';
    document.getElementById('cli-dni').value = '';
    document.getElementById('cli-tel1').value = '';
    document.getElementById('cli-tel2').value = '';
    document.getElementById('cli-calle').value = '';
    document.getElementById('cli-numero').value = '';
    document.getElementById('cli-piso').value = '';
    document.getElementById('cli-localidad').value = '';
    document.getElementById('cli-subform').innerHTML = '';
}

async function cli_save() {
    const data = {
        nombre_apellido: document.getElementById('cli-nombre').value,
        tel_fijo: document.getElementById('cli-tel1').value,
        tel_cel: document.getElementById('cli-tel2').value,
        calle: document.getElementById('cli-calle').value,
        numero_direccion: document.getElementById('cli-numero').value,
        piso: document.getElementById('cli-piso').value,
        localidad: document.getElementById('cli-localidad').value
    };
    
    try {
        if (currentClientId) {
            await api(`/clientes/${currentClientId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Cliente actualizado');
        } else {
            await api(`/clientes`, { method: 'POST', body: JSON.stringify(data) });
            showNotification('Cliente creado');
            await loadClientes();
        }
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar');
    }
}

async function cli_delete() {
    if (!currentClientId) return;
    if (confirm('¿Eliminar cliente?')) {
        try {
            await api(`/clientes/${currentClientId}`, { method: 'DELETE' });
            showNotification('Cliente eliminado');
            await loadClientes();
        } catch (e) {
            console.error(e);
        }
    }
}

function updateClientNav() {
    createRecordNav(clientCurrentIndex, clientData.length, 'cli-record-nav', (newIndex) => {
        clientCurrentIndex = newIndex;
        loadClientIntoForm(clientData[clientCurrentIndex]);
    });
}
