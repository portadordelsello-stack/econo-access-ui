-- EconoService SQLite Schema
-- Migrado desde EconoServiceDB.accdb

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INTEGER PRIMARY KEY,
  nombre_apellido TEXT,
  localidad TEXT,
  barrio TEXT,
  zona TEXT,
  tel_fijo TEXT,
  tel_cel TEXT,
  tel_cel_bis TEXT,
  tel_cel_otro TEXT,
  calle TEXT,
  numero_direccion TEXT,
  depto TEXT,
  piso TEXT,
  cliente_problematico INTEGER NOT NULL DEFAULT 0,
  problematica_de_cliente TEXT
);

CREATE TABLE IF NOT EXISTS colaboradores (
  id_colaborador INTEGER PRIMARY KEY,
  nombre TEXT,
  dni TEXT,
  fecha_nacimiento TEXT,
  domicilio TEXT
);

CREATE TABLE IF NOT EXISTS servicio (
  id_servicio INTEGER PRIMARY KEY,
  id_cliente INTEGER,
  fecha TEXT,
  aparato TEXT,
  marca_modelo TEXT,
  desperfecto_usuario TEXT,
  cita_dia TEXT,
  hora_busqueda_desde TEXT,
  hora_busqueda_hasta TEXT,
  traer_ver TEXT,
  ingreso_taller INTEGER NOT NULL DEFAULT 0,
  reclamo_garantia INTEGER NOT NULL DEFAULT 0,
  servicios_requeridos TEXT,
  resena_interna_servicios TEXT,
  servicios_convenidos TEXT,
  presupuesto REAL DEFAULT 0,
  presup_palabras TEXT,
  acepta INTEGER NOT NULL DEFAULT 0,
  rechaza_devolver INTEGER NOT NULL DEFAULT 0,
  es_reclamo_garantia INTEGER NOT NULL DEFAULT 0,
  garantia TEXT,
  cita_entrega TEXT,
  hora_entrega_desde TEXT,
  hora_entrega_hasta TEXT,
  entregado INTEGER NOT NULL DEFAULT 0,
  pasa_a_stock INTEGER NOT NULL DEFAULT 0,
  arreglado_en_domicilio INTEGER NOT NULL DEFAULT 0,
  repuestos_comprar TEXT,
  repuestos_comprados INTEGER NOT NULL DEFAULT 0,
  llamar INTEGER NOT NULL DEFAULT 0,
  llevar INTEGER NOT NULL DEFAULT 0,
  para_cristian INTEGER NOT NULL DEFAULT 0,
  terminado INTEGER NOT NULL DEFAULT 0,
  fichaok INTEGER NOT NULL DEFAULT 0,
  jo INTEGER NOT NULL DEFAULT 0,
  factura INTEGER NOT NULL DEFAULT 0,
  contado INTEGER NOT NULL DEFAULT 0,
  ir INTEGER NOT NULL DEFAULT 0,
  ic INTEGER NOT NULL DEFAULT 0,
  info_logistica TEXT,
  tecnico TEXT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE IF NOT EXISTS ministerio (
  id_ministerio INTEGER PRIMARY KEY,
  fecha TEXT,
  entrada TEXT,
  salida TEXT,
  entrada_bis TEXT,
  salida_bis TEXT,
  ajuste TEXT,
  id_colaborador INTEGER,
  horas_hoy INTEGER,
  adelanto REAL DEFAULT 0,
  info TEXT,
  FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador)
);

CREATE TABLE IF NOT EXISTS ministerio_diego (
  id_ministerio INTEGER PRIMARY KEY,
  fecha TEXT,
  entrada TEXT,
  salida TEXT,
  entrada_bis TEXT,
  salida_bis TEXT,
  ajuste TEXT,
  horas_hoy INTEGER,
  adelanto REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gastos_repuestos (
  id INTEGER PRIMARY KEY,
  fecha TEXT,
  parcial REAL,
  sumar REAL,
  restar REAL,
  gasto_de_repuestos REAL,
  proveedor TEXT,
  descripcion TEXT,
  econoservice INTEGER NOT NULL DEFAULT 0,
  rubro TEXT,
  fa INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS misiones (
  id_mision INTEGER PRIMARY KEY,
  mision TEXT,
  realizado INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS placas_blue_amarilla (
  id INTEGER PRIMARY KEY,
  codigo TEXT,
  codigo_abreviado TEXT,
  hardware TEXT,
  software TEXT,
  marca TEXT,
  modelo TEXT
);

CREATE TABLE IF NOT EXISTS prestamo_mes_anterior (
  id INTEGER PRIMARY KEY,
  prestamo_mes_anterior REAL,
  fecha TEXT
);

CREATE TABLE IF NOT EXISTS repuestos_mega (
  id INTEGER PRIMARY KEY,
  fecha TEXT,
  repuesto_denominacion TEXT,
  codigo_repuesto TEXT,
  codigo_proveedor TEXT,
  precio REAL
);

CREATE TABLE IF NOT EXISTS caja_arranque (
  id INTEGER PRIMARY KEY,
  monto INTEGER,
  fecha TEXT
);

CREATE TABLE IF NOT EXISTS tabla1 (
  id INTEGER PRIMARY KEY,
  caja_inicial REAL
);

CREATE TABLE IF NOT EXISTS compras_varias (
  id_compras INTEGER PRIMARY KEY,
  articulo TEXT,
  realizado INTEGER NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_servicio_id_cliente ON servicio(id_cliente);
CREATE INDEX IF NOT EXISTS idx_servicio_fecha ON servicio(fecha);
CREATE INDEX IF NOT EXISTS idx_servicio_cita_dia ON servicio(cita_dia);
CREATE INDEX IF NOT EXISTS idx_servicio_cita_entrega ON servicio(cita_entrega);
CREATE INDEX IF NOT EXISTS idx_servicio_ingreso_taller ON servicio(ingreso_taller);
CREATE INDEX IF NOT EXISTS idx_servicio_acepta ON servicio(acepta);
CREATE INDEX IF NOT EXISTS idx_servicio_entregado ON servicio(entregado);
CREATE INDEX IF NOT EXISTS idx_servicio_terminado ON servicio(terminado);
CREATE INDEX IF NOT EXISTS idx_servicio_llevar ON servicio(llevar);
CREATE INDEX IF NOT EXISTS idx_servicio_pasa_a_stock ON servicio(pasa_a_stock);
CREATE INDEX IF NOT EXISTS idx_ministerio_id_colaborador ON ministerio(id_colaborador);
CREATE INDEX IF NOT EXISTS idx_ministerio_fecha ON ministerio(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos_repuestos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_rubro ON gastos_repuestos(rubro);
CREATE INDEX IF NOT EXISTS idx_clientes_calle ON clientes(calle);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre_apellido);
