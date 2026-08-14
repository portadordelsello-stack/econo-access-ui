// app.js - SPA Router and Utilities

const API_BASE = '/api';

// Utility Functions
async function api(endpoint, options = {}) {
  try {
    const headers = { ...options.headers };
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    showNotification(err.message, 'error');
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR');
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
}

function formatCurrency(num) {
  if (!num) return '$0,00';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
}

function formatDateForDB(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS format
}

function showNotification(msg, type = 'info') {
  alert(`${type.toUpperCase()}: ${msg}`); // Simple fallback for now
}

function today() {
  const d = new Date();
  return formatDateForDB(d).split(' ')[0];
}

function createRecordNav(current, total, onNavigate) {
  return `
    <div class="record-nav">
      <div class="nav-btn" onclick="${onNavigate}('first')">|&lt;</div>
      <div class="nav-btn" onclick="${onNavigate}('prev')">&lt;</div>
      <div class="nav-info">Registro ${current} de ${total}</div>
      <div class="nav-btn" onclick="${onNavigate}('next')">&gt;</div>
      <div class="nav-btn" onclick="${onNavigate}('last')">&gt;|</div>
      <div class="nav-btn" onclick="${onNavigate}('new')" style="margin-left: 10px;">*</div>
    </div>
  `;
}

function createDatasheet(rows, containerId, columns, onRowClick = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  const table = document.createElement('table');
  table.className = 'datasheet';

  // Header
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  const rowList = rows || [];
  rowList.forEach((row, idx) => {
    const tr = document.createElement('tr');
    
    // Determine row ID
    const rowId = row.id_servicio || row.id_cliente || row.id_colaborador || row.id_ministerio || row.id_mision || row.id || idx;
    tr.dataset.id = rowId;

    columns.forEach(col => {
      const td = document.createElement('td');
      let val = row[col.field];
      if (col.format === 'date') val = formatDate(val);
      if (col.format === 'currency') val = formatCurrency(val);
      td.textContent = val !== null && val !== undefined ? val : '';
      tr.appendChild(td);
    });

    tr.addEventListener('click', () => {
      // Highlight row
      const siblingRows = tbody.querySelectorAll('tr');
      siblingRows.forEach(r => r.classList.remove('selected'));
      tr.classList.add('selected');
      if (typeof onRowClick === 'function') {
        onRowClick(row);
      }
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.innerHTML = '';
  container.appendChild(table);
}

function createAccessDatasheet(rows, containerId, columns, onRowClick = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'access-datasheet-container';

  // 1. Grid Wrapper
  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'access-datasheet-grid-wrapper';

  const table = document.createElement('table');
  table.className = 'access-datasheet-table';

  // Header
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  
  // Selector column header
  const thSel = document.createElement('th');
  thSel.className = 'selector-header';
  trHead.appendChild(thSel);

  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  const rowList = rows || [];
  
  let selectedRowIdx = 0;

  activeDatasheet = {
    rows: rowList,
    columns: columns,
    get selectedRowIdx() { return selectedRowIdx; },
    set selectedRowIdx(val) {
      selectedRowIdx = val;
      updateRowSelection();
      const trs = tbody.querySelectorAll('tr.data-row');
      if (trs[selectedRowIdx]) {
        trs[selectedRowIdx].scrollIntoView({ block: 'nearest' });
      }
    },
    updateSelection: updateRowSelection
  };

  function updateRowSelection() {
    const trs = tbody.querySelectorAll('tr.data-row');
    trs.forEach((tr, index) => {
      const selCell = tr.querySelector('.selector-cell');
      if (index === selectedRowIdx) {
        tr.classList.add('selected');
        selCell.textContent = '▸';
      } else {
        tr.classList.remove('selected');
        selCell.textContent = '';
      }
    });
    
    // Update record nav input
    const navInput = wrapper.querySelector('.access-datasheet-nav-input');
    if (navInput) navInput.value = rowList.length > 0 ? (selectedRowIdx + 1) : 0;
  }

  rowList.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'data-row';
    const rowId = row.id_servicio || row.id_cliente || row.id_colaborador || row.id_ministerio || row.id_mision || row.id || idx;
    tr.dataset.id = rowId;

    // Selector cell
    const tdSel = document.createElement('td');
    tdSel.className = 'selector-cell';
    tr.appendChild(tdSel);

    columns.forEach(col => {
      const td = document.createElement('td');
      td.className = 'data-cell';
      let val = row[col.field];
      if (col.format === 'checkbox') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = (val === 1 || val === true || val === '1');
        cb.addEventListener('change', () => {
          if (col.onChange) col.onChange(row, cb.checked);
        });
        td.appendChild(cb);
        td.style.textAlign = 'center';
      } else {
        if (col.format === 'date') val = formatDate(val);
        if (col.format === 'currency') val = formatCurrency(val);
        td.textContent = val !== null && val !== undefined ? val : '';
      }
      tr.appendChild(td);
    });

    tr.addEventListener('click', () => {
      selectedRowIdx = idx;
      updateRowSelection();
      if (typeof onRowClick === 'function') {
        onRowClick(row);
      }
    });

    tbody.appendChild(tr);
  });

  // Access always shows a blank "new row" at the bottom with a *
  const trNew = document.createElement('tr');
  trNew.className = 'new-row';
  const tdSelNew = document.createElement('td');
  tdSelNew.className = 'selector-cell';
  tdSelNew.textContent = '*';
  trNew.appendChild(tdSelNew);

  columns.forEach(col => {
    const td = document.createElement('td');
    td.className = 'data-cell';
    if (col.format === 'checkbox') {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.disabled = true;
      td.appendChild(cb);
      td.style.textAlign = 'center';
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '';
      input.style.border = 'none';
      input.style.background = 'transparent';
      input.style.width = '100%';
      input.style.outline = 'none';
      input.style.fontFamily = 'inherit';
      input.style.fontSize = 'inherit';
      
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
          if (col.onInsert) {
            await col.onInsert(input.value.trim());
            input.value = '';
          }
        }
      });
      td.appendChild(input);
    }
    
    td.addEventListener('click', () => {
      const trs = tbody.querySelectorAll('tr.data-row');
      trs.forEach(tr => {
        tr.classList.remove('selected');
        tr.querySelector('.selector-cell').textContent = '';
      });
      trNew.classList.add('selected');
      tdSelNew.textContent = '▸';
      
      const navInput = wrapper.querySelector('.access-datasheet-nav-input');
      if (navInput) navInput.value = rowList.length + 1;
    });
    trNew.appendChild(td);
  });
  tbody.appendChild(trNew);

  table.appendChild(tbody);
  gridWrapper.appendChild(table);
  wrapper.appendChild(gridWrapper);

  // 2. Navigation Bar
  const navBar = document.createElement('div');
  navBar.className = 'access-datasheet-nav-bar';

  // Navigation Left
  const navLeft = document.createElement('div');
  navLeft.className = 'access-datasheet-nav-left';
  navLeft.innerHTML = `
    <span>Registro:</span>
    <button class="access-datasheet-nav-btn btn-first" title="Primero">|&lt;</button>
    <button class="access-datasheet-nav-btn btn-prev" title="Anterior">&lt;</button>
    <input type="text" class="access-datasheet-nav-input" value="1">
    <span>de ${rowList.length}</span>
    <button class="access-datasheet-nav-btn btn-next" title="Siguiente">&gt;</button>
    <button class="access-datasheet-nav-btn btn-last" title="Último">&gt;|</button>
    <button class="access-datasheet-nav-btn btn-new-record" title="Nuevo Registro">*</button>
  `;

  const btnFirst = navLeft.querySelector('.btn-first');
  const btnPrev = navLeft.querySelector('.btn-prev');
  const btnNext = navLeft.querySelector('.btn-next');
  const btnLast = navLeft.querySelector('.btn-last');
  const btnNewRecord = navLeft.querySelector('.btn-new-record');
  const navInput = navLeft.querySelector('.access-datasheet-nav-input');

  btnFirst.addEventListener('click', () => {
    if (rowList.length > 0) {
      selectedRowIdx = 0;
      updateRowSelection();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (selectedRowIdx > 0) {
      selectedRowIdx--;
      updateRowSelection();
    }
  });

  btnNext.addEventListener('click', () => {
    if (selectedRowIdx < rowList.length - 1) {
      selectedRowIdx++;
      updateRowSelection();
    }
  });

  btnLast.addEventListener('click', () => {
    if (rowList.length > 0) {
      selectedRowIdx = rowList.length - 1;
      updateRowSelection();
    }
  });

  btnNewRecord.addEventListener('click', () => {
    const trs = tbody.querySelectorAll('tr.data-row');
    trs.forEach(tr => {
      tr.classList.remove('selected');
      tr.querySelector('.selector-cell').textContent = '';
    });
    trNew.classList.add('selected');
    tdSelNew.textContent = '▸';
    if (navInput) navInput.value = rowList.length + 1;
    
    const firstTextCellInput = trNew.querySelector('input[type="text"]');
    if (firstTextCellInput) firstTextCellInput.focus();
  });

  navInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const idx = parseInt(navInput.value) - 1;
      if (idx >= 0 && idx < rowList.length) {
        selectedRowIdx = idx;
        updateRowSelection();
      } else if (idx === rowList.length) {
        btnNewRecord.click();
      }
    }
  });

  navBar.appendChild(navLeft);

  // Navigation Right (Search box)
  const navRight = document.createElement('div');
  navRight.className = 'access-datasheet-nav-search';
  navRight.innerHTML = `
    <span>Buscar</span>
    <input type="text" placeholder="...">
  `;
  const searchInput = navRight.querySelector('input');
  searchInput.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr.data-row');
    rows.forEach(tr => {
      const match = tr.textContent.toLowerCase().includes(text);
      tr.style.display = match ? '' : 'none';
    });
  });

  navBar.appendChild(navRight);
  wrapper.appendChild(navBar);

  container.innerHTML = '';
  container.appendChild(wrapper);

  updateRowSelection();
}

// Tab Management State
let openTabs = [];

function getPageNameFromHash(hash) {
  if (!hash || hash === '#') return 'panel';
  const cleanHash = hash.split('?')[0];
  return cleanHash.replace('#', '');
}

function isFormPage(pageName) {
  const datasheets = ['historial', 'pedidos', 'productos-meses', 'misiones', 'gastos-mes', 'servicios-mes-hechos', 'stock', 'comprar-hoy', 'vianda', 'repue', 'alim', 'salar', 'infra', 'roti', 'insum', 'franja-prod', 'lacuentadehoybis', 'calculadora-total', 'taller-fichar', 'control-facturas', 'facturas-de-este-mes', 'producto-presente-mes', 'lacuentadehoybistotal'];
  return !datasheets.includes(pageName);
}

function getTabTitle(hash) {
  const pageName = getPageNameFromHash(hash);
  if (pageName === 'queonda') {
    if (hash.includes('?')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const tab = params.get('tab');
      if (tab) {
        if (tab === 'taller') return 'taller';
        if (tab === 'taller-espera') return 'taller espera';
        if (tab === 'taller-terminado') return 'TALLER TERMINADO';
        if (tab === 'traer') return 'TRAER';
        if (tab === 'traer-confirmar') return 'TRAER a confirmar';
        if (tab === 'traer-manana') return 'TRAER MAÑANA';
        if (tab === 'llevar') return 'LLEVAR ACEPTADO';
        if (tab === 'llevar-devolucion') return 'LLEVAR DEVOLUCION';
        if (tab === 'llevar-manana') return 'LLEVAR ACEPTADO MAÑANA';
        if (tab === 'llevado-ayer') return 'LLEVADO AYER';
        if (tab === 'ingresados-ayer') return 'ingresados ayer';
        if (tab === 'comprar') return 'Comprar Hoy';
        if (tab === 'stock') return 'STOCK';
        if (tab === 'cristian') return 'taller cristian';
        return tab.replace('-', ' ').toUpperCase();
      }
    }
    return 'queonda';
  }
  if (pageName === 'panel') return 'PANEL';
  if (pageName === 'pedido-servicio') return 'pedido de servicio';
  if (pageName === 'clientes') return 'clientes';
  if (pageName === 'gastos') return 'GASTOS';
  if (pageName === 'ministerio') return 'ministerio';
  if (pageName === 'colaboradores') return 'colaboradores';
  if (pageName === 'historial') return 'historial';
  if (pageName === 'pedidos') return 'Pedidos';
  if (pageName === 'repuestos') return 'formulario repuestos mega';
  if (pageName === 'productos-meses') return 'productos meses';
  if (pageName === 'resumen-mensual') return 'pb-gmes=mano';
  if (pageName === 'misiones') return 'MISIONES VARIAS';
  if (pageName === 'gastos-mes') return 'gastos mes';
  if (pageName === 'servicios-mes-hechos') return 'servicios de este mes hechos';
  if (pageName === 'stock') return 'STOCK';
  if (pageName === 'comprar-hoy') return 'Comprar Hoy';
  if (pageName === 'vianda') return 'gasto mes vianda total';
  if (pageName === 'repue') return 'gasto mes repuestos total';
  if (pageName === 'alim') return 'gasto mes alimento total';
  if (pageName === 'salar') return 'gasto mes salario bis total';
  if (pageName === 'infra') return 'gasto mes infraestructura total';
  if (pageName === 'roti') return 'gasto mes rotiseria total';
  if (pageName === 'insum') return 'gasto mes insumos eco total';
  if (pageName === 'franja-prod') return 'Total$octubre2020';
  if (pageName === 'lacuentadehoybis') return 'lacuentadehoybis';
  if (pageName === 'calculadora-total') return 'calculadora total';
  if (pageName === 'taller-fichar') return 'taller_fichar';
  if (pageName === 'control-facturas') return 'control facturas';
  if (pageName === 'facturas-de-este-mes') return 'facturas de este mes';
  if (pageName === 'producto-presente-mes') return 'producto presente mes';
  if (pageName === 'lacuentadehoybistotal') return 'lacuentadehoybistotal';
  if (pageName === 'queonda') return 'queonda';
  if (pageName === 'formulario6') return 'Formulario6';
  return pageName;
}

function renderTabsBar() {
  const bar = document.getElementById('access-tabs-bar');
  if (!bar) return;
  
  const formIcon = `<svg viewBox="0 0 16 16" width="12" height="12" class="tab-icon"><rect x="2" y="2" width="12" height="12" fill="#FFEAA7" stroke="#D35400" stroke-width="1"/><rect x="2" y="2" width="12" height="3" fill="#D35400"/><line x1="4" y1="7" x2="12" y2="7" stroke="#333" stroke-width="1"/><line x1="4" y1="10" x2="9" y2="10" stroke="#333" stroke-width="1"/></svg>`;
  const dataIcon = `<svg viewBox="0 0 16 16" width="12" height="12" class="tab-icon"><rect x="2" y="2" width="12" height="12" fill="#FFF" stroke="#2B579A" stroke-width="1"/><line x1="2" y1="6" x2="14" y2="6" stroke="#2b579a" stroke-width="1"/><line x1="2" y1="10" x2="14" y2="10" stroke="#2b579a" stroke-width="1"/><line x1="6" y1="2" x2="6" y2="14" stroke="#2b579a" stroke-width="1"/><line x1="10" y1="2" x2="10" y2="14" stroke="#2b579a" stroke-width="1"/></svg>`;
  
  let html = '';
  openTabs.forEach(tab => {
    const isCurrent = (tab.hash === window.location.hash || (tab.id === 'panel' && (!window.location.hash || window.location.hash === '#')));
    const activeClass = isCurrent ? 'active' : '';
    const icon = tab.isForm ? formIcon : dataIcon;
    const isPanel = tab.id === 'panel';
    const closeBtn = isPanel ? '' : `<span class="tab-close" onclick="closeTab('${tab.hash}', event)">×</span>`;
    
    html += `
      <div class="access-tab ${activeClass}" onclick="switchTab('${tab.hash}')">
        <span class="tab-icon">${icon}</span>
        <span class="tab-title">${tab.title}</span>
        ${closeBtn}
      </div>
    `;
  });
  bar.innerHTML = html;
}

function switchTab(hash) {
  window.location.hash = hash;
}

function closeTab(hash, event) {
  if (event) event.stopPropagation();
  
  const idx = openTabs.findIndex(t => t.hash === hash);
  if (idx === -1) return;
  
  openTabs.splice(idx, 1);
  
  const contentEl = document.querySelector(`.tab-content[data-hash="${hash}"]`);
  if (contentEl) contentEl.remove();
  
  const currentHash = window.location.hash;
  if (currentHash === hash) {
    const nextActiveTab = openTabs[idx - 1] || openTabs[0];
    window.location.hash = nextActiveTab.hash;
  } else {
    renderTabsBar();
  }
}

function router() {
  if (openTabs.length === 0) {
    openTabs = [{
      id: 'panel',
      title: 'PANEL',
      hash: '',
      isForm: true
    }];
  }

  const hash = window.location.hash;
  const pageName = getPageNameFromHash(hash);
  
  let tab = openTabs.find(t => t.hash === hash || (t.id === 'panel' && pageName === 'panel'));
  if (!tab) {
    const basePageTab = openTabs.find(t => getPageNameFromHash(t.hash) === pageName);
    if (basePageTab) {
      basePageTab.hash = hash;
      tab = basePageTab;
    } else {
      tab = {
        id: pageName,
        title: getTabTitle(hash),
        hash: hash,
        isForm: isFormPage(pageName)
      };
      openTabs.push(tab);
    }
  } else {
    tab.hash = hash;
  }
  
  renderTabsBar();
  showTabContent(pageName, hash);
}

function getInitFuncName(pageName) {
  const parts = pageName.split('-');
  const camelCased = parts.map((part) => {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
  return `init${camelCased}`;
}

async function renderDashboard() {
  // Load stats
  const [taller, traer, llevar, gastos] = await Promise.all([
    api('/servicios/taller').then(r => r ? r.length : 0),
    api('/servicios/traer').then(r => r ? r.length : 0),
    api('/servicios/llevar').then(r => r ? r.length : 0),
    api('/gastos/hoy/total').then(r => r ? r.total : 0)
  ]);
  
  const elTaller = document.getElementById('stat-taller');
  if (elTaller) elTaller.innerText = taller;
  const elTraer = document.getElementById('stat-traer');
  if (elTraer) elTraer.innerText = traer;
  const elLlevar = document.getElementById('stat-llevar');
  if (elLlevar) elLlevar.innerText = llevar;
  const elGastos = document.getElementById('stat-gastos');
  if (elGastos) elGastos.innerText = formatCurrency(gastos);
}

async function showTabContent(pageName, hash) {
  const app = document.getElementById('app');
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  
  let contentEl = app.querySelector(`.tab-content[data-page="${pageName}"]`);
  if (!contentEl) {
    contentEl = document.createElement('div');
    contentEl.className = 'tab-content';
    contentEl.dataset.page = pageName;
    contentEl.dataset.hash = hash;
    app.appendChild(contentEl);
    
    if (pageName === 'panel') {
      const tpl = document.getElementById('tpl-dashboard');
      contentEl.innerHTML = tpl.innerHTML;
      await renderDashboard();
    } else {
      try {
        const res = await fetch(`pages/${pageName}.html`);
        if (!res.ok) throw new Error('Page not found');
        const html = await res.text();
        contentEl.innerHTML = html;
        
        const scriptSrc = `js/${pageName}.js`;
        let script = document.querySelector(`script[src="${scriptSrc}"]`);
        const initFnName = getInitFuncName(pageName);
        
        if (!script) {
          script = document.createElement('script');
          script.src = scriptSrc;
          script.onload = () => {
            if (window[initFnName]) {
              window[initFnName]();
            } else {
              const fallbackName = `init_${pageName.replace('-', '_')}`;
              if (window[fallbackName]) window[fallbackName]();
            }
          };
          document.body.appendChild(script);
        } else {
          if (window[initFnName]) {
            window[initFnName]();
          } else {
            const fallbackName = `init_${pageName.replace('-', '_')}`;
            if (window[fallbackName]) window[fallbackName]();
          }
        }
      } catch (e) {
        console.error(e);
        contentEl.innerHTML = `<h2>Error loading page ${pageName}</h2>`;
      }
    }
  } else {
    contentEl.dataset.hash = hash;
    const initFnName = getInitFuncName(pageName);
    if (window[initFnName]) {
      window[initFnName]();
    } else {
      const fallbackName = `init_${pageName.replace('-', '_')}`;
      if (window[fallbackName]) window[fallbackName]();
    }
  }
  
  contentEl.classList.add('active');
}

// Clock
setInterval(() => {
  const d = new Date();
  document.getElementById('status-time').innerText = d.toLocaleString('es-AR');
}, 1000);

// Active datasheet reference for Ctrl+B search
let activeDatasheet = null;

// Access Find & Replace Dialog Implementation
function initFindDialog() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B' || e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      openFindDialog();
    }
  });
}

function openFindDialog() {
  let dialog = document.getElementById('access-find-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'access-find-dialog';
    dialog.className = 'access-find-dialog';
    dialog.innerHTML = `
      <div class="access-find-header" id="access-find-header">
        <span>Buscar y reemplazar</span>
        <span class="access-find-close" id="access-find-close">×</span>
      </div>
      <div class="access-find-tabs">
        <div class="access-find-tab active">Buscar</div>
        <div class="access-find-tab" style="color: #888; cursor: default;">Reemplazar</div>
      </div>
      <div class="access-find-body">
        <div class="access-find-fields-column">
          <div class="access-find-row">
            <label for="find-text">Buscar:</label>
            <input type="text" id="find-text" class="access-find-input">
          </div>
          <div class="access-find-row" style="margin-top: 8px;">
            <label for="find-lookin">Buscar en:</label>
            <select id="find-lookin" class="access-find-select">
              <option value="all">Documento actual</option>
            </select>
          </div>
          <div class="access-find-row" style="margin-top: 8px;">
            <label for="find-match">Coincidir:</label>
            <select id="find-match" class="access-find-select">
              <option value="any">Cualquier parte del campo</option>
              <option value="whole">Hacer coincidir todo el campo</option>
              <option value="start">Comienzo del campo</option>
            </select>
          </div>
        </div>
        <div class="access-find-buttons-column">
          <button class="access-find-btn" id="find-next-btn">Buscar siguiente</button>
          <button class="access-find-btn" id="find-cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelector('#access-find-close').addEventListener('click', closeFindDialog);
    dialog.querySelector('#find-cancel-btn').addEventListener('click', closeFindDialog);

    const header = dialog.querySelector('#access-find-header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.className === 'access-find-close') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = dialog.offsetLeft;
      initialTop = dialog.offsetTop;
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    });

    function onDrag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      dialog.style.left = `${initialLeft + dx}px`;
      dialog.style.top = `${initialTop + dy}px`;
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    }

    dialog.querySelector('#find-next-btn').addEventListener('click', performSearch);
    
    dialog.querySelector('#find-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  dialog.style.display = 'block';
  const input = dialog.querySelector('#find-text');
  input.focus();
  input.select();
}

function closeFindDialog() {
  const dialog = document.getElementById('access-find-dialog');
  if (dialog) dialog.style.display = 'none';
}

function performSearch() {
  if (!activeDatasheet) {
    showAccessMessageBox('No hay una hoja de datos activa o no contiene registros.');
    return;
  }
  if (activeDatasheet.customSearch) {
    activeDatasheet.customSearch();
    return;
  }
  if (!activeDatasheet.rows || activeDatasheet.rows.length === 0) {
    showAccessMessageBox('No hay una hoja de datos activa o no contiene registros.');
    return;
  }

  const findText = document.getElementById('find-text').value.toLowerCase().trim();
  if (!findText) return;

  const matchType = document.getElementById('find-match').value;
  const rows = activeDatasheet.rows;
  const columns = activeDatasheet.columns;
  const currentIdx = activeDatasheet.selectedRowIdx;

  let found = false;
  for (let i = 1; i <= rows.length; i++) {
    const checkIdx = (currentIdx + i) % rows.length;
    const row = rows[checkIdx];

    for (const col of columns) {
      if (col.format === 'checkbox') continue;
      let val = row[col.field];
      if (val === null || val === undefined) continue;
      
      const valStr = String(val).toLowerCase();
      
      if (matchType === 'any' && valStr.includes(findText)) {
        activeDatasheet.selectedRowIdx = checkIdx;
        found = true;
        break;
      } else if (matchType === 'whole' && valStr === findText) {
        activeDatasheet.selectedRowIdx = checkIdx;
        found = true;
        break;
      } else if (matchType === 'start' && valStr.startsWith(findText)) {
        activeDatasheet.selectedRowIdx = checkIdx;
        found = true;
        break;
      }
    }

    if (found) break;
  }

  if (!found) {
    showAccessMessageBox('Microsoft Access finalizó la búsqueda de los registros. No se encontró el elemento buscado.');
  }
}

function showAccessMessageBox(message) {
  let msgBox = document.getElementById('access-message-box');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'access-message-box';
    msgBox.className = 'access-message-box';
    document.body.appendChild(msgBox);
  }

  msgBox.innerHTML = `
    <div class="access-message-header">
      <span>Microsoft Access</span>
      <span style="cursor: pointer;" onclick="document.getElementById('access-message-box').style.display='none'">×</span>
    </div>
    <div class="access-message-body">
      <div class="access-message-icon">⚠️</div>
      <div class="access-message-text">${message}</div>
    </div>
    <div class="access-message-buttons">
      <button class="access-find-btn" style="width: 70px;" onclick="document.getElementById('access-message-box').style.display='none'">Aceptar</button>
    </div>
  `;
  msgBox.style.display = 'block';
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  router();
  initFindDialog();
});
