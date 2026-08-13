const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/pendientes', (req, res) => {
    const data = db.prepare(`SELECT * FROM misiones WHERE realizado = 0`).all();
    res.json(data);
});

router.get('/', (req, res) => {
    const data = db.prepare(`SELECT * FROM misiones`).all();
    res.json(data);
});

router.get('/:id', (req, res) => {
    const data = db.prepare(`SELECT * FROM misiones WHERE id_mision = ?`).get(req.params.id);
    res.json(data);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO misiones (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id_mision: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE misiones SET ${setClause} WHERE id_mision = ?`).run(...values, req.params.id);
    res.json({ id_mision: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM misiones WHERE id_mision = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
