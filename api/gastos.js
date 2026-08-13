const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const TABLE = 'gastos_repuestos';

router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { fecha_desde, fecha_hasta } = req.query;

    let query = `SELECT * FROM ${TABLE}`;
    let countQuery = `SELECT COUNT(*) as total FROM ${TABLE}`;
    const params = [];
    let conditions = [];

    if (fecha_desde) {
        conditions.push(`parse_access_date(fecha) >= ?`);
        params.push(fecha_desde);
    }
    if (fecha_hasta) {
        conditions.push(`parse_access_date(fecha) <= ?`);
        params.push(fecha_hasta);
    }

    if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;

    const total = db.prepare(countQuery).get(...params).total;
    const data = db.prepare(query).all(...params, limit, offset);
    res.json({ data, total, page, limit });
});

const todayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

router.get('/hoy', (req, res) => {
    const data = db.prepare(`SELECT * FROM ${TABLE} WHERE parse_access_date(fecha) = ?`).all(todayDate());
    res.json(data);
});

router.get('/hoy/total', (req, res) => {
    const row = db.prepare(`SELECT COALESCE(SUM(parcial), 0) as total FROM ${TABLE} WHERE parse_access_date(fecha) = ?`).get(todayDate());
    res.json(row);
});

router.get('/gastos-mes', (req, res) => {
    const data = db.prepare(`SELECT * FROM ${TABLE} WHERE strftime('%Y-%m', parse_access_date(fecha)) = '2024-02' ORDER BY parse_access_date(fecha) ASC, id ASC`).all();
    res.json(data);
});

router.get('/meta/options', (req, res) => {
    const proveedors = db.prepare(`SELECT DISTINCT proveedor FROM ${TABLE} WHERE proveedor IS NOT NULL AND proveedor != '' ORDER BY proveedor ASC`).all().map(r => r.proveedor);
    const rubros = db.prepare(`SELECT DISTINCT rubro FROM ${TABLE} WHERE rubro IS NOT NULL AND rubro != '' ORDER BY rubro ASC`).all().map(r => r.rubro);
    res.json({ proveedors, rubros });
});

router.get('/navegar/total', (req, res) => {
    const row = db.prepare(`SELECT COUNT(*) as total FROM ${TABLE}`).get();
    res.json(row);
});

router.get('/navegar/record', (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const row = db.prepare(`SELECT * FROM ${TABLE} ORDER BY id ASC LIMIT 1 OFFSET ?`).get(offset);
    if (!row) return res.status(404).json({ error: 'No record at offset' });
    res.json(row);
});

router.get('/navegar/buscar', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    const match = req.query.match || 'any';
    const currentOffset = parseInt(req.query.offset) || 0;
    
    const rows = db.prepare(`SELECT id FROM ${TABLE} ORDER BY id ASC`).all();
    let foundOffset = -1;
    for (let i = 1; i <= rows.length; i++) {
        const idx = (currentOffset + i) % rows.length;
        const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(rows[idx].id);
        if (!row) continue;
        
        const fields = ['fecha', 'proveedor', 'descripcion', 'rubro'];
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
        const record = db.prepare(`SELECT * FROM ${TABLE} ORDER BY id ASC LIMIT 1 OFFSET ?`).get(foundOffset);
        res.json({ offset: foundOffset, record });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

router.get('/mes', (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.json([]);
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const data = db.prepare(`SELECT * FROM ${TABLE} WHERE strftime('%Y-%m', parse_access_date(fecha)) = ?`).all(yearMonth);
    res.json(data);
});

router.get('/mes/rubros', (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.json([]);
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const data = db.prepare(`SELECT rubro, SUM(parcial) as total FROM ${TABLE} WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND econoservice = 1 GROUP BY rubro`).all(yearMonth);
    res.json(data);
});

router.get('/mes/total', (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.json({ total: 0 });
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const row = db.prepare(`SELECT COALESCE(SUM(parcial), 0) as total FROM ${TABLE} WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND econoservice = 1`).get(yearMonth);
    res.json(row);
});

router.get('/:id', (req, res) => {
    const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO ${TABLE} (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE ${TABLE} SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
