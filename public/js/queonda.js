async function initQueonda() {
    const hash = window.location.hash;
    let type = 'taller';
    let filterAparato = null;
    let filterTecnico = null;
    
    if (hash.includes('?')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        type = params.get('tab') || 'taller';
        filterAparato = params.get('aparato');
        filterTecnico = params.get('tecnico');
    }
    
    // Find the matching tab element (based on the first word of type, e.g. "taller" in "taller-espera")
    const tabName = type.split('-')[0].toLowerCase();
    let tabEl = Array.from(document.querySelectorAll('.tabs .tab')).find(el => el.textContent.toLowerCase() === tabName);
    if (!tabEl) tabEl = document.querySelector('.tabs .tab');
    
    await qo_tab(type, tabEl, filterAparato, filterTecnico);
}

async function qo_tab(type, el, filterAparato = null, filterTecnico = null) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    
    let endpoint = '';
    switch(type) {
        case 'taller': endpoint = '/servicios/taller'; break;
        case 'taller-espera': endpoint = '/servicios/taller-espera'; break;
        case 'taller-terminado': endpoint = '/servicios/taller-terminado'; break;
        case 'traer': endpoint = '/servicios/traer'; break;
        case 'traer-confirmar': endpoint = '/servicios/traer-confirmar'; break;
        case 'traer-manana': endpoint = '/servicios/traer-manana'; break;
        case 'llevar': endpoint = '/servicios/llevar'; break;
        case 'llevar-devolucion': endpoint = '/servicios/llevar-devolucion'; break;
        case 'llevar-manana': endpoint = '/servicios/llevar-manana'; break;
        case 'llevado-ayer': endpoint = '/servicios/llevado-ayer'; break;
        case 'ingresados-ayer': endpoint = '/servicios/ingresados-ayer'; break;
        case 'comprar': endpoint = '/servicios/comprar-hoy'; break;
        case 'stock': endpoint = '/servicios/stock'; break;
        case 'cristian': endpoint = '/servicios/taller'; break; // We will filter this in JS below
        default: endpoint = '/servicios/taller';
    }
    
    try {
        let data = await api(endpoint);
        
        // Filter by apparatus name if passed (e.g., ventilator, washing machine)
        if (filterAparato && data) {
            data = data.filter(item => item.aparato && item.aparato.toLowerCase().includes(filterAparato.toLowerCase()));
        }
        
        // Filter by technician if passed
        if (filterTecnico && data) {
            data = data.filter(item => item.tecnico && item.tecnico.toLowerCase().includes(filterTecnico.toLowerCase()));
        }
        
        // Special case: filter for Cristian (para_cristian = 1)
        if (type === 'cristian' && data) {
            data = data.filter(item => item.para_cristian === 1);
        }
        
        createDatasheet(data, 'qo-grid', [
            { field: 'id_servicio', label: 'ID' },
            { field: 'fecha', label: 'Fecha' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'marca_modelo', label: 'Marca/Modelo' },
            { field: 'desperfecto_usuario', label: 'Desperfecto' }
        ], (row) => {
            sessionStorage.setItem('load_service_id', row.id_servicio);
            window.location.hash = '#pedido-servicio';
        });
    } catch (e) {
        console.error(e);
        document.getElementById('qo-grid').innerHTML = 'Error cargando datos.';
    }
}
