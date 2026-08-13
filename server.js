const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/clientes', require('./api/clientes'));
app.use('/api/servicios', require('./api/servicios'));
app.use('/api/gastos', require('./api/gastos'));
app.use('/api/ministerio', require('./api/ministerio'));
app.use('/api/colaboradores', require('./api/colaboradores'));
app.use('/api/misiones', require('./api/misiones'));
app.use('/api/repuestos', require('./api/repuestos'));
app.use('/api/placas', require('./api/placas'));
app.use('/api/caja', require('./api/caja'));

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        const open = (await import('open')).default;
        open(`http://localhost:${PORT}`);
    } catch (e) {
        // Ignore if open is not installed
        console.log('Open browser skipped');
    }
});
