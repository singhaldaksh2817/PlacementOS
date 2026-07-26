const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 QUERYING SQLITE TABLES...');

db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
  if (err) {
    console.error(err);
    return;
  }
  
  if (tables.length === 0) {
    console.log('No tables found.');
    return;
  }

  let completed = 0;
  tables.forEach(table => {
    const tableName = table.name;
    // Skip SQLite system tables
    if (tableName.startsWith('sqlite_')) {
      completed++;
      if (completed === tables.length) db.close();
      return;
    }

    db.all(`PRAGMA table_info(${tableName});`, [], (err, columns) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`\n📋 TABLE: ${tableName}`);
        console.log('----------------------------------------------------');
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`);
        });
      }
      completed++;
      if (completed === tables.length) {
        db.close();
      }
    });
  });
});
