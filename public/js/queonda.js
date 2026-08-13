// queonda.js — Formulario de ficha individual, estilo Access
// Replica la vista "queonda" del formulario original de Access

let qoTotalRecords = 0;
let qoCurrentOffset = 0;
let qoCurrentRecord = null;
let qoSaveTimer = null;

function parseAccessDate(str) {
    if (!str) return null;
    // Format: "MM/DD/YY HH:MM:SS" or "MM/DD/YYYY HH:MM:SS"
    try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
    } catch (e) {}
    return null;
}

function formatAccessDate(str) {
    const d = parseAccessDate(str);
    if (!d) return '';
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

async function initQueonda() {
    // Set up activeDatasheet with customSearch for Ctrl+B
    activeDatasheet = {
        rows: [],
        columns: [],
        get selectedRowIdx() { return qoCurrentOffset; },
        set selectedRowIdx(val) {
            qoCurrentOffset = val;
        },
        customSearch: async () => {
            const q = (document.getElementById('find-text')?.value || '').trim();
            const match = document.getElementById('find-match')?.value || 'any';
            if (!q) return;
            const result = await api(`/servicios/queonda/buscar?q=${encodeURIComponent(q)}&match=${match}&offset=${qoCurrentOffset}`);
            if (result && result.record) {
                qoCurrentOffset = result.offset;
                qoCurrentRecord = result.record;
                renderQueondaRecord(result.record);
                updateQueondaNav();
                closeFindDialog();
            } else {
                showAccessMessageBox('Microsoft Access finalizó la búsqueda de los registros. No se encontró el elemento buscado.');
            }
        }
    };

    // Load total
    const totalRes = await api('/servicios/queonda/total');
    if (totalRes) {
        qoTotalRecords = totalRes.total;
        document.getElementById('qo-nav-total').textContent = `de ${qoTotalRecords}`;
    }

    // Load first record
    await loadQueondaRecord(0);
    bindQueondaControls();
}

async function loadQueondaRecord(offset) {
    if (offset < 0) offset = 0;
    if (offset >= qoTotalRecords) offset = qoTotalRecords - 1;
    qoCurrentOffset = offset;
    const record = await api(`/servicios/queonda/record?offset=${offset}`);
    if (record) {
        qoCurrentRecord = record;
        renderQueondaRecord(record);
        updateQueondaNav();
    }
}

function renderQueondaRecord(r) {
    if (!r) return;

    // ID Badge
    document.getElementById('qo-id-servicio').value = r.id_servicio || '';
    document.getElementById('qo-id-badge').textContent = r.id_servicio || '';

    // Address
    document.getElementById('qo-calle').value = r.calle || '';
    document.getElementById('qo-numero-dir').value = r.numero_direccion || '';
    document.getElementById('qo-depto').value = r.depto || '';
    document.getElementById('qo-piso').value = r.piso || '';
    document.getElementById('qo-aparato').value = r.aparato || '';
    document.getElementById('qo-tecnico').value = r.tecnico || '';
    document.getElementById('qo-marca-modelo').value = r.marca_modelo || '';

    // Dates
    document.getElementById('qo-fecha-taller').value = formatAccessDate(r.fecha);
    document.getElementById('qo-cita-entrega').value = formatAccessDate(r.cita_entrega);

    // Checkboxes
    document.getElementById('qo-ingreso-taller').checked = !!r.ingreso_taller;
    document.getElementById('qo-espera').checked = !!r.llamar;
    document.getElementById('qo-rechaza').checked = !!r.rechaza_devolver;
    document.getElementById('qo-acepta').checked = !!r.acepta;
    document.getElementById('qo-jo').checked = !!r.jo;
    document.getElementById('qo-terminado').checked = !!r.terminado;
    document.getElementById('qo-pasa-stock').checked = !!r.pasa_a_stock;
    document.getElementById('qo-entregado').checked = !!r.entregado;

    // Comments
    document.getElementById('qo-desperfecto-usuario').value = r.desperfecto_usuario || '';
    document.getElementById('qo-resena-interna').value = r.resena_interna_servicios || '';
    document.getElementById('qo-servicios-convenidos').value = r.servicios_convenidos || '';
}

function updateQueondaNav() {
    document.getElementById('qo-nav-input').value = qoCurrentOffset + 1;
    document.getElementById('qo-nav-total').textContent = `de ${qoTotalRecords}`;
}

function bindQueondaControls() {
    // Navigation buttons
    document.getElementById('qo-btn-first').addEventListener('click', () => loadQueondaRecord(0));
    document.getElementById('qo-btn-prev').addEventListener('click', () => loadQueondaRecord(qoCurrentOffset - 1));
    document.getElementById('qo-btn-next').addEventListener('click', () => loadQueondaRecord(qoCurrentOffset + 1));
    document.getElementById('qo-btn-last').addEventListener('click', () => loadQueondaRecord(qoTotalRecords - 1));

    // Nav input jump
    document.getElementById('qo-nav-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const n = parseInt(e.target.value);
            if (!isNaN(n)) loadQueondaRecord(n - 1);
        }
    });

    // Buscar button
    document.getElementById('qo-nav-search-btn').addEventListener('click', () => {
        openFindDialog();
    });

    // Auto-save on checkbox change
    const checkboxFields = [
        { id: 'qo-ingreso-taller', field: 'ingreso_taller' },
        { id: 'qo-espera',         field: 'llamar' },
        { id: 'qo-rechaza',        field: 'rechaza_devolver' },
        { id: 'qo-acepta',         field: 'acepta' },
        { id: 'qo-jo',             field: 'jo' },
        { id: 'qo-terminado',      field: 'terminado' },
        { id: 'qo-pasa-stock',     field: 'pasa_a_stock' },
        { id: 'qo-entregado',      field: 'entregado' },
    ];

    checkboxFields.forEach(({ id, field }) => {
        document.getElementById(id).addEventListener('change', (e) => {
            debouncedSave({ [field]: e.target.checked ? 1 : 0 });
        });
    });

    // Auto-save on textarea blur
    const textareaFields = [
        { id: 'qo-desperfecto-usuario',  field: 'desperfecto_usuario' },
        { id: 'qo-resena-interna',        field: 'resena_interna_servicios' },
        { id: 'qo-servicios-convenidos',  field: 'servicios_convenidos' },
        { id: 'qo-calle',                 field: 'calle', table: 'clientes' },
        { id: 'qo-numero-dir',            field: 'numero_direccion', table: 'clientes' },
        { id: 'qo-aparato',               field: 'aparato' },
        { id: 'qo-tecnico',               field: 'tecnico' },
        { id: 'qo-marca-modelo',          field: 'marca_modelo' },
    ];

    textareaFields.forEach(({ id, field }) => {
        const el = document.getElementById(id);
        el.addEventListener('blur', (e) => {
            debouncedSave({ [field]: e.target.value });
        });
    });
}

function debouncedSave(payload) {
    if (!qoCurrentRecord) return;
    clearTimeout(qoSaveTimer);
    qoSaveTimer = setTimeout(() => {
        saveQueondaRecord(payload);
    }, 400);
}

async function saveQueondaRecord(payload) {
    if (!qoCurrentRecord) return;
    try {
        await api(`/servicios/${qoCurrentRecord.id_servicio}`, {
            method: 'PUT',
            body: payload
        });
        // Update local cache
        Object.assign(qoCurrentRecord, payload);
    } catch (e) {
        console.error('Error saving:', e);
        showNotification('Error al guardar cambios', 'error');
    }
}
