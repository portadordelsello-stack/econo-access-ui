const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
    const data = db.prepare(`SELECT * FROM colaboradores`).all();
    res.json(data);
});

router.get('/:id', (req, res) => {
    const data = db.prepare(`SELECT * FROM colaboradores WHERE id_colaborador = ?`).get(req.params.id);
    res.json(data);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO colaboradores (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id_colaborador: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE colaboradores SET ${setClause} WHERE id_colaborador = ?`).run(...values, req.params.id);
    res.json({ id_colaborador: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM colaboradores WHERE id_colaborador = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
