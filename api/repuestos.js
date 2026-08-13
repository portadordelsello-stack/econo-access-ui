const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
    const data = db.prepare(`SELECT * FROM repuestos_mega`).all();
    res.json(data);
});

router.get('/navegar/total', (req, res) => {
    const row = db.prepare(`SELECT COUNT(*) as total FROM repuestos_mega`).get();
    res.json(row);
});

router.get('/navegar/record', (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const row = db.prepare(`SELECT * FROM repuestos_mega ORDER BY id ASC LIMIT 1 OFFSET ?`).get(offset);
    if (!row) return res.status(404).json({ error: 'No record at offset' });
    res.json(row);
});

router.get('/navegar/buscar', (req, res) => {
    const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
    const match = req.query.match || 'any';
    const currentOffset = parseInt(req.query.offset) || 0;
    
    const targetId = parseInt(q);
    if (!isNaN(targetId) && /^\d+$/.test(q)) {
        const rows = db.prepare(`SELECT id FROM repuestos_mega ORDER BY id ASC`).all();
        const foundIdx = rows.findIndex(r => r.id === targetId);
        if (foundIdx !== -1) {
            const record = db.prepare(`SELECT * FROM repuestos_mega WHERE id = ?`).get(targetId);
            return res.json({ offset: foundIdx, record });
        }
    }

    const rows = db.prepare(`SELECT id FROM repuestos_mega ORDER BY id ASC`).all();
    let foundOffset = -1;
    for (let i = 1; i <= rows.length; i++) {
        const idx = (currentOffset + i) % rows.length;
        const row = db.prepare(`SELECT * FROM repuestos_mega WHERE id = ?`).get(rows[idx].id);
        if (!row) continue;
        
        const fields = ['id', 'fecha', 'repuesto_denominacion', 'codigo_repuesto', 'codigo_proveedor'];
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
        const record = db.prepare(`SELECT * FROM repuestos_mega ORDER BY id ASC LIMIT 1 OFFSET ?`).get(foundOffset);
        res.json({ offset: foundOffset, record });
    } else {
        res.status(404).json({ error: 'No matches found' });
    }
});

router.get('/:id', (req, res) => {
    const data = db.prepare(`SELECT * FROM repuestos_mega WHERE id = ?`).get(req.params.id);
    res.json(data);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO repuestos_mega (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE repuestos_mega SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM repuestos_mega WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
