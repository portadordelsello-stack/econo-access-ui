#!/usr/bin/env node
/**
 * Migration script: Access (.accdb) → SQLite
 * Uses mdbtools CLI to export CSVs, then imports into SQLite via better-sqlite3.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ACCDB_PATH = path.resolve(__dirname, '../../accdb/EconoServiceDB.accdb');
const DB_PATH = path.resolve(__dirname, 'econoservice.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const CSV_DIR = path.resolve(__dirname, 'csv_export');

// Mapping: Access table name → { sqliteTable, columns mapping }
const TABLE_MAP = [
  {
    access: 'Clientes',
    sqlite: 'clientes',
    columns: {
      'Id cliente': 'id_cliente',
      'Nombre-Apellido': 'nombre_apellido',
      'Localidad': 'localidad',
      'Barrio': 'barrio',
      'Zona': 'zona',
      'Tel fijo': 'tel_fijo',
      'Tel cel': 'tel_cel',
      'Tel cel bis': 'tel_cel_bis',
      'Tel cel otro': 'tel_cel_otro',
      'Calle': 'calle',
      'Numero direccion': 'numero_direccion',
      'Depto': 'depto',
      'Piso': 'piso',
      'Cliente problematico': 'cliente_problematico',
      'problematica de cliente': 'problematica_de_cliente',
    },
  },
  {
    access: 'Colaboradores',
    sqlite: 'colaboradores',
    columns: {
      'Id colaborador': 'id_colaborador',
      'Nombre': 'nombre',
      'dni': 'dni',
      'fecha nacimiento': 'fecha_nacimiento',
      'domicilio': 'domicilio',
    },
  },
  {
    access: 'Servicio',
    sqlite: 'servicio',
    columns: {
      'Id servicio': 'id_servicio',
      'Id cliente': 'id_cliente',
      'Fecha': 'fecha',
      'Aparato': 'aparato',
      'Marca Modelo': 'marca_modelo',
      'Desperfecto Usuario': 'desperfecto_usuario',
      'Cita dia': 'cita_dia',
      'Hora busqueda desde': 'hora_busqueda_desde',
      'Hora busqueda hasta': 'hora_busqueda_hasta',
      'Traer Ver': 'traer_ver',
      'Ingreso Taller': 'ingreso_taller',
      'Reclamo garantia': 'reclamo_garantia',
      'Servicios Requeridos': 'servicios_requeridos',
      'Reseña Interna Servicios': 'resena_interna_servicios',
      'Servicios Convenidos': 'servicios_convenidos',
      'Presupuesto': 'presupuesto',
      'Presup_palabras': 'presup_palabras',
      'Acepta': 'acepta',
      'Rechaza-Devolver': 'rechaza_devolver',
      'Es Reclamo Garantia': 'es_reclamo_garantia',
      'Garantía': 'garantia',
      'Cita entrega': 'cita_entrega',
      'Hora entrega desde': 'hora_entrega_desde',
      'Hora entrega hasta': 'hora_entrega_hasta',
      'Entregado': 'entregado',
      'Pasa a Stock': 'pasa_a_stock',
      'Arreglado en domicilio': 'arreglado_en_domicilio',
      'Repuestos Comprar': 'repuestos_comprar',
      'Repuestos Comprados': 'repuestos_comprados',
      'Llamar': 'llamar',
      'llevar': 'llevar',
      'para cristian': 'para_cristian',
      'terminado': 'terminado',
      'fichaok': 'fichaok',
      'jo': 'jo',
      'factura': 'factura',
      'contado': 'contado',
      'ir': 'ir',
      'ic': 'ic',
      'info logistica': 'info_logistica',
      'tecnico': 'tecnico',
    },
  },
  {
    access: 'ministerio',
    sqlite: 'ministerio',
    columns: {
      'Id ministerio': 'id_ministerio',
      'fecha': 'fecha',
      'entrada': 'entrada',
      'salida': 'salida',
      'entrada bis': 'entrada_bis',
      'salida bis': 'salida_bis',
      'ajuste': 'ajuste',
      'id colaborador': 'id_colaborador',
      'horas hoy': 'horas_hoy',
      'adelanto': 'adelanto',
      'info': 'info',
    },
  },
  {
    access: 'ministerio Diego',
    sqlite: 'ministerio_diego',
    columns: {
      'Id ministerio': 'id_ministerio',
      'fecha': 'fecha',
      'entrada': 'entrada',
      'salida': 'salida',
      'entrada bis': 'entrada_bis',
      'salida bis': 'salida_bis',
      'ajuste': 'ajuste',
      'horas hoy': 'horas_hoy',
      'adelanto': 'adelanto',
    },
  },
  {
    access: 'gastos repuestos',
    sqlite: 'gastos_repuestos',
    columns: {
      'Id': 'id',
      'fecha': 'fecha',
      'parcial': 'parcial',
      'sumar': 'sumar',
      'restar': 'restar',
      'gasto de repuestos': 'gasto_de_repuestos',
      'proveedor': 'proveedor',
      'descripción': 'descripcion',
      'econoservice': 'econoservice',
      'rubro': 'rubro',
      'fa': 'fa',
    },
  },
  {
    access: 'misiones',
    sqlite: 'misiones',
    columns: {
      'Id mision': 'id_mision',
      'mision': 'mision',
      'realizado': 'realizado',
    },
  },
  {
    access: 'placas blue amarilla',
    sqlite: 'placas_blue_amarilla',
    columns: {
      'Id': 'id',
      'codigo': 'codigo',
      'codigo abreviado': 'codigo_abreviado',
      'hardware': 'hardware',
      'software': 'software',
      'marca': 'marca',
      'modelo': 'modelo',
    },
  },
  {
    access: 'prestamo mes anterior',
    sqlite: 'prestamo_mes_anterior',
    columns: {
      'Id': 'id',
      'prestamoMesAnterior': 'prestamo_mes_anterior',
      'fecha': 'fecha',
    },
  },
  {
    access: 'repuestos mega',
    sqlite: 'repuestos_mega',
    columns: {
      'Id': 'id',
      'fecha': 'fecha',
      'repuesto denominación': 'repuesto_denominacion',
      'codigo repuesto': 'codigo_repuesto',
      'codigo proveedor': 'codigo_proveedor',
      'precio': 'precio',
    },
  },
  {
    access: 'caja arranque',
    sqlite: 'caja_arranque',
    columns: {
      'Id': 'id',
      'monto': 'monto',
      'fecha': 'fecha',
    },
  },
  {
    access: 'Tabla1',
    sqlite: 'tabla1',
    columns: {
      'Id': 'id',
      'caja inicial': 'caja_inicial',
    },
  },
  {
    access: 'COMPRAS VARIAS',
    sqlite: 'compras_varias',
    columns: {
      'Id compras': 'id_compras',
      'articulo': 'articulo',
      'realizado': 'realizado',
    },
  },
];

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        fields.push(current);
        current = '';
      } else {
        current += c;
      }
    }
  }
  fields.push(current);
  return fields;
}

// Boolean column names that need 0/1 conversion
const BOOL_COLUMNS = new Set([
  'cliente_problematico', 'ingreso_taller', 'reclamo_garantia', 'acepta',
  'rechaza_devolver', 'es_reclamo_garantia', 'entregado', 'pasa_a_stock',
  'arreglado_en_domicilio', 'repuestos_comprados', 'llamar', 'llevar',
  'para_cristian', 'terminado', 'fichaok', 'jo', 'factura', 'contado',
  'ir', 'ic', 'econoservice', 'fa', 'realizado',
]);

function convertValue(val, colName) {
  if (val === '' || val === undefined || val === null) {
    // Boolean columns must default to 0, not NULL
    if (BOOL_COLUMNS.has(colName)) return 0;
    return null;
  }
  val = val.trim();
  if (val === '') {
    if (BOOL_COLUMNS.has(colName)) return 0;
    return null;
  }

  // Boolean fields: Access exports 0/1
  if (BOOL_COLUMNS.has(colName)) {
    return (val === '1' || val === 'true' || val === 'True') ? 1 : 0;
  }

  // Currency fields: remove trailing zeros format like "1550.0000"
  if (/^-?\d+\.\d{4}$/.test(val)) {
    return parseFloat(val);
  }

  return val;
}

function main() {
  console.log('=== EconoService Migration: Access → SQLite ===\n');

  // Check source file exists
  if (!fs.existsSync(ACCDB_PATH)) {
    console.error(`ERROR: Access file not found at ${ACCDB_PATH}`);
    process.exit(1);
  }

  // Remove old DB if exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Removed existing database.');
  }

  // Create CSV export directory
  if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR, { recursive: true });

  // Initialize SQLite and run schema
  const db = new Database(DB_PATH);
  db.exec('PRAGMA foreign_keys=OFF;'); // Disable FK during migration
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  console.log('Schema created.\n');

  let totalRows = 0;

  for (const table of TABLE_MAP) {
    process.stdout.write(`Migrating "${table.access}" → "${table.sqlite}"... `);

    try {
      // Export CSV from Access
      const csvFile = path.join(CSV_DIR, `${table.sqlite}.csv`);
      execSync(
        `mdb-export "${ACCDB_PATH}" "${table.access}" > "${csvFile}"`,
        { encoding: 'utf8' }
      );

      // Read CSV
      const csvContent = fs.readFileSync(csvFile, 'utf8');
      const lines = csvContent.split('\n').filter((l) => l.trim());

      if (lines.length < 1) {
        console.log('0 rows (empty table)');
        continue;
      }

      // Parse header
      const headerLine = lines[0];
      const accessColumns = parseCSVLine(headerLine);

      // Map Access columns to SQLite columns
      const sqliteColumns = [];
      const columnIndexes = [];
      for (let i = 0; i < accessColumns.length; i++) {
        const accessCol = accessColumns[i].replace(/^"|"$/g, '').trim();
        const sqliteCol = table.columns[accessCol];
        if (sqliteCol) {
          sqliteColumns.push(sqliteCol);
          columnIndexes.push(i);
        }
      }

      if (sqliteColumns.length === 0) {
        console.log('SKIPPED (no matching columns)');
        continue;
      }

      // Prepare INSERT statement
      const placeholders = sqliteColumns.map(() => '?').join(',');
      const insertSQL = `INSERT INTO ${table.sqlite} (${sqliteColumns.join(',')}) VALUES (${placeholders})`;
      const stmt = db.prepare(insertSQL);

      // Insert rows individually to handle errors gracefully
      let inserted = 0;
      let skipped = 0;

      const insertRow = db.transaction((values) => {
        stmt.run(...values);
      });

      for (let i = 1; i < lines.length; i++) {
        const fields = parseCSVLine(lines[i]);
        if (fields.length < sqliteColumns.length) continue;
        const values = columnIndexes.map((colPos, arrIdx) =>
          convertValue(fields[colPos], sqliteColumns[arrIdx])
        );
        try {
          insertRow(values);
          inserted++;
        } catch (err) {
          skipped++;
          if (skipped <= 3) {
            console.log(`\n  Row ${i} error: ${err.message}`);
            console.log(`  Values: ${JSON.stringify(values).slice(0, 200)}`);
          }
        }
      }

      const dataRows = { length: inserted };
      console.log(`${dataRows.length} rows`);
      totalRows += dataRows.length;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  // Verify counts
  console.log('\n=== Verification ===');
  for (const table of TABLE_MAP) {
    const row = db.prepare(`SELECT COUNT(*) as cnt FROM ${table.sqlite}`).get();
    console.log(`  ${table.sqlite}: ${row.cnt} rows`);
  }

  console.log(`\nTotal rows migrated: ${totalRows}`);
  console.log(`Database saved to: ${DB_PATH}`);

  db.close();

  // Cleanup CSV exports
  fs.rmSync(CSV_DIR, { recursive: true, force: true });
  console.log('CSV exports cleaned up.');
  console.log('\n✅ Migration complete!');
}

main();
