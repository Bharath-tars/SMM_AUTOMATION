const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Database connection
let db;

/**
 * Initialize the database connection
 * @returns {Promise<object>} Database connection
 */
async function initDatabase() {
  if (db) {
    return db;
  }

  // Open database
  db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  });

  return db;
}

module.exports = {
  initDatabase,
  get db() {
    if (!db) {
      throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
  }
};