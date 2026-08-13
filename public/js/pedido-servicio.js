let currentServiceId = null;

async function initPedidoServicio() {
  ps_new();
  const loadId = sessionStorage.getItem('load_service_id');
  if (loadId) {
    sessionStorage.removeItem('load_service_id');
    try {
      // Assuming we can get a service by ID. If not, we might need to search for it.
      const srv = await api(`/servicios/${loadId}`);
      if (srv) {
          loadServiceIntoForm(srv);
          if (srv.id_cliente) {
              const cRes = await api(`/clientes/${srv.id_cliente}`);
              if (cRes) {
                  document.getElementById('ps-client-display').value = cRes.nombre_apellido;
                  document.getElementById('ps-client-id').value = cRes.id_cliente;
                  loadClientServices(cRes.id_cliente);
              }
          }
      }
    } catch (e) {
        console.error(e);
    }
  }
}

function ps_new() {
  currentServiceId = null;
  document.querySelectorAll('#pedido-servicio input, #pedido-servicio textarea, #pedido-servicio select').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else if (el.type !== 'button') el.value = '';
  });
  document.getElementById('ps-subform-container').innerHTML = '';
}

async function ps_searchClient() {
  const term = document.getElementById('ps-client-search').value;
  if (!term) return;
  try {
    const res = await api(`/clientes?q=${term}`);
    if (res.data && res.data.length > 0) {
      // In a real app we might show a dropdown, here we just select the first match for simplicity
      // or we can build a quick select list if there are multiple
      const client = res.data[0]; 
      document.getElementById('ps-client-display').value = client.nombre_apellido;
      document.getElementById('ps-client-id').value = client.id_cliente;
      loadClientServices(client.id_cliente);
    } else {
      showNotification('No se encontraron clientes');
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadClientServices(clientId) {
    try {
        const res = await api(`/clientes/${clientId}/servicios`);
        createDatasheet(res, 'ps-subform-container', [
            { field: 'fecha', label: 'Fecha' },
            { field: 'aparato', label: 'Aparato' },
            { field: 'desperfecto_usuario', label: 'Desperfecto' }
        ], (row) => {
            loadServiceIntoForm(row);
        });
    } catch (e) {
        console.error(e);
    }
}

function loadServiceIntoForm(srv) {
    currentServiceId = srv.id_servicio;
    document.getElementById('ps-fecha').value = formatDateForDB(srv.fecha);
    document.getElementById('ps-aparato').value = srv.aparato || '';
    document.getElementById('ps-marca-modelo').value = srv.marca_modelo || '';
    document.getElementById('ps-desperfecto').value = srv.desperfecto_usuario || '';
    document.getElementById('ps-cita-dia').value = formatDateForDB(srv.cita_dia);
    document.getElementById('ps-hora-desde').value = srv.hora_busqueda_desde || '';
    document.getElementById('ps-hora-hasta').value = srv.hora_busqueda_hasta || '';
    document.getElementById('ps-traer-ver').value = srv.traer_ver || '';
    
    document.getElementById('ps-ingreso-taller-chk').checked = !!srv.ingreso_taller;
    document.getElementById('ps-servicios-req').value = srv.servicios_requeridos || '';
    document.getElementById('ps-resena').value = srv.resena_interna_servicios || '';
    document.getElementById('ps-servicios-conv').value = srv.servicios_convenidos || '';
    document.getElementById('ps-presupuesto').value = srv.presupuesto || '';
    document.getElementById('ps-presupuesto-palabras').value = srv.presup_palabras || '';
    
    document.getElementById('ps-chk-acepta').checked = !!srv.acepta;
    document.getElementById('ps-chk-rechaza').checked = !!srv.rechaza_devolver;
    document.getElementById('ps-chk-llamar').checked = !!srv.llamar;
    document.getElementById('ps-chk-llevar').checked = !!srv.llevar;
    document.getElementById('ps-chk-terminado').checked = !!srv.terminado;
    document.getElementById('ps-chk-entregado').checked = !!srv.entregado;
    document.getElementById('ps-chk-stock').checked = !!srv.pasa_a_stock;
    document.getElementById('ps-chk-arreglado-dom').checked = !!srv.arreglado_en_domicilio;
    document.getElementById('ps-chk-repuestos-comp').checked = !!srv.repuestos_comprados;
    document.getElementById('ps-chk-cristian').checked = !!srv.para_cristian;
    document.getElementById('ps-chk-fichaok').checked = !!srv.fichaok;
    document.getElementById('ps-chk-jo').checked = !!srv.jo;
    document.getElementById('ps-chk-factura').checked = !!srv.factura;
    document.getElementById('ps-chk-contado').checked = !!srv.contado;
    document.getElementById('ps-chk-ir').checked = !!srv.ir;
    document.getElementById('ps-chk-ic').checked = !!srv.ic;
    document.getElementById('ps-chk-reclamo').checked = !!srv.reclamo_garantia;
    document.getElementById('ps-chk-es-reclamo').checked = !!srv.es_reclamo_garantia;
    
    document.getElementById('ps-garantia').value = srv.garantia || '';
    document.getElementById('ps-cita-entrega').value = formatDateForDB(srv.cita_entrega);
    document.getElementById('ps-hora-entrega-desde').value = srv.hora_entrega_desde || '';
    document.getElementById('ps-hora-entrega-hasta').value = srv.hora_entrega_hasta || '';
    document.getElementById('ps-repuestos-comprar').value = srv.repuestos_comprar || '';
    document.getElementById('ps-info-logistica').value = srv.info_logistica || '';
    document.getElementById('ps-tecnico').value = srv.tecnico || '';
}

async function ps_save() {
    const data = {
        id_cliente: document.getElementById('ps-client-id').value,
        fecha: document.getElementById('ps-fecha').value,
        aparato: document.getElementById('ps-aparato').value,
        marca_modelo: document.getElementById('ps-marca-modelo').value,
        desperfecto_usuario: document.getElementById('ps-desperfecto').value,
        cita_dia: document.getElementById('ps-cita-dia').value,
        hora_busqueda_desde: document.getElementById('ps-hora-desde').value,
        hora_busqueda_hasta: document.getElementById('ps-hora-hasta').value,
        traer_ver: document.getElementById('ps-traer-ver').value,
        ingreso_taller: document.getElementById('ps-ingreso-taller-chk').checked ? 1 : 0,
        servicios_requeridos: document.getElementById('ps-servicios-req').value,
        resena_interna_servicios: document.getElementById('ps-resena').value,
        servicios_convenidos: document.getElementById('ps-servicios-conv').value,
        presupuesto: document.getElementById('ps-presupuesto').value || 0,
        presup_palabras: document.getElementById('ps-presupuesto-palabras').value,
        acepta: document.getElementById('ps-chk-acepta').checked ? 1 : 0,
        rechaza_devolver: document.getElementById('ps-chk-rechaza').checked ? 1 : 0,
        llamar: document.getElementById('ps-chk-llamar').checked ? 1 : 0,
        llevar: document.getElementById('ps-chk-llevar').checked ? 1 : 0,
        terminado: document.getElementById('ps-chk-terminado').checked ? 1 : 0,
        entregado: document.getElementById('ps-chk-entregado').checked ? 1 : 0,
        pasa_a_stock: document.getElementById('ps-chk-stock').checked ? 1 : 0,
        arreglado_en_domicilio: document.getElementById('ps-chk-arreglado-dom').checked ? 1 : 0,
        repuestos_comprados: document.getElementById('ps-chk-repuestos-comp').checked ? 1 : 0,
        para_cristian: document.getElementById('ps-chk-cristian').checked ? 1 : 0,
        fichaok: document.getElementById('ps-chk-fichaok').checked ? 1 : 0,
        jo: document.getElementById('ps-chk-jo').checked ? 1 : 0,
        factura: document.getElementById('ps-chk-factura').checked ? 1 : 0,
        contado: document.getElementById('ps-chk-contado').checked ? 1 : 0,
        ir: document.getElementById('ps-chk-ir').checked ? 1 : 0,
        ic: document.getElementById('ps-chk-ic').checked ? 1 : 0,
        reclamo_garantia: document.getElementById('ps-chk-reclamo').checked ? 1 : 0,
        es_reclamo_garantia: document.getElementById('ps-chk-es-reclamo').checked ? 1 : 0,
        garantia: document.getElementById('ps-garantia').value,
        cita_entrega: document.getElementById('ps-cita-entrega').value,
        hora_entrega_desde: document.getElementById('ps-hora-entrega-desde').value,
        hora_entrega_hasta: document.getElementById('ps-hora-entrega-hasta').value,
        repuestos_comprar: document.getElementById('ps-repuestos-comprar').value,
        info_logistica: document.getElementById('ps-info-logistica').value,
        tecnico: document.getElementById('ps-tecnico').value
    };

    try {
        if (currentServiceId) {
            await api(`/servicios/${currentServiceId}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('Servicio actualizado');
        } else {
            await api(`/servicios`, { method: 'POST', body: JSON.stringify(data) });
            showNotification('Servicio creado');
        }
        if (data.id_cliente) {
            loadClientServices(data.id_cliente);
        }
    } catch (e) {
        console.error(e);
        showNotification('Error al guardar');
    }
}

async function ps_delete() {
    if (!currentServiceId) return;
    if (confirm('¿Eliminar servicio?')) {
        try {
            await api(`/servicios/${currentServiceId}`, { method: 'DELETE' });
            showNotification('Servicio eliminado');
            ps_new();
            if (document.getElementById('ps-client-id').value) {
                loadClientServices(document.getElementById('ps-client-id').value);
            }
        } catch (e) {
            console.error(e);
        }
    }
}
