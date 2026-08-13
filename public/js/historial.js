let histSearchTimer;

async function initHistorial() {
    document.getElementById('hist-search').addEventListener('keyup', (e) => {
        clearTimeout(histSearchTimer);
        histSearchTimer = setTimeout(() => {
            hist_searchClients();
        }, 300);
    });
}

async function hist_searchClients() {
    const term = document.getElementById('hist-search').value;
    if (term.length < 2) return;
    
    try {
        const res = await api(`/clientes?q=${term}&limit=10`);
        const clients = res.data || [];
        createDatasheet(clients, 'hist-grid', [
            { field: 'nombre_apellido', label: 'Nombre' },
            { field: 'calle', label: 'Calle' },
            { field: 'tel_fijo', label: 'Teléfono' }
        ], (row) => {
            hist_loadClientServices(row.id_cliente);
        });
    } catch (e) {
        console.error(e);
    }
}

async function hist_loadClientServices(clientId) {
    try {
        const res = await api(`/clientes/${clientId}/servicios`);
        createDatasheet(res, 'hist-grid', [
            { field: 'fecha', label: 'Fecha' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'marca_modelo', label: 'Marca/Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto' },
            { field: 'presupuesto', label: 'Presupuesto' }
        ], (row) => {
            sessionStorage.setItem('load_service_id', row.id_servicio);
            window.location.hash = '#pedido-servicio';
        });
    } catch (e) {
        console.error(e);
    }
}
