const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
    const data = db.prepare(`SELECT * FROM placas_blue_amarilla`).all();
    res.json(data);
});

router.get('/:id', (req, res) => {
    const data = db.prepare(`SELECT * FROM placas_blue_amarilla WHERE id = ?`).get(req.params.id);
    res.json(data);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO placas_blue_amarilla (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE placas_blue_amarilla SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM placas_blue_amarilla WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
