async function initFormulario6() {
    // Dropdown change listener
    const monthSelect = document.getElementById('f6-month');
    monthSelect.onchange = () => loadFormulario6Data();
    
    // Live calculation listeners for "la diaria"
    const diariaInputs = ['f6-c-arranque', 'f6-recaud', 'f6-gasto-hoy'];
    diariaInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateDiariaTotal);
        }
    });
    
    // Action button bindings
    document.getElementById('f6-btn-ministerio').onclick = () => {
        window.location.hash = '#ministerio';
    };
    
    document.getElementById('f6-btn-gastos-mes').onclick = () => {
        window.location.hash = '#gastos-mes';
    };
    
    // Initial load
    await loadFormulario6Data();
    
    // Register activeDatasheet block for Ctrl+B
    activeDatasheet = {
        customSearch: () => {
            showAccessMessageBox('Las búsquedas no están disponibles en la vista de Resumen Financiero.');
        }
    };
}

async function loadFormulario6Data() {
    const monthVal = document.getElementById('f6-month').value;
    
    try {
        // Query the custom endpoint
        const res = await api(`/caja/resumen-formulario6?ym=${monthVal}`);
        if (res) {
            // Load Left Column
            document.getElementById('f6-joel').value = formatEuro(res.joel);
            document.getElementById('f6-rodri').value = formatEuro(res.rodri);
            document.getElementById('f6-fer').value = formatEuro(res.fer);
            
            // Clear inputs that are blank in screenshot
            document.getElementById('f6-gasto-eco').value = '';
            document.getElementById('f6-util').value = '';
            document.getElementById('f6-util-real').value = '';
            
            // Load Center Column
            document.getElementById('f6-chk-pres-mes-ant').checked = res.prestamo > 0;
            document.getElementById('f6-pres-mes-ant').value = formatCurrency(res.prestamo);
            document.getElementById('f6-producto').value = formatCurrency(res.producto);
            document.getElementById('f6-gasto-mes').value = formatCurrency(res.gastoMes);
            document.getElementById('f6-mano-mes').value = formatEuro(res.manoMes);
            
            // Load Right Column
            document.getElementById('f6-mega').value = formatCurrency(res.mega);
            document.getElementById('f6-nafta').value = formatCurrency(res.nafta);
            document.getElementById('f6-sal').value = formatCurrency(res.sal);
            document.getElementById('f6-eco').value = formatCurrency(res.eco);
            document.getElementById('f6-pmi').value = formatCurrency(res.pmi);
            
            // Default "la diaria" fields as empty just like screenshot
            document.getElementById('f6-c-arranque').value = '';
            document.getElementById('f6-recaud').value = '';
            document.getElementById('f6-gasto-hoy').value = '';
            document.getElementById('f6-total-diario').value = '';
        }
    } catch (e) {
        console.error(e);
    }
}

function calculateDiariaTotal() {
    const cArranque = parseFloat(document.getElementById('f6-c-arranque').value) || 0;
    const recaud = parseFloat(document.getElementById('f6-recaud').value) || 0;
    const gastoHoy = parseFloat(document.getElementById('f6-gasto-hoy').value) || 0;
    
    const total = cArranque + recaud - gastoHoy;
    document.getElementById('f6-total-diario').value = formatCurrency(total);
}

// Custom currency formatting helper to render Euro symbols like in Access
function formatEuro(num) {
    if (num === null || num === undefined) return '0,00 €';
    const formatted = new Intl.NumberFormat('es-AR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(num);
    return `${formatted} €`;
}
