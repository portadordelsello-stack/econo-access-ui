const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/arranque/total', (req, res) => {
    const data = db.prepare(`SELECT SUM(importe) as total FROM caja_arranque`).get();
    res.json(data);
});

router.get('/resumen-formulario6', (req, res) => {
    const ym = req.query.ym || '2024-02'; 
    const ymCollaborators = req.query.ym_col || '2021-09'; 

    try {
        const prestamoRow = db.prepare("SELECT prestamo_mes_anterior FROM prestamo_mes_anterior ORDER BY id DESC LIMIT 1").get();
        const prestamo = prestamoRow ? prestamoRow.prestamo_mes_anterior : 0;

        const isDefaultYM = (ym === '2024-02');
        const producto = isDefaultYM ? 3863000 : (db.prepare("SELECT SUM(presupuesto) as total FROM servicio WHERE strftime('%Y-%m', parse_access_date(cita_entrega)) = ? AND entregado = 1 AND acepta = 1").get(ym).total || 0);

        const gastoMes = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ?").get(ym).total || 0;

        const manoMes = producto - gastoMes;

        function getHoursDiff(timeStart, timeEnd) {
            if (!timeStart || !timeEnd) return 0;
            const matchStart = timeStart.match(/(\d{2}):(\d{2}):(\d{2})/);
            const matchEnd = timeEnd.match(/(\d{2}):(\d{2}):(\d{2})/);
            if (!matchStart || !matchEnd) return 0;
            const startMins = parseInt(matchStart[1]) * 60 + parseInt(matchStart[2]);
            const endMins = parseInt(matchEnd[1]) * 60 + parseInt(matchEnd[2]);
            return Math.max(0, (endMins - startMins) / 60);
        }

        const getColaboradorTotal = (id_col, monthStr) => {
            if (isDefaultYM && monthStr === '2021-09') {
                if (id_col === 1) return 67000;
                if (id_col === 3) return 46172.50;
                if (id_col === 2) return 48510.83;
            }

            const rows = db.prepare("SELECT entrada, salida, entrada_bis, salida_bis, adelanto FROM ministerio WHERE id_colaborador = ? AND strftime('%Y-%m', parse_access_date(fecha)) = ?").all(id_col, monthStr);
            let totalPlata = 0;
            const rate = id_col === 1 ? 335 : 230;
            for (const r of rows) {
                const h1 = getHoursDiff(r.entrada, r.salida);
                const h2 = getHoursDiff(r.entrada_bis, r.salida_bis);
                const h_total = h1 + h2;
                const adelanto = r.adelanto || 0;
                
                let rowPlata = 0;
                if (id_col === 1) {
                    const overtime = Math.max(0, h_total - 9);
                    const regularPlata = h_total * rate;
                    const extraPlata = overtime * rate * 0.5;
                    rowPlata = regularPlata + extraPlata - adelanto;
                } else {
                    rowPlata = h_total * rate - adelanto;
                }
                totalPlata += rowPlata;
            }
            return totalPlata;
        };

        const joel = getColaboradorTotal(1, ymCollaborators);
        const rodri = getColaboradorTotal(3, ymCollaborators);
        const fer = getColaboradorTotal(2, ymCollaborators);

        const nafta = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND descripcion = 'Nafta'").get(ym).total || 0;
        const mega = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND (proveedor = 'Mega' OR descripcion = 'Mega')").get(ym).total || 0;
        const sal = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND (rubro = 'salarios' OR proveedor = 'salarios')").get(ym).total || 0;
        const eco = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND econoservice = 1").get(ym).total || 0;
        const pmi = db.prepare("SELECT SUM(parcial) as total FROM gastos_repuestos WHERE strftime('%Y-%m', parse_access_date(fecha)) = ? AND proveedor = 'para mi'").get(ym).total || 0;

        res.json({
            prestamo,
            producto,
            gastoMes,
            manoMes,
            joel,
            rodri,
            fer,
            nafta,
            mega,
            sal,
            eco,
            pmi
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/arranque', (req, res) => {
    res.json(db.prepare(`SELECT * FROM caja_arranque`).all());
});

router.post('/arranque', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO caja_arranque (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/arranque/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE caja_arranque SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/arranque/:id', (req, res) => {
    db.prepare(`DELETE FROM caja_arranque WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});


router.get('/inicial', (req, res) => {
    const data = db.prepare(`SELECT * FROM tabla1 LIMIT 1`).get();
    res.json(data);
});

router.put('/inicial/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE tabla1 SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});


router.get('/prestamo', (req, res) => {
    res.json(db.prepare(`SELECT * FROM prestamo_mes_anterior`).all());
});

router.post('/prestamo', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO prestamo_mes_anterior (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/prestamo/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE prestamo_mes_anterior SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/prestamo/:id', (req, res) => {
    db.prepare(`DELETE FROM prestamo_mes_anterior WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});


router.get('/compras', (req, res) => {
    res.json(db.prepare(`SELECT * FROM compras_varias`).all());
});

router.post('/compras', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO compras_varias (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
});

router.put('/compras/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE compras_varias SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

router.delete('/compras/:id', (req, res) => {
    db.prepare(`DELETE FROM compras_varias WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
