const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/clientes - List with pagination and search
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.q || '';

    let query = `SELECT * FROM clientes`;
    let countQuery = `SELECT COUNT(*) as total FROM clientes`;
    const params = [];

    if (search) {
        query += ` WHERE nombre_apellido LIKE ? OR calle LIKE ? OR numero_direccion LIKE ?`;
        countQuery += ` WHERE nombre_apellido LIKE ? OR calle LIKE ? OR numero_direccion LIKE ?`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    query += ` LIMIT ? OFFSET ?`;
    
    try {
        const total = db.prepare(countQuery).get(...params).total;
        const clientes = db.prepare(query).all(...params, limit, offset);
        res.json({ data: clientes, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/navegar/total', (req, res) => {
    try {
        const row = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/navegar/record', (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    try {
        const row = db.prepare('SELECT * FROM clientes ORDER BY id_cliente ASC LIMIT 1 OFFSET ?').get(offset);
        if (!row) return res.status(404).json({ error: 'No record at offset' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/navegar/buscar', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    const match = req.query.match || 'any';
    const currentOffset = parseInt(req.query.offset) || 0;
    
    try {
        const rows = db.prepare('SELECT id_cliente FROM clientes ORDER BY id_cliente ASC').all();
        let foundOffset = -1;
        for (let i = 1; i <= rows.length; i++) {
            const idx = (currentOffset + i) % rows.length;
            const row = db.prepare('SELECT * FROM clientes WHERE id_cliente = ?').get(rows[idx].id_cliente);
            if (!row) continue;
            
            const fields = ['nombre_apellido', 'calle', 'numero_direccion', 'barrio', 'localidad'];
            let matches = false;
            for (const f of fields) {
                const val = row[f];
                if (val === null || val === undefined) continue;
                const valStr = String(val).toLowerCase();
                if (match === 'any' && valStr.includes(q)) matches = true;
                else if (match === 'whole' && valStr === q) matches = true;
                else if (match === 'start' && valStr.startsWith(q)) matches = true;
                
                if (matches) break;
            }
            
            if (matches) {
                foundOffset = idx;
                break;
            }
        }
        
        if (foundOffset !== -1) {
            const record = db.prepare('SELECT * FROM clientes ORDER BY id_cliente ASC LIMIT 1 OFFSET ?').get(foundOffset);
            res.json({ offset: foundOffset, record });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/clientes/:id
router.get('/:id', (req, res) => {
    try {
        const cliente = db.prepare(`SELECT * FROM clientes WHERE id_cliente = ?`).get(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Not found' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/clientes/:id/servicios
router.get('/:id/servicios', (req, res) => {
    try {
        const servicios = db.prepare(`SELECT s.* FROM servicio s WHERE s.id_cliente = ?`).all(req.params.id);
        res.json(servicios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/clientes
router.post('/', (req, res) => {
    try {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        const placeholders = fields.map(() => '?').join(', ');
        
        const stmt = db.prepare(`INSERT INTO clientes (${fields.join(', ')}) VALUES (${placeholders})`);
        const info = stmt.run(values);
        res.status(201).json({ id_cliente: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/clientes/:id
router.put('/:id', (req, res) => {
    try {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        
        const stmt = db.prepare(`UPDATE clientes SET ${setClause} WHERE id_cliente = ?`);
        stmt.run(...values, req.params.id);
        res.json({ id_cliente: req.params.id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/clientes/:id
router.delete('/:id', (req, res) => {
    try {
        db.prepare(`DELETE FROM clientes WHERE id_cliente = ?`).run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
