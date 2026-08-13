async function initServiciosMesHechos() {
    await loadServiciosMesHechos();
}

async function loadServiciosMesHechos() {
    try {
        const res = await api('/servicios/servicios-mes-hechos');
        createAccessDatasheet(res, 'servicios-mes-hechos-grid', [
            { 
                field: 'cita_entrega', 
                label: 'Cita entrega', 
                format: 'date' 
            },
            { 
                field: 'calle', 
                label: 'Calle' 
            },
            { 
                field: 'numero_direccion', 
                label: 'Numero direccion' 
            },
            { 
                field: 'presupuesto', 
                label: 'Presupuesto', 
                format: 'currency' 
            },
            { 
                field: 'servicios_convenidos', 
                label: 'Servicios Convenidos' 
            }
        ]);
    } catch (e) {
        console.error(e);
    }
}
