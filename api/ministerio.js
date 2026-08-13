const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
    const { desde, hasta, colaboradorId } = req.query;
    let table = 'ministerio';
    const conditions = [];
    const params = [];

    if (colaboradorId === 'diego') {
        table = 'ministerio_diego';
    } else if (colaboradorId) {
        conditions.push(`id_colaborador = ?`);
        params.push(colaboradorId);
    }

    let query = `SELECT * FROM ${table}`;
    if (desde) { conditions.push(`parse_access_date(fecha) >= ?`); params.push(desde); }
    if (hasta) { conditions.push(`parse_access_date(fecha) <= ?`); params.push(hasta); }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY id_ministerio DESC`;

    try {
        const data = db.prepare(query).all(...params);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/horas/:colaboradorId', (req, res) => {
    const { desde, hasta } = req.query;
    const { colaboradorId } = req.params;

    let table = 'ministerio';
    let query = '';
    const params = [];
    if (colaboradorId === 'diego') {
        table = 'ministerio_diego';
        query = `SELECT * FROM ${table} WHERE 1=1`;
    } else {
        query = `SELECT * FROM ${table} WHERE id_colaborador = ?`;
        params.push(colaboradorId);
    }

    if (desde) { query += ` AND parse_access_date(fecha) >= ?`; params.push(desde); }
    if (hasta) { query += ` AND parse_access_date(fecha) <= ?`; params.push(hasta); }

    try {
        const registros = db.prepare(query).all(...params);

        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.split(' ');
            const t = parts.length > 1 ? parts[1] : parts[0];
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        let totalHoras = 0;
        let totalAdelantos = 0;
        let netTotal = 0;

        registros.forEach(r => {
            const min1 = r.salida && r.entrada ? (parseTime(r.salida) - parseTime(r.entrada)) : 0;
            const min2 = r.salida_bis && r.entrada_bis ? (parseTime(r.salida_bis) - parseTime(r.entrada_bis)) : 0;
            const horas_hoy = (min1 + min2) / 60;

            let rate = horas_hoy * 335;
            let overtime_rate = 0;
            if (horas_hoy > 9) {
                const overtime = horas_hoy - 9;
                rate = 9 * 335;
                overtime_rate = overtime * 335 * 1.5;
            }

            const adelanto = parseFloat(r.adelanto) || 0;
            totalHoras += horas_hoy;
            totalAdelantos += adelanto;
            netTotal += (rate + overtime_rate - adelanto);
        });

        res.json({
            registros: registros.length,
            totalHoras: Math.round(totalHoras * 100) / 100,
            totalAdelantos,
            netTotal: Math.round(netTotal * 100) / 100
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    const { id_colaborador } = req.body;
    const table = id_colaborador === 'diego' ? 'ministerio_diego' : 'ministerio';
    
    // Remove id_colaborador if it is Diego to match DB schema
    const bodyCopy = { ...req.body };
    if (id_colaborador === 'diego') {
        delete bodyCopy.id_colaborador;
    }

    const fields = Object.keys(bodyCopy);
    const values = Object.values(bodyCopy);
    const placeholders = fields.map(() => '?').join(', ');
    
    try {
        const info = db.prepare(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
        res.status(201).json({ id_ministerio: info.lastInsertRowid, ...bodyCopy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    const { id_colaborador } = req.body;
    const table = id_colaborador === 'diego' ? 'ministerio_diego' : 'ministerio';

    const bodyCopy = { ...req.body };
    if (id_colaborador === 'diego') {
        delete bodyCopy.id_colaborador;
    }

    const fields = Object.keys(bodyCopy);
    const values = Object.values(bodyCopy);
    const setClause = fields.map(f => `${f} = ?`).join(', ');

    try {
        db.prepare(`UPDATE ${table} SET ${setClause} WHERE id_ministerio = ?`).run(...values, req.params.id);
        res.json({ id_ministerio: req.params.id, ...bodyCopy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    // We check both tables to delete
    try {
        db.prepare(`DELETE FROM ministerio WHERE id_ministerio = ?`).run(req.params.id);
        db.prepare(`DELETE FROM ministerio_diego WHERE id_ministerio = ?`).run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
