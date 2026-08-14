const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const todayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const tomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const yesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getBusinessQuery = (condition, orderBy = 's.fecha DESC', joinExtras = '') => {
    return `
        SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido
        FROM servicio s
        JOIN clientes c ON s.id_cliente = c.id_cliente
        ${joinExtras}
        WHERE ${condition}
        ORDER BY ${orderBy}
    `;
};

router.get('/taller', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0`);
    res.json(db.prepare(query).all());
});

router.get('/taller/lavarropas', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0 AND s.aparato = 'Lavarropas' AND s.rechaza_devolver = 0 AND s.para_cristian = 0 AND s.jo = 0`);
    res.json(db.prepare(query).all());
});

router.get('/taller/secarropas', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0 AND s.aparato = 'Secarropas Centrifugo'`);
    res.json(db.prepare(query).all());
});

router.get('/taller/lavavajillas', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0 AND s.aparato = 'Lavavajillas'`);
    res.json(db.prepare(query).all());
});

router.get('/taller/ventiladores', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0 AND s.aparato = 'Ventilador'`);
    res.json(db.prepare(query).all());
});

router.get('/taller-espera', (req, res) => {
    const query = getBusinessQuery(`s.llamar = 1 AND s.acepta = 0 AND s.ingreso_taller = 1 AND s.pasa_a_stock = 0 AND s.rechaza_devolver = 0 AND s.entregado = 0`);
    res.json(db.prepare(query).all());
});

router.get('/taller-terminado', (req, res) => {
    const query = getBusinessQuery(`s.acepta = 1 AND s.terminado = 1 AND s.entregado = 0 AND s.pasa_a_stock = 0 AND s.ingreso_taller = 1`);
    res.json(db.prepare(query).all());
});

router.get('/taller-fichar', (req, res) => {
    const query = getBusinessQuery(`s.fichaok = 0 AND (s.ingreso_taller = 1 AND s.acepta = 0 AND s.llamar = 0 AND s.pasa_a_stock = 0 AND s.entregado = 0)`);
    res.json(db.prepare(query).all());
});

router.get('/traer', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 0 AND s.arreglado_en_domicilio = 0 AND s.traer_ver IN ('traer', 'ver') AND parse_access_date(s.cita_dia) <= ? AND s.pasa_a_stock = 0 AND s.rechaza_devolver = 0`);
    res.json(db.prepare(query).all(todayDate()));
});

router.get('/traer-confirmar', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 0 AND s.arreglado_en_domicilio = 0 AND s.traer_ver = 'a confirmar' AND parse_access_date(s.cita_dia) <= ? AND s.pasa_a_stock = 0 AND s.rechaza_devolver = 0`);
    res.json(db.prepare(query).all(todayDate()));
});

router.get('/traer-manana', (req, res) => {
    const query = getBusinessQuery(`parse_access_date(s.cita_dia) = ?`);
    res.json(db.prepare(query).all(tomorrowDate()));
});

router.get('/llevar', (req, res) => {
    const query = getBusinessQuery(`CAST(s.presupuesto AS REAL) > 0 AND s.entregado = 0 AND parse_access_date(s.cita_entrega) <= ? AND s.terminado = 1 AND s.llevar = 1`);
    res.json(db.prepare(query).all(todayDate()));
});

router.get('/llevar-devolucion', (req, res) => {
    const query = getBusinessQuery(`(CAST(s.presupuesto AS REAL) = 0 OR s.presupuesto IS NULL) AND s.entregado = 0 AND parse_access_date(s.cita_entrega) <= ? AND s.terminado = 1 AND s.llevar = 1`);
    res.json(db.prepare(query).all(todayDate()));
});

router.get('/llevar-manana', (req, res) => {
    const query = getBusinessQuery(`parse_access_date(s.cita_entrega) = ? AND s.llevar = 1 AND s.entregado = 0`);
    res.json(db.prepare(query).all(tomorrowDate()));
});

router.get('/llevado-ayer', (req, res) => {
    const query = getBusinessQuery(`s.entregado = 1 AND parse_access_date(s.cita_entrega) = ? AND s.llevar = 1`);
    res.json(db.prepare(query).all(yesterdayDate()));
});

router.get('/comprar-hoy', (req, res) => {
    const query = getBusinessQuery(`s.repuestos_comprar IS NOT NULL AND s.repuestos_comprar != '' AND s.repuestos_comprados = 0`);
    res.json(db.prepare(query).all());
});

router.get('/stock', (req, res) => {
    const query = getBusinessQuery(`s.pasa_a_stock = 1`);
    res.json(db.prepare(query).all());
});

router.get('/ingresados-ayer', (req, res) => {
    const query = getBusinessQuery(`s.ingreso_taller = 1 AND parse_access_date(s.cita_dia) = ?`);
    res.json(db.prepare(query).all(yesterdayDate()));
});

router.get('/servicios-mes-hechos', (req, res) => {
    const data = db.prepare(`
        SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido
        FROM servicio s
        JOIN clientes c ON s.id_cliente = c.id_cliente
        WHERE strftime('%Y-%m', parse_access_date(s.cita_entrega)) = '2024-02'
          AND s.entregado = 1
          AND s.acepta = 1
        ORDER BY parse_access_date(s.cita_entrega) ASC, s.id_servicio ASC
    `).all();
    res.json(data);
});

router.get('/franja-prod', (req, res) => {
    const d = new Date();
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const data = db.prepare(`
        SELECT SUM(s.presupuesto) as SumaDePresupuesto
        FROM servicio s
        JOIN clientes c ON s.id_cliente = c.id_cliente
        WHERE strftime('%Y-%m', parse_access_date(s.cita_entrega)) = ?
          AND s.entregado = 1
          AND s.acepta = 1
        GROUP BY s.cita_entrega
        ORDER BY parse_access_date(s.cita_entrega) ASC
    `).all(yearMonth);
    res.json(data);
});

router.get('/cuenta-hoy', (req, res) => {
    const targetDate = req.query.date || todayDate();
    const data = db.prepare(`
        SELECT s.id_servicio, s.cita_entrega, s.presupuesto, s.entregado, s.marca_modelo, s.info_logistica, s.arreglado_en_domicilio, s.factura, s.contado,
               c.calle, c.numero_direccion, c.piso, c.depto
        FROM servicio s
        JOIN clientes c ON s.id_cliente = c.id_cliente
        WHERE parse_access_date(s.cita_entrega) = ?
        ORDER BY s.id_servicio ASC
    `).all(targetDate);
    res.json(data);
});

router.get('/calculadora-total', (req, res) => {
    const targetDate = req.query.date || todayDate();
    const row = db.prepare(`
        SELECT COALESCE(SUM(s.presupuesto), 0) as SumaDePresupuesto
        FROM servicio s
        WHERE parse_access_date(s.cita_entrega) = ?
          AND s.contado = 1
    `).get(targetDate);
    res.json(row);
});

router.get('/queonda/total', (req, res) => {
    const row = db.prepare(`SELECT COUNT(*) as total FROM servicio`).get();
    res.json(row);
});

router.get('/queonda/record', (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const row = db.prepare(`
        SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido
        FROM servicio s
        LEFT JOIN clientes c ON s.id_cliente = c.id_cliente
        ORDER BY s.id_servicio ASC
        LIMIT 1 OFFSET ?
    `).get(offset);
    if (!row) return res.status(404).json({ error: 'No record at offset' });
    res.json(row);
});

router.get('/queonda/buscar', (req, res) => {
    const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
    const match = req.query.match || 'any';
    const currentOffset = parseInt(req.query.offset) || 0;
    
    const targetId = parseInt(q);
    if (!isNaN(targetId) && /^\d+$/.test(q)) {
        const rows = db.prepare(`SELECT id_servicio FROM servicio ORDER BY id_servicio ASC`).all();
        const foundIdx = rows.findIndex(r => r.id_servicio === targetId);
        if (foundIdx !== -1) {
            const record = db.prepare(`
                SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido
                FROM servicio s
                LEFT JOIN clientes c ON s.id_cliente = c.id_cliente
                WHERE s.id_servicio = ?
            `).get(targetId);
            return res.json({ offset: foundIdx, record });
        }
    }

    const rows = db.prepare(`SELECT id_servicio FROM servicio ORDER BY id_servicio ASC`).all();
    let foundOffset = -1;
    for (let i = 1; i <= rows.length; i++) {
        const idx = (currentOffset + i) % rows.length;
        const row = db.prepare(`
            SELECT s.*, c.calle, c.numero_direccion
            FROM servicio s
            LEFT JOIN clientes c ON s.id_cliente = c.id_cliente
            WHERE s.id_servicio = ?
        `).get(rows[idx].id_servicio);
        if (!row) continue;
        
        const fields = ['id_servicio', 'fecha', 'aparato', 'marca_modelo', 'desperfecto_usuario', 'servicios_convenidos', 'calle', 'numero_direccion'];
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
        const record = db.prepare(`
            SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido
            FROM servicio s
            LEFT JOIN clientes c ON s.id_cliente = c.id_cliente
            ORDER BY s.id_servicio ASC
            LIMIT 1 OFFSET ?
        `).get(foundOffset);
        res.json({ offset: foundOffset, record });
    } else {
        res.status(404).json({ error: 'No matches found' });
    }
});

// Generic GET /api/servicios
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const data = db.prepare(`SELECT * FROM servicio LIMIT ? OFFSET ?`).all(limit, offset);
    const total = db.prepare(`SELECT COUNT(*) as total FROM servicio`).get().total;
    res.json({ data, total, page, limit });
});

router.get('/:id', (req, res) => {
    const servicio = db.prepare(`SELECT s.*, c.calle, c.numero_direccion, c.depto, c.piso, c.nombre_apellido FROM servicio s JOIN clientes c ON s.id_cliente = c.id_cliente WHERE s.id_servicio = ?`).get(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Not found' });
    res.json(servicio);
});

router.post('/', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO servicio (${fields.join(', ')}) VALUES (${placeholders})`).run(values);
    res.status(201).json({ id_servicio: info.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE servicio SET ${setClause} WHERE id_servicio = ?`).run(...values, req.params.id);
    res.json({ id_servicio: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM servicio WHERE id_servicio = ?`).run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
