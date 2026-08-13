const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'econoservice.db');
const db = new Database(dbPath);

// Register a function to parse Access dates ('MM/DD/YY HH:MM:SS') into sortable YYYY-MM-DD
db.function('parse_access_date', (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split(' ');
    const datePart = parts[0];
    const [m, d, y] = datePart.split('/');
    if (!m || !d || !y) return dateStr;
    const year = y.length === 2 ? '20' + y : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
});

module.exports = db;
